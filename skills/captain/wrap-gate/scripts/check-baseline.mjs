#!/usr/bin/env node
// Run a project's checks in parallel and print one plain-language line per check,
// compared against a recorded baseline. The output addresses a designer, so the agent
// can paste it into the report without translating it.
//
// The script looks for config in this order:
//   1. The repo's host file in the designer's brain, found through captain.json as
//      references/captain-lookup.md describes, reading its "checks" object
//        { "checks": { "cwd": "app",                   // optional, relative to the repo root
//                      "lint": { "cmd": "npm run lint", "baseline": 5, "cwd": "." }, ... } }
//   2. Walking up from cwd: <project>/.agents/host.json, the in-repo fallback, read the same way
//      and only up to the git root, then <project>/.claude/checks-baseline.json, with the checks
//      one level deeper
//        { "cwd": "app", "checks": { ... } }
//   A check's own "cwd" overrides the top-level one. Both are relative to the config's project root:
//   the products entry's path for a host file in the brain, and the host file's grandparent or the
//   baseline file's grandparent for the other two.
// Without either, the script runs package.json's typecheck, lint, test and format scripts against
// a baseline of 0, and says so.
//
// --record writes the counts back into whichever file it read and leaves every other key alone.
// The host file carries answers no check produced, and a rewrite that dropped them would delete the
// repo's whole configuration.
//
// Usage: node check-baseline.mjs [--record]
import { spawn } from "node:child_process";
import { existsSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { basename, delimiter, dirname, isAbsolute, join, relative, resolve } from "node:path";

const RECORD = process.argv.includes("--record");

const LOOKUP_URL = "https://github.com/phildesignsthings/captain-phil/blob/main/captain/README.md";

// The nearest folder at or above `dir` that holds `.git`, or null outside a repo.
function findGitRoot(dir) {
  for (;;) {
    if (existsSync(join(dir, ".git"))) return dir;
    const up = dirname(dir);
    if (up === dir) return null;
    dir = up;
  }
}

function readJson(path) {
  try {
    return { value: JSON.parse(readFileSync(path, "utf8")) };
  } catch (error) {
    return { error: error.message };
  }
}

// True where `child` is `parent` or sits inside it. Both sides are real paths, because a skill
// installed under a symlinked folder otherwise never matches its products entry.
function inside(child, parent) {
  const rel = relative(parent, child);
  return rel === "" || (!rel.startsWith("..") && !isAbsolute(rel));
}

function real(path) {
  return existsSync(path) ? realpathSync(path) : resolve(path);
}

// Steps 1 to 3 of references/captain-lookup.md. Returns { config } where the brain settles it (a
// config, or null for "no host answers, run the fallback"), or { repoHost: true } where the lookup
// falls back to the repo's own .agents/host.json. Every line the lookup prints goes into `notes`.
function findBrainConfig(start, notes) {
  const home = homedir();
  const gitRoot = findGitRoot(start);
  // `named` marks a folder the designer pointed at, where a missing index is worth a line. The
  // working directory and its git root are only places to look.
  const candidates = [start, gitRoot].filter(Boolean).map((d) => ({ dir: d, named: false }));
  if (process.env.CAPTAIN_BRAIN) candidates.push({ dir: process.env.CAPTAIN_BRAIN, named: true });
  const pointer = join(home, ".claude", "captain.json");
  if (existsSync(pointer)) {
    const p = readJson(pointer);
    if (p.value?.brain) candidates.push({ dir: p.value.brain.replace(/^~(?=\/)/, home), named: true });
  }
  let index = null;
  for (const { dir, named } of candidates) {
    if (existsSync(join(dir, "captain.json"))) {
      index = join(dir, "captain.json");
      break;
    }
    if (named) notes.push(`${dir} holds no captain.json.`);
  }
  if (!index) return { repoHost: true, brain: null };

  const brain = dirname(index);
  const parsed = readJson(index);
  if (parsed.error) {
    notes.push(`${index} is not valid JSON (${parsed.error}), so no host file is read.`);
    return { config: null };
  }
  const at = (p) => real(p.startsWith("~/") ? join(home, p.slice(2)) : resolve(brain, p));
  const products = parsed.value.products;
  if (products === null) {
    notes.push(`${index} manages no product repos, so no host file is read.`);
    return { config: null };
  }
  const list = Array.isArray(products) ? products.filter((p) => p && typeof p.path === "string") : [];
  const here = real(start);
  let entry = list
    .filter((p) => inside(here, at(p.path)))
    .sort((a, b) => at(b.path).length - at(a.path).length)[0];
  if (!entry && inside(here, real(brain))) {
    if (list.length === 1) entry = list[0];
    else {
      notes.push(
        list.length
          ? `${index} lists several products and none holds ${start}; name the product repo to check.`
          : `${index} lists no product repo yet, so no host file is read.`,
      );
      return { config: null };
    }
  }
  if (!entry) return { repoHost: true, brain: index };

  if (!("host" in entry))
    return {
      repoHost: true,
      brain: index,
      noHost: `The \`${entry.name}\` entry in ${index} has no \`host\`, so this skill has no host answers and runs its fallbacks.`,
    };
  if (entry.host === null) {
    notes.push(`The \`${entry.name}\` entry in ${index} sets \`host: null\`, so this repo has no host answers.`);
    return { config: null };
  }
  const host = at(entry.host);
  if (!existsSync(host)) {
    notes.push(`${host} does not exist, so every host slot reads as absent.`);
    return { config: null };
  }
  const h = readJson(host);
  if (!h.error && "checks" in h.value)
    return { config: { path: host, kind: "host", root: at(entry.path), checks: h.value.checks } };
  return { config: null };
}

// Returns { path, kind, root } or null, plus `checks` for a host file. `kind` says where the checks
// sit in the parsed file, and `root` is the directory every relative cwd resolves against. In each
// directory the host file wins over the legacy one, so migrating a repo is one file move. With
// `repoHost` false the brain has already answered, and the repo's own host file is not read.
function findConfig(dir, repoHost) {
  // The in-repo host file belongs to the repo, so the walk for it stops at the git root, and a
  // folder in no repo is looked in alone.
  const gitRoot = findGitRoot(dir);
  let hostStop = repoHost ? dir : null;
  for (;;) {
    const host = join(dir, ".agents", "host.json");
    if (hostStop && existsSync(host)) {
      try {
        const parsed = JSON.parse(readFileSync(host, "utf8"));
        // `checks: null` is an answer, meaning the repo runs no automated checks, so it stops the
        // search. Only an absent key means nobody answered. Falling back on a null would ask the
        // repo a question it has already answered.
        if ("checks" in parsed)
          return { path: host, kind: "host", root: dir, checks: parsed.checks };
      } catch {
        // Reporting a malformed host file is another tool's job, so fall through to the
        // legacy file rather than exit on its syntax error.
      }
    }
    const legacy = join(dir, ".claude", "checks-baseline.json");
    if (existsSync(legacy))
      return { path: legacy, kind: "legacy", root: dir };
    if (hostStop && (!gitRoot || dir === gitRoot)) hostStop = null;
    const up = dirname(dir);
    if (up === dir) return null;
    dir = up;
  }
}

function lookupConfig(start) {
  const notes = [];
  const brain = findBrainConfig(start, notes);
  if (brain.config) return { config: brain.config, notes };
  const config = findConfig(start, Boolean(brain.repoHost));
  if (config?.kind === "host")
    notes.push(
      `Read this repo's \`.agents/host.json\`. A later release stops reading it there: move it into ` +
        `your brain and list the repo in \`captain.json\` (${LOOKUP_URL}).`,
    );
  else if (brain.noHost) notes.push(brain.noHost);
  else if (brain.repoHost && !brain.brain)
    notes.push(
      `No \`captain.json\` found, so this skill has no host answers and runs its fallbacks. ` +
        `To set one up, see ${LOOKUP_URL}.`,
    );
  return { config, notes };
}

// Keys in a "checks" block that are settings rather than checks. A host file's "checks" carries
// "cwd" beside the checks, so the script removes the settings instead of listing the check labels.
// A label added to the schema then needs no edit here.
const NOT_A_CHECK = new Set(["cwd"]);

function findPackageRoot(dir) {
  for (;;) {
    if (existsSync(join(dir, "package.json"))) return dir;
    const up = dirname(dir);
    if (up === dir) return null;
    dir = up;
  }
}

const { config, notes: lookupNotes } = lookupConfig(process.cwd());
for (const line of lookupNotes) console.log(line);
const configPath = config?.path ?? null;
let cwd, checks, note;
if (config?.kind === "host" && config.checks === null) {
  console.log(
    `${configPath} sets \`checks: null\`, so this project runs no automated checks. Nothing to run.`,
  );
  process.exit(0);
} else if (config) {
  const cfg = JSON.parse(readFileSync(configPath, "utf8"));
  const block = config.kind === "host" ? cfg.checks : cfg;
  cwd = resolve(config.root, block.cwd ?? ".");
  checks = Object.fromEntries(
    Object.entries(config.kind === "host" ? block : block.checks)
      .filter(([label, c]) => !NOT_A_CHECK.has(label) && c && c.cmd),
  );
  if (!Object.keys(checks).length) {
    console.log(`${configPath} declares no checks. Nothing to run.`);
    process.exit(0);
  }
} else {
  cwd = findPackageRoot(process.cwd());
  if (!cwd) {
    console.log("No checks-baseline.json and no package.json found. Nothing to run.");
    process.exit(2);
  }
  const scripts = JSON.parse(readFileSync(join(cwd, "package.json"), "utf8")).scripts ?? {};
  checks = {};
  for (const name of ["typecheck", "lint", "test", "format"]) {
    if (scripts[name]) checks[name] = { cmd: `npm run ${name}`, baseline: 0 };
  }
  note = "No recorded baseline. Every count is compared against 0; run with --record to keep today's numbers.";
}

// A missing node_modules matters only where the manifest declares something to
// install. A repo with no dependencies has nothing to install, and refusing to
// run its checks would block the gate over a folder it never needed.
const manifest = existsSync(join(cwd, "package.json"))
  ? JSON.parse(readFileSync(join(cwd, "package.json"), "utf8"))
  : {};
const declaresDependencies = ["dependencies", "devDependencies", "optionalDependencies"].some(
  (key) => Object.keys(manifest[key] ?? {}).length,
);
if (declaresDependencies && !existsSync(join(cwd, "node_modules"))) {
  console.log(`Dependencies are not installed in ${cwd}. Run \`npm ci\` there, then rerun.`);
  process.exit(2);
}

// Reads a tool's own summary line first and falls back to counting error lines, so a tool that
// prints no summary still yields a number rather than a crash.
function count(output, exitCode) {
  const m =
    output.match(/✖ \d+ problems? \((\d+) errors?/) || // eslint
    output.match(/Found (\d+) errors?/) || // tsc
    output.match(/Tests\s+(\d+) failed/) || // vitest
    output.match(/(\d+) failing/); // mocha / jest
  if (m) return Number(m[1]);
  if (/Tests\s+\d+ passed/.test(output) || /No ESLint warnings or errors/.test(output)) return 0;
  const lines = output.split("\n").filter((l) => /\berror\b/i.test(l) && !/0 errors?/.test(l)).length;
  if (lines) return lines;
  return exitCode === 0 ? 0 : 1;
}

// Every node_modules/.bin from the check's directory up to the filesystem root, nearest first. npm
// scripts get these on PATH for free; a bare `tsc -b` spawned from here does not, and fails with
// "command not found" in every repo that installs TypeScript locally rather than globally.
function binPath(dir) {
  const bins = [];
  for (;;) {
    const bin = join(dir, "node_modules", ".bin");
    if (existsSync(bin)) bins.push(bin);
    const up = dirname(dir);
    if (up === dir) return bins;
    dir = up;
  }
}

// A command that never started reports no issues, only its own absence. Counting its error lines
// turns "npm test has no script" into "5 NEW issues", which sends the reader after bugs that do not
// exist.
//
// Returns null where the check ran, or { bin, line }: the name the shell could not find, or null
// where no shell line names one, and the output line that says so. The name matters because
// `npm run lint` failing on a missing `prettier` inside the script is an install to do, not a
// host-file entry to fix, and the report has to tell those two apart.
const NOT_FOUND = [
  /^(?:\/bin\/)?(?:ba|da)?sh: (?:line )?(?:\d+: )?([^\s:]+): (?:command )?not found/, // sh, bash, dash
  /^zsh: command not found: (\S+)/,
  /^'([^']+)' is not recognized as an internal or external command/, // cmd.exe
];

function didNotRun(out, code) {
  const lines = out.split("\n").map((l) => l.trim());
  const script = lines.find((l) => /^npm (error|ERR!) Missing script/.test(l));
  if (script) return { bin: null, line: script };
  for (const line of lines) {
    for (const re of NOT_FOUND) {
      const m = line.match(re);
      if (m) return { bin: m[1], line };
    }
  }
  return code === 127 ? { bin: null, line: lines.find(Boolean) ?? "" } : null;
}

function run(label, cmd, dir) {
  return new Promise((done) => {
    const PATH = [...binPath(dir), process.env.PATH].filter(Boolean).join(delimiter);
    const env = { ...process.env, PATH, FORCE_COLOR: "0", CI: "1" };
    const child = spawn(cmd, { cwd: dir, shell: true, env });
    let out = "";
    child.stdout.on("data", (d) => (out += d));
    child.stderr.on("data", (d) => (out += d));
    // `tsc -b` colours its output whatever FORCE_COLOR says, and escape codes pasted into a report
    // read as noise.
    child.on("close", () => (out = out.replace(/\x1b\[[0-9;]*m/g, "")));
    child.on("close", (code) =>
      done({ label, cmd, code, out, count: count(out, code), missing: didNotRun(out, code) }),
    );
  });
}

const results = await Promise.all(Object.entries(checks).map(([label, c]) =>
    run(label, c.cmd, c.cwd && config ? resolve(config.root, c.cwd) : cwd),
  ),);

const phrase = { typecheck: "Types", lint: "Lint", test: "Tests", format: "Formatting", guard: "Repo guard" };
let worst = 0;
for (const r of results) {
  const base = checks[r.label].baseline ?? 0;
  const name = phrase[r.label] ?? r.label;
  let line;
  if (r.missing) {
    const { bin, line: evidence } = r.missing;
    if (bin && bin !== basename(r.cmd.trim().split(/\s+/)[0])) {
      line = `${name}: did not run. \`${r.cmd}\` calls \`${bin}\`, which is not installed; install it, or take it out of the script.`;
    } else {
      line = `${name}: did not run. \`${r.cmd}\` is not a command this project has; fix or remove \`checks.${r.label}\` in ${configPath ?? "the host file"}.`;
    }
    console.log(line);
    console.log("    " + evidence);
    worst = Math.max(worst, 1);
    continue;
  }
  // A missing package shows as an unresolved bare specifier. A path alias or a relative import that
  // fails to resolve — `@/global.css` under TypeScript 6, say — is a config gap that `npm ci` will
  // not fix, so it is counted as an ordinary issue.
  if (/unresolved|Cannot find module '(?![./]|@\/|~\/)/i.test(r.out) && r.count > base) {
    line = `${name}: ${r.count} errors, and some are missing packages. Run \`npm ci\` in ${cwd} and rerun before reading these.`;
    worst = Math.max(worst, 1);
  } else if (r.count === 0 && base === 0) line = `${name}: clean.`;
  else if (r.count === base) line = `${name}: ${base} known issue${base === 1 ? "" : "s"}, none new.`;
  else if (r.count > base) {
    line = `${name}: ${r.count - base} NEW issue${r.count - base === 1 ? "" : "s"} (${r.count} total, baseline ${base}).`;
    worst = Math.max(worst, 1);
  } else {
    line = `${name}: ${r.count}, under the baseline of ${base}. Either the check did not run fully or the baseline is stale.`;
    worst = Math.max(worst, 1);
  }
  console.log(line);
  if (r.count > base) console.log(r.out.trim().split("\n").slice(-25).map((l) => "    " + l).join("\n"));
}
if (note) console.log(note);

if (RECORD && config) {
  const cfg = JSON.parse(readFileSync(configPath, "utf8"));
  // Both shapes carry the checks under a top-level `checks` key, so the write-back is the same
  // for either. Only the read differs, because the legacy file also keeps `cwd` a level up.
  // A check that did not run has no count to keep, and recording one would bless the failure.
  for (const r of results) if (!r.missing) cfg.checks[r.label].baseline = r.count;
  writeFileSync(configPath, JSON.stringify(cfg, null, 2) + "\n");
  console.log(`Baselines recorded in ${configPath}.`);
}
process.exit(worst);
