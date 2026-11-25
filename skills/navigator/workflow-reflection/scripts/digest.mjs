#!/usr/bin/env node
// Cuts Claude Code session transcripts down to digests a reading agent can get
// through: what the person typed, the last thing Claude said before each of
// their messages, and a header of dates, models, tokens, skills and sub-agents.
//
// Writes one <workspace>__<date>__<session>.md per main session, plus:
//   index.tsv  one row per session, with its digest size and token totals
//   usage.tsv  one row per session, scope (main or sub), model and effort
//
// Workspace labels are the project folder names with their shared prefix cut
// off, so sibling worktrees of one repo read as short names. --strip overrides
// the cut with a prefix of your own.
//
// Exits 0 once the digests are written, 2 on bad usage.

import { existsSync, mkdirSync, readdirSync, readFileSync, realpathSync, statSync, writeFileSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import { homedir } from "node:os";
import { fileURLToPath } from "node:url";

const USAGE = `usage: digest.mjs <out dir> <project dir or glob>... [--user LABEL] [--branch NAME]
                  [--since YYYY-MM-DD] [--until YYYY-MM-DD] [--strip PREFIX]`;
const HUMAN_MAX = 2500;
const REPLY_MAX = 900;
const TOKEN_KEYS = ["input_tokens", "cache_creation_input_tokens", "cache_read_input_tokens", "output_tokens"];

function strip(text) {
  return text
    .replace(/<system_instruction>[\s\S]*?<\/system_instruction>/g, "")
    .replace(/<system-reminder>[\s\S]*?<\/system-reminder>/g, "")
    .replace(/<user-preferences>[\s\S]*?<\/user-preferences>/g, "")
    .trim();
}

// Counts code points rather than UTF-16 units, so an emoji is one character.
function clip(text, max) {
  const t = [...text.trim()];
  return t.length <= max ? t.join("") : `${t.slice(0, max).join("")} […+${t.length - max} chars]`;
}

function readRows(path) {
  const rows = [];
  for (const line of readFileSync(path, "utf8").split("\n")) {
    if (!line.trim().startsWith("{")) continue;
    try {
      rows.push(JSON.parse(line));
    } catch {
      // A half-written last line is normal in a live session.
    }
  }
  return rows;
}

function emptyTotals() {
  return { calls: 0, ...Object.fromEntries(TOKEN_KEYS.map((k) => [k, 0])) };
}

// Adds one transcript's token use to `totals`, keyed by scope, model and effort.
// `seen` drops the duplicate rows a streamed reply writes under one message id.
function addUsage(rows, scope, totals, seen) {
  for (const r of rows) {
    if (r.type !== "assistant") continue;
    const m = r.message ?? {};
    const id = m.id ?? r.requestId;
    if (seen.has(id)) continue;
    seen.add(id);
    const model = m.model ?? "?";
    if (model === "<synthetic>") continue;
    const t = (totals[`${scope}\t${model}\t${r.effort ?? "-"}`] ??= emptyTotals());
    t.calls += 1;
    for (const k of TOKEN_KEYS) t[k] += m.usage?.[k] ?? 0;
  }
}

function humanText(r) {
  const c = r.message?.content;
  if (typeof c === "string") return c;
  if (!Array.isArray(c)) return null;
  if (c.some((i) => i?.type === "tool_result")) return null;
  return c
    .filter((i) => i?.type === "text")
    .map((i) => i.text ?? "")
    .join("\n");
}

function count(list) {
  const out = {};
  for (const x of list) if (x != null) out[x] = (out[x] ?? 0) + 1;
  return out;
}

function top(counts, n) {
  return Object.fromEntries(Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, n));
}

function digest(path, branchFilter) {
  const rows = readRows(path);
  const branches = count(rows.map((r) => r.gitBranch));
  if (branchFilter && !branches[branchFilter]) return null;
  const stamps = rows.map((r) => r.timestamp).filter(Boolean).sort();
  const tools = [];
  const skills = [];
  const agents = [];
  const convo = [];
  let lastReply = null;
  let compactions = 0;
  for (const r of rows) {
    if (r.type === "user" && !r.isMeta && !r.isSidechain) {
      if (r.isCompactSummary) {
        compactions += 1;
        continue;
      }
      const raw = humanText(r);
      if (raw == null) continue;
      const h = strip(raw);
      if (!h || h.startsWith("<local-command") || h.startsWith("Caveat:")) continue;
      if (h.startsWith("This session is being continued")) {
        compactions += 1;
        continue;
      }
      if (lastReply) convo.push(["CLAUDE", clip(lastReply, REPLY_MAX)]);
      lastReply = null;
      convo.push(["USER", clip(h, HUMAN_MAX)]);
    } else if (r.type === "assistant" && !r.isSidechain) {
      for (const b of r.message?.content ?? []) {
        if (b.type === "text" && b.text?.trim()) lastReply = b.text;
        if (b.type !== "tool_use") continue;
        tools.push(b.name);
        if (b.name === "Skill") skills.push(b.input?.skill);
        if (b.name === "Agent") agents.push(`${b.input?.subagent_type ?? "general"}/${b.input?.model ?? "inherit"}`);
      }
    }
  }
  if (lastReply) convo.push(["CLAUDE", clip(lastReply, REPLY_MAX)]);

  const totals = {};
  const seen = new Set();
  addUsage(rows, "main", totals, seen);
  const subDir = join(path.slice(0, -".jsonl".length), "subagents");
  const subFiles = existsSync(subDir) ? readdirSync(subDir).filter((f) => f.endsWith(".jsonl")) : [];
  for (const f of subFiles) addUsage(readRows(join(subDir, f)), "sub", totals, seen);

  return {
    title: rows.find((r) => r.type === "ai-title")?.aiTitle ?? "",
    prs: [...new Set(rows.filter((r) => r.type === "pr-link").map((r) => r.prUrl))].sort(),
    start: stamps[0] ?? "",
    end: stamps.at(-1) ?? "",
    branches: top(branches, 3),
    efforts: count(rows.filter((r) => r.type === "assistant").map((r) => r.effort)),
    tools: top(count(tools), 12),
    skills: count(skills),
    agents: count(agents),
    nSub: subFiles.length,
    compactions,
    totals,
    convo,
  };
}

// Sums the totals per model, for one scope or for both.
function byModel(totals, scope) {
  const out = {};
  for (const [key, t] of Object.entries(totals)) {
    const [s, model] = key.split("\t");
    if (scope && s !== scope) continue;
    const o = (out[model] ??= emptyTotals());
    o.calls += t.calls;
    for (const k of TOKEN_KEYS) o[k] += t[k];
  }
  return out;
}

function fmtTokens(models) {
  const n = (x) => x.toLocaleString("en-US");
  return Object.entries(models)
    .sort()
    .map(
      ([m, t]) =>
        `- ${m}: calls ${t.calls}, out ${n(t.output_tokens)}, cache_read ${n(t.cache_read_input_tokens)}, ` +
        `cache_write ${n(t.cache_creation_input_tokens)}, in ${n(t.input_tokens)}`,
    )
    .join("\n");
}

function fmtObj(o) {
  return `{${Object.entries(o)
    .map(([k, v]) => `'${k}': ${v}`)
    .join(", ")}}`;
}

// Expands a star in the last path segment, which is the only shape a project
// folder pattern takes. A pattern with no star is taken as one folder.
function expand(pattern) {
  const p = pattern.replace(/^~(?=\/|$)/, homedir());
  if (!p.includes("*")) return existsSync(p) ? [resolve(p)] : [];
  const dir = p.slice(0, p.lastIndexOf("/"));
  const glob = p.slice(dir.length + 1).replace(/[.+?^${}()|[\]\\]/g, "\\$&").replaceAll("*", ".*");
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => new RegExp(`^${glob}$`).test(f) && statSync(join(dir, f)).isDirectory())
    .map((f) => join(dir, f))
    .sort();
}

// One folder has no siblings to share a prefix with, so its sessions take the
// label "main" unless --strip says otherwise.
function sharedPrefix(names) {
  if (names.length < 2) return names[0] ?? "";
  let p = names[0];
  for (const n of names) while (!n.startsWith(p)) p = p.slice(0, -1);
  return p.slice(0, p.lastIndexOf("-") + 1);
}

function main(argv) {
  const opts = { user: "USER", branch: null, since: null, until: null, strip: null };
  const positional = [];
  for (let i = 0; i < argv.length; i++) {
    const flag = argv[i].startsWith("--") ? argv[i].slice(2) : null;
    if (flag && flag in opts) opts[flag] = argv[++i];
    else positional.push(argv[i]);
  }
  const [out, ...patterns] = positional;
  if (!out || !patterns.length) {
    console.error(USAGE);
    return 2;
  }
  const projects = [...new Set(patterns.flatMap(expand))];
  if (!projects.length) {
    console.error(`no project folder matched: ${patterns.join(" ")}`);
    return 2;
  }
  const prefix = opts.strip ?? sharedPrefix(projects.map((p) => basename(p)));
  mkdirSync(out, { recursive: true });

  const index = [
    "workspace\tsession\ttitle\tstart\tend\tuser_msgs\tdigest_chars\tsubagents\tmodels\tout_tokens\tcache_read\tcache_write\tprs",
  ];
  const usage = ["workspace\tsession\tstart\tscope\tmodel\teffort\tcalls\tinput\tcache_write\tcache_read\toutput"];
  for (const proj of projects) {
    const name = basename(proj);
    const ws = (name.startsWith(prefix) ? name.slice(prefix.length) : name).replace(/^-+/, "") || "main";
    for (const f of readdirSync(proj).filter((x) => x.endsWith(".jsonl")).sort()) {
      const d = digest(join(proj, f), opts.branch);
      if (!d || !d.convo.length) continue;
      const day = d.start.slice(0, 10);
      if (opts.since && day < opts.since) continue;
      if (opts.until && day > opts.until) continue;
      const sid = f.slice(0, 8);
      const all = byModel(d.totals);
      const text = [
        `# ${ws} / ${sid} — ${d.title}`,
        `start ${d.start} · end ${d.end} · branches ${fmtObj(d.branches)} · compactions ${d.compactions}`,
        `PRs: ${d.prs.join(", ") || "none"}`,
        `effort: ${fmtObj(d.efforts)} · skills: ${fmtObj(d.skills)} · subagents spawned: ${fmtObj(d.agents)} (${d.nSub} files)`,
        `tools: ${fmtObj(d.tools)}`,
        "tokens (main session only):",
        fmtTokens(byModel(d.totals, "main")),
        "tokens (incl. subagents):",
        fmtTokens(all),
        "",
        ...d.convo.map(([who, said]) => `**${who === "USER" ? opts.user : who}:** ${said}\n`),
      ].join("\n");
      writeFileSync(join(out, `${ws}__${day}__${sid}.md`), text);
      const sum = (k) => Object.values(all).reduce((a, t) => a + t[k], 0);
      const userMsgs = d.convo.filter(([w]) => w === "USER").length;
      index.push(
        [ws, sid, d.title, d.start, d.end, userMsgs, [...text].length, d.nSub, Object.keys(all).sort().join(","),
          sum("output_tokens"), sum("cache_read_input_tokens"), sum("cache_creation_input_tokens"), d.prs.join(" ")].join("\t"),
      );
      for (const [key, t] of Object.entries(d.totals)) {
        usage.push([ws, sid, d.start, key, t.calls, t.input_tokens, t.cache_creation_input_tokens,
          t.cache_read_input_tokens, t.output_tokens].join("\t"));
      }
    }
  }
  writeFileSync(join(out, "index.tsv"), index.join("\n") + "\n");
  writeFileSync(join(out, "usage.tsv"), usage.join("\n") + "\n");
  console.log(`${index.length - 1} sessions from ${projects.length} project folders -> ${out}`);
  return 0;
}

// Compares REAL paths: an installed skill is reached through a symlink, so the
// typed entry path and import.meta.url only match once both are resolved.
function invokedDirectly(moduleUrl) {
  try {
    return realpathSync(process.argv[1]) === realpathSync(fileURLToPath(moduleUrl));
  } catch {
    return false;
  }
}

if (invokedDirectly(import.meta.url)) process.exit(main(process.argv.slice(2)));
