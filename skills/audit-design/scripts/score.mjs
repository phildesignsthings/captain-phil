#!/usr/bin/env node
// The arithmetic and the writing for a design audit. Applies
// ../references/criteria.md § From findings to a score — that file owns the
// two tables, this file applies them, and --self-test proves the application
// against every row so a printed score is one the mapping produced.
//
//   score.mjs --skeleton --surface "<s>" [--kind paper-boards] [--sweep 3]
//             [--bar Good] [--loading-in-scope false]   → empty findings.json
//   score.mjs <findings.json>                             → score, as markdown
//   score.mjs <findings.json> --json                      → score, as JSON
//   score.mjs <findings.json> --record                    → the run record
//   score.mjs --self-test
//
// Exit codes: 0 ok · 1 the file failed validation or usage · 3 the self-test
// disagreed with criteria.md (the mapping is lying; fix it before scoring).

import { readFileSync, realpathSync } from "node:fs";
import { fileURLToPath } from "node:url";

const CRITERIA = {
  1: "Traceability",
  2: "One system",
  3: "Copy for the persona",
  4: "Signal without colour",
  5: "Craft",
  6: "Completeness",
};
const SEVERITIES = new Set(["P0", "P1", "P2", "P3"]);
const BANDS = new Set(["Excellent", "Good", "Acceptable", "Poor", "Critical"]);
const MAX_PER_CRITERION = 4;

// § From findings to a score — read top down, first match wins.
export function scoreCriterion(counts) {
  const p0 = counts.P0 ?? 0;
  const p1 = counts.P1 ?? 0;
  const p2 = counts.P2 ?? 0;
  if (p0 >= 2) return 0;
  if (p0 === 1 || p1 >= 2) return 1;
  if (p1 === 1 || p2 >= 3) return 2;
  if (p2 >= 1) return 3;
  return 4;
}

export function band(percent) {
  if (percent >= 90) return "Excellent";
  if (percent >= 70) return "Good";
  if (percent >= 50) return "Acceptable";
  if (percent >= 30) return "Poor";
  return "Critical";
}

export function skeleton(opts = {}) {
  return {
    surface: opts.surface ?? "<file id> · <page name>",
    kind: opts.kind ?? "paper-boards",
    sweep_version: Number(opts.sweep ?? 3),
    bar: opts.bar ?? "Good",
    loading_in_scope: String(opts.loadingInScope ?? "false") === "true",
    assumptions: [],
    criteria_na: [],
    findings: [],
  };
}

export function validate(run) {
  const errors = [];
  if (!run || typeof run !== "object") return ["file is not a JSON object"];
  if (!run.surface) errors.push("`surface` is missing");
  if (!Number.isInteger(run.sweep_version) || run.sweep_version < 1)
    errors.push("`sweep_version` must be an integer ≥ 1");
  if (run.bar !== undefined && run.bar !== null && !BANDS.has(run.bar))
    errors.push(`\`bar\` must be one of ${[...BANDS].join(", ")}`);
  if (typeof run.loading_in_scope !== "boolean")
    errors.push("`loading_in_scope` must be true or false — criterion 6 reads it");
  if (!Array.isArray(run.findings)) errors.push("`findings` must be an array");
  const na = new Set();
  for (const entry of run.criteria_na ?? []) {
    if (!CRITERIA[entry.criterion])
      errors.push(`criteria_na: unknown criterion ${entry.criterion}`);
    if (!entry.reason) errors.push(`criteria_na ${entry.criterion}: reason is missing`);
    na.add(entry.criterion);
  }
  const ids = new Set();
  for (const f of run.findings ?? []) {
    const tag = f.id ?? "<no id>";
    if (!f.id) errors.push("a finding has no `id`");
    if (ids.has(f.id)) errors.push(`${tag}: duplicate id`);
    ids.add(f.id);
    if (!CRITERIA[f.criterion]) errors.push(`${tag}: unknown criterion ${f.criterion}`);
    if (na.has(f.criterion) && f.status === "open")
      errors.push(`${tag}: open finding on a criterion marked n/a`);
    if (!f.board) errors.push(`${tag}: \`board\` is missing`);
    if (!f.finding) errors.push(`${tag}: \`finding\` is missing`);
    if (!f.evidence) errors.push(`${tag}: \`evidence\` is missing — measure before you accuse`);
    if (f.status !== "open" && f.status !== "withdrawn")
      errors.push(`${tag}: status must be "open" or "withdrawn"`);
    if (f.status === "withdrawn" && !f.reason)
      errors.push(`${tag}: a withdrawal carries a reason`);
    if (f.sweep !== null && !Number.isInteger(f.sweep))
      errors.push(`${tag}: \`sweep\` is a sweep number or null`);
    if (f.status === "open" && f.sweep !== null && !SEVERITIES.has(f.severity))
      errors.push(`${tag}: open in-list finding has no severity — run the scorer first`);
  }
  return errors;
}

export function score(run) {
  const na = new Set((run.criteria_na ?? []).map((e) => e.criterion));
  const counts = {};
  for (const id of Object.keys(CRITERIA)) counts[id] = { P0: 0, P1: 0, P2: 0, P3: 0, ids: [] };

  const offList = [];
  const withdrawn = [];
  const scored = [];
  for (const f of run.findings) {
    if (f.status === "withdrawn") {
      withdrawn.push(f);
      continue;
    }
    if (f.sweep === null) {
      offList.push(f);
      continue;
    }
    counts[f.criterion][f.severity] += 1;
    counts[f.criterion].ids.push(`${f.id} ${f.severity}`);
    scored.push(f);
  }

  const rows = [];
  let total = 0;
  let max = 0;
  for (const [id, name] of Object.entries(CRITERIA)) {
    const n = Number(id);
    if (na.has(n)) {
      const reason = run.criteria_na.find((e) => e.criterion === n).reason;
      rows.push({ criterion: n, name, score: "n/a", reason, findings: [] });
      continue;
    }
    const s = scoreCriterion(counts[id]);
    total += s;
    max += MAX_PER_CRITERION;
    rows.push({ criterion: n, name, score: s, findings: counts[id].ids });
  }
  const percent = max === 0 ? 0 : Math.round((total / max) * 100);
  return {
    surface: run.surface,
    kind: run.kind ?? null,
    sweep_version: run.sweep_version,
    bar: run.bar ?? null,
    loading_in_scope: run.loading_in_scope,
    assumptions: run.assumptions ?? [],
    rows,
    total,
    max,
    percent,
    band: band(percent),
    scored,
    off_list: offList,
    withdrawn,
  };
}

const cell = (s) => String(s ?? "").replace(/\|/g, "\\|").replace(/\n/g, " ");

export function renderMarkdown(result) {
  const lines = [];
  lines.push(`**${result.surface}** — sweep v${result.sweep_version}`);
  lines.push("");
  lines.push("| # | Criterion | Score | Findings |");
  lines.push("|---|---|---|---|");
  for (const r of result.rows) {
    const detail = r.score === "n/a" ? r.reason : r.findings.join(", ") || "—";
    lines.push(`| ${r.criterion} | ${r.name} | ${r.score} | ${cell(detail)} |`);
  }
  lines.push("");
  const barNote = result.bar ? ` · bar ${result.bar}` : "";
  lines.push(`**${result.total}/${result.max}** · ${result.percent}% · **${result.band}**${barNote}`);
  if (result.off_list.length) {
    lines.push("");
    lines.push("**Checks this run adds** (reported, not scored):");
    for (const f of result.off_list) lines.push(`- ${f.id} · ${f.board} — ${f.finding}`);
  }
  if (result.withdrawn.length) {
    lines.push("");
    lines.push(`**Withdrawn on measurement** (${result.withdrawn.length}):`);
    for (const f of result.withdrawn) lines.push(`- ${f.id} · ${f.board} — ${f.reason}`);
  }
  return lines.join("\n");
}

// The run record: everything a later reader needs, with two sections left as
// headings because only the auditor can fill them — what the sweep caught that
// a read would not have, and what it missed (filled after the fix round).
export function renderRecord(result, date = new Date().toISOString().slice(0, 10)) {
  const lines = [];
  const scores = result.rows.map((r) => r.score).join(" | ");
  lines.push(`# ${result.surface} — ${date} — sweep v${result.sweep_version}`);
  lines.push("");
  lines.push(
    `Bar: ${result.bar ?? "unset"}. Loading in scope: ${result.loading_in_scope}. ` +
      `Previous run's findings closed: <n> of <m>.`,
  );
  if (result.assumptions.length) {
    lines.push("");
    lines.push("Standards assumed, because no product record states them:");
    for (const a of result.assumptions) lines.push(`- ${a}`);
  }
  lines.push("");
  lines.push("## Runs");
  lines.push("");
  lines.push("| Surface | Date | Sweep | 1 | 2 | 3 | 4 | 5 | 6 | Total | Band |");
  lines.push("|---|---|---|---|---|---|---|---|---|---|---|");
  lines.push(
    `| ${cell(result.surface)} | ${date} | v${result.sweep_version} | ${scores} | ${result.total}/${result.max} | ${result.band} |`,
  );
  lines.push("");
  lines.push("## Score");
  lines.push("");
  lines.push(renderMarkdown(result).split("\n").slice(2).join("\n"));
  lines.push("");
  lines.push("## Findings");
  lines.push("");
  lines.push("| Id | Criterion | Severity | Board | Finding | Evidence | Sweep |");
  lines.push("|---|---|---|---|---|---|---|");
  for (const f of result.scored) {
    lines.push(
      `| ${f.id} | ${f.criterion} | ${f.severity} | ${cell(f.board)} | ${cell(f.finding)} | ${cell(f.evidence)} | ${f.sweep} |`,
    );
  }
  lines.push("");
  lines.push("## Withdrawn on measurement");
  lines.push("");
  lines.push("| Id | Board | Reason |");
  lines.push("|---|---|---|");
  for (const f of result.withdrawn) lines.push(`| ${f.id} | ${cell(f.board)} | ${cell(f.reason)} |`);
  lines.push("");
  lines.push("## Checks this run adds");
  lines.push("");
  if (result.off_list.length) {
    lines.push("| Id | Board | Finding | Evidence |");
    lines.push("|---|---|---|---|");
    for (const f of result.off_list)
      lines.push(`| ${f.id} | ${cell(f.board)} | ${cell(f.finding)} | ${cell(f.evidence)} |`);
  } else {
    lines.push("None.");
  }
  lines.push("");
  lines.push("## Caught by the sweep, invisible to a read");
  lines.push("");
  lines.push("<fill in>");
  lines.push("");
  lines.push("## Missed");
  lines.push("");
  lines.push("<fill in after the fix round or the designer's read>");
  return lines.join("\n");
}

// Every row of both criteria.md tables as a fixture, plus the writing modes.
function selfTest() {
  const cases = [
    [{ P0: 2 }, 0, "two P0 → 0"],
    [{ P0: 1 }, 1, "one P0 → 1"],
    [{ P0: 1, P1: 1, P2: 5 }, 1, "one P0 outranks everything below it → 1"],
    [{ P1: 2 }, 1, "two P1 → 1"],
    [{ P1: 1 }, 2, "one P1 → 2"],
    [{ P1: 1, P2: 5 }, 2, "one P1 with any P2 → 2"],
    [{ P2: 3 }, 2, "three P2 → 2"],
    [{ P2: 2 }, 3, "two P2 → 3"],
    [{ P2: 1, P3: 9 }, 3, "one P2 and many P3 → 3"],
    [{ P3: 6 }, 4, "P3 only → 4"],
    [{}, 4, "no findings → 4"],
  ];
  const bands = [
    [90, "Excellent"], [89, "Good"], [70, "Good"], [69, "Acceptable"], [50, "Acceptable"],
    [49, "Poor"], [30, "Poor"], [29, "Critical"], [0, "Critical"],
  ];
  const failures = [];
  for (const [counts, expected, label] of cases) {
    const got = scoreCriterion(counts);
    if (got !== expected) failures.push(`mapping: ${label}, got ${got}`);
  }
  for (const [percent, expected] of bands) {
    const got = band(percent);
    if (got !== expected) failures.push(`band: ${percent}% → ${expected}, got ${got}`);
  }

  // Renormalisation: two n/a criteria make the maximum 16.
  const fixture = {
    ...skeleton({ surface: "self-test", sweep: 3 }),
    criteria_na: [{ criterion: 5, reason: "t" }, { criterion: 6, reason: "t" }],
    findings: [
      { id: "a", criterion: 1, severity: "P1", board: "b", finding: "f", evidence: "e", sweep: 1, status: "open" },
      { id: "b", criterion: 2, severity: "P2", board: "b", finding: "f", evidence: "e", sweep: 1, status: "open" },
      { id: "c", criterion: 3, severity: null, board: "b", finding: "off", evidence: "e", sweep: null, status: "open" },
      { id: "d", criterion: 4, severity: "P0", board: "b", finding: "f", evidence: "e", sweep: 1, status: "withdrawn", reason: "r" },
    ],
  };
  const v = validate(fixture);
  if (v.length) failures.push(`fixture failed validation: ${v.join("; ")}`);
  const renorm = score(fixture);
  if (renorm.max !== 16) failures.push(`renormalisation: max ${renorm.max}, expected 16`);
  if (renorm.total !== 13) failures.push(`renormalisation: total ${renorm.total}, expected 13 (2+3+4+4)`);
  if (renorm.off_list.length !== 1) failures.push("off-list finding was scored or dropped");
  if (renorm.withdrawn.length !== 1) failures.push("withdrawn finding was scored or dropped");
  if (renorm.rows[3].score !== 4) failures.push("a withdrawn P0 changed a score");

  // Skeleton: validates empty, and carries the run parameters.
  const sk = skeleton({ surface: "s", sweep: "3", bar: "Good", loadingInScope: "true" });
  if (validate(sk).length) failures.push(`skeleton fails validation: ${validate(sk).join("; ")}`);
  if (sk.loading_in_scope !== true || sk.sweep_version !== 3) failures.push("skeleton dropped a parameter");
  if (validate({ ...sk, bar: "Fine" }).length === 0) failures.push("skeleton accepted a bar off the band table");
  if (validate({ ...sk, loading_in_scope: "no" }).length === 0) failures.push("a non-boolean loading_in_scope passed");
  if (validate({ ...sk, findings: [{ ...fixture.findings[0], evidence: "" }] }).length === 0)
    failures.push("a finding without evidence passed");

  // Record: every finding, withdrawal and off-list check appears once; pipes are escaped.
  const piped = { ...fixture, findings: [{ ...fixture.findings[0], finding: "a | b" }, ...fixture.findings.slice(1)] };
  const record = renderRecord(score(piped), "2000-01-01");
  for (const needle of ["| a | 1 | P1 |", "| d | b | r |", "| c | b | off |", "a \\| b", "## Missed", "| self-test | 2000-01-01 | v3 |"]) {
    if (!record.includes(needle)) failures.push(`record is missing "${needle}"`);
  }
  if ((record.match(/\| a \| 1 \| P1 \|/g) ?? []).length !== 1) failures.push("record lists a finding twice");

  if (failures.length) {
    console.error("self-test FAILED — the script disagrees with references/criteria.md:");
    for (const f of failures) console.error(`  ${f}`);
    process.exit(3);
  }
  console.log(
    `self-test ok — ${cases.length} mapping rows, ${bands.length} band edges, renormalisation, skeleton, record, off-list and withdrawn handling`,
  );
}

function flag(args, name) {
  const i = args.indexOf(name);
  return i === -1 ? undefined : args[i + 1];
}

const args = process.argv.slice(2);
/*
  Whether this file is the one node was told to run.

  Compares REAL paths. A skill installs as `.agents/skills/<name>/`, and the
  harness symlinks `.claude/skills/<name>` at it — so the entry path a user
  types goes through the symlink while `import.meta.url` is already resolved.
  Comparing the two unresolved strings makes this branch false whenever the
  script is invoked by the path the skill's own instructions name, and the run
  exits 0 having done nothing. A check that silently passes is worse than none.
*/
function invokedDirectly(moduleUrl) {
  const entry = process.argv[1];
  if (!entry) return false;
  try {
    return realpathSync(entry) === realpathSync(fileURLToPath(moduleUrl));
  } catch {
    return false;
  }
}

if (invokedDirectly(import.meta.url)) {
  if (args.includes("--self-test")) {
    selfTest();
  } else if (args.includes("--skeleton")) {
    const sk = skeleton({
      surface: flag(args, "--surface"),
      kind: flag(args, "--kind"),
      sweep: flag(args, "--sweep"),
      bar: flag(args, "--bar"),
      loadingInScope: flag(args, "--loading-in-scope"),
    });
    const errors = validate(sk);
    if (errors.length) {
      console.error(`skeleton is invalid:\n  ${errors.join("\n  ")}`);
      process.exit(1);
    }
    console.log(JSON.stringify(sk, null, 2));
  } else {
    const path = args.find((a) => !a.startsWith("--"));
    if (!path) {
      console.error("usage: score.mjs <findings.json> [--json|--record] | --skeleton --surface <s> [...] | --self-test");
      process.exit(1);
    }
    let run;
    try {
      run = JSON.parse(readFileSync(path, "utf8"));
    } catch (error) {
      console.error(`could not read ${path}: ${error.message}`);
      process.exit(1);
    }
    const errors = validate(run);
    if (errors.length) {
      console.error(`${path} failed validation:`);
      for (const e of errors) console.error(`  ${e}`);
      process.exit(1);
    }
    const result = score(run);
    if (args.includes("--json")) console.log(JSON.stringify(result, null, 2));
    else if (args.includes("--record")) console.log(renderRecord(result));
    else console.log(renderMarkdown(result));
  }
}
