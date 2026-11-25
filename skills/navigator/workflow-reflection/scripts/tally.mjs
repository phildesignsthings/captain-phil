#!/usr/bin/env node
// Tallies which model did the work in a phase: sessions by main model, then
// calls and tokens by scope (main or sub-agent), model and effort.
//
// A session's main model is the one that wrote the most output tokens in the
// main conversation, so a session that switched models counts once.
//
// Exits 0 once the tables are printed, 2 on bad usage.

import { existsSync } from "node:fs";
import { join } from "node:path";
import { indexOf, invokedDirectly, parseArgs, readTsv, select } from "./lib.mjs";

const USAGE = `usage: tally.mjs <digest dir> [--since YYYY-MM-DD] [--until YYYY-MM-DD]
                 [--workspace a,b] [--exclude session,session]`;
const N = ["calls", "output", "cache_read", "cache_write"];

function main(argv) {
  const { opts, positional } = parseArgs(argv, { since: null, until: null, workspace: null, exclude: null });
  const [dir] = positional;
  if (!dir || !existsSync(join(dir, "usage.tsv"))) {
    console.error(USAGE);
    return 2;
  }
  const keep = new Set(select(indexOf(dir), opts).map((r) => r.session));
  const usage = readTsv(join(dir, "usage.tsv")).filter((u) => keep.has(u.session));

  const mainOut = {};
  for (const u of usage.filter((u) => u.scope === "main")) {
    const s = (mainOut[u.session] ??= {});
    s[u.model] = (s[u.model] ?? 0) + Number(u.output);
  }
  const sessions = {};
  for (const s of Object.values(mainOut)) {
    const [model] = Object.entries(s).sort((a, b) => b[1] - a[1])[0];
    sessions[model] = (sessions[model] ?? 0) + 1;
  }
  console.log(`${keep.size} sessions by main model: ${JSON.stringify(sessions)}\n`);

  const rows = {};
  for (const u of usage) {
    const r = (rows[[u.scope, u.model, u.effort].join("\t")] ??= Object.fromEntries(N.map((k) => [k, 0])));
    for (const k of N) r[k] += Number(u[k]);
  }
  const fmt = (n) => n.toLocaleString("en-US");
  console.log(["scope", "model", "effort", ...N].join("\t"));
  for (const [key, r] of Object.entries(rows).sort()) console.log([key, ...N.map((k) => fmt(r[k]))].join("\t"));
  return 0;
}

if (invokedDirectly(import.meta.url)) process.exit(main(process.argv.slice(2)));
