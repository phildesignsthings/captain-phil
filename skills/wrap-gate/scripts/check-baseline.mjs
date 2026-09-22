#!/usr/bin/env node
// Run a project's checks in parallel and print one plain-language line per check,
// compared against a recorded baseline. The output is written for a designer, so the
// agent can paste it into the report without translating it.
//
// Config, in the order the script looks for it, each found by walking up from cwd:
//   1. <project>/.agents/host.json  →  its "checks" object
//        { "checks": { "cwd": "app",                   // optional, relative to the repo root
//                      "lint": { "cmd": "npm run lint", "baseline": 5, "cwd": "." }, ... } }
//   2. <project>/.claude/checks-baseline.json  →  the same shape one level deeper
//        { "cwd": "app", "checks": { ... } }
//   A check's own "cwd" overrides the top-level one. Both are relative to the config's project root,
//   which is the host file's grandparent and the baseline file's grandparent alike.
// Without either, the script reads package.json for typecheck / lint / test scripts and runs them
// against a baseline of 0, and says so.
//
// --record writes the counts back into whichever file it read, leaving every other key untouched:
// the host file carries answers no check produced, so a rewrite that dropped them would take the
// repo's whole configuration with it.
//
// Usage: node check-baseline.mjs [--record]   --record rewrites every baseline to today's count.
import { spawn } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

const RECORD = process.argv.includes("--record");

// Returns { path, kind, root } or null. `kind` decides where "checks" sits in the parsed file and
// where --record writes it back; `root` is the project directory every relative cwd hangs off.
// The host file wins over the legacy one on a repo carrying both, so migrating is one file move.
function findConfig(dir) {
  for (;;) {
    const host = join(dir, ".agents", "host.json");
    if (existsSync(host)) {
      try {
        const parsed = JSON.parse(readFileSync(host, "utf8"));
        // `checks: null` is an ANSWER — the repo says it runs no automated checks — so it stops
        // the search rather than falling through. Only an absent key means nobody answered, and
        // a fallback on a null would ask the repo a question it already declined.
        if ("checks" in parsed)
          return { path: host, kind: "host", root: dir, checks: parsed.checks };
      } catch {
        // A malformed host file is not this script's business to report. Fall through
        // to the legacy file rather than dying on somebody else's syntax error.
      }
    }
    const legacy = join(dir, ".claude", "checks-baseline.json");
    if (existsSync(legacy))
      return { path: legacy, kind: "legacy", root: dir };
    const up = dirname(dir);
    if (up === dir) return null;
    dir = up;
  }
}

// The four labels check-baseline runs, and the keys that are settings rather than checks. A host
// file's "checks" carries "cwd" alongside the checks themselves, so the settings are subtracted
// rather than the checks enumerated — a label added to the schema then needs no edit here.
const NOT_A_CHECK = new Set(["cwd"]);

function findPackageRoot(dir) {
  for (;;) {
    if (existsSync(join(dir, "package.json"))) return dir;
    const up = dirname(dir);
    if (up === dir) return null;
    dir = up;
  }
}

const config = findConfig(process.cwd());
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

// A missing node_modules is only a finding where the manifest declares something
// to install. A zero-dependency repo — which every check here runs on the
// standard library alone — has nothing to install, and refusing to run its
// checks blocks the gate over a folder it never needed.
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

// Each counter reads a tool's own summary line first and falls back to counting error lines,
// so a tool that prints no summary still produces a number rather than a crash.
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

function run(label, cmd, dir) {
  return new Promise((done) => {
    const child = spawn(cmd, { cwd: dir, shell: true, env: { ...process.env, FORCE_COLOR: "0", CI: "1" } });
    let out = "";
    child.stdout.on("data", (d) => (out += d));
    child.stderr.on("data", (d) => (out += d));
    child.on("close", (code) => done({ label, cmd, code, out, count: count(out, code) }));
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
  if (/unresolved|Cannot find module/i.test(r.out) && r.count > base) {
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
  for (const r of results) cfg.checks[r.label].baseline = r.count;
  writeFileSync(configPath, JSON.stringify(cfg, null, 2) + "\n");
  console.log(`Baselines recorded in ${configPath}.`);
}
process.exit(worst);
