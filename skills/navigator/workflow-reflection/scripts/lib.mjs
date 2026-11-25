// Shared by batch.mjs and tally.mjs: argument parsing, the index readers and
// the main-module guard.

import { readFileSync, realpathSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

// Splits argv into positionals and the --flags named in `defaults`.
export function parseArgs(argv, defaults) {
  const opts = { ...defaults };
  const positional = [];
  for (let i = 0; i < argv.length; i++) {
    const flag = argv[i].startsWith("--") ? argv[i].slice(2) : null;
    if (flag && flag in opts) opts[flag] = argv[++i];
    else positional.push(argv[i]);
  }
  return { opts, positional };
}

export function readTsv(path) {
  const [head, ...lines] = readFileSync(path, "utf8").trimEnd().split("\n");
  const keys = head.split("\t");
  return lines.map((l) => Object.fromEntries(l.split("\t").map((v, i) => [keys[i], v])));
}

const list = (s) => (s ? s.split(",").map((x) => x.trim()).filter(Boolean) : null);

// Keeps the rows inside the date range and the workspace list, minus the
// excluded session ids, sorted by start time.
export function select(rows, opts) {
  const only = list(opts.workspace);
  const skip = new Set(list(opts.exclude) ?? []);
  return rows
    .filter((r) => {
      const day = r.start.slice(0, 10);
      if (opts.since && day < opts.since) return false;
      if (opts.until && day > opts.until) return false;
      if (only && !only.includes(r.workspace)) return false;
      return !skip.has(r.session);
    })
    .sort((a, b) => a.start.localeCompare(b.start));
}

export const stem = (r) => `${r.workspace}__${r.start.slice(0, 10)}__${r.session}.md`;

export const indexOf = (dir) => readTsv(join(dir, "index.tsv"));

// Compares REAL paths: an installed skill is reached through a symlink, so the
// typed entry path and import.meta.url only match once both are resolved.
export function invokedDirectly(moduleUrl) {
  try {
    return realpathSync(process.argv[1]) === realpathSync(fileURLToPath(moduleUrl));
  } catch {
    return false;
  }
}
