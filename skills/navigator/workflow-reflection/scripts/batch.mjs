#!/usr/bin/env node
// Packs a phase's digests into date-ordered batches, one per reading agent,
// each under a character budget, and prints what the sweep will cost to read.
//
// Writes <name>-<n>.txt to the out dir, one digest filename per line. With
// --prompt, also writes <name>-<n>.prompt.md: the template with {{OUTPUT_PATH}},
// {{DIGEST_DIR}} and {{FILES}} filled for that batch, ready to hand an agent.
// With --tokens-per-char, the table prices each batch from a trial run.
//
// A digest larger than the budget gets a batch of its own rather than being
// split, so one long session is never read in halves.
//
// Exits 0 once the batches are written, 2 on bad usage.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { indexOf, invokedDirectly, parseArgs, select, stem } from "./lib.mjs";

const USAGE = `usage: batch.mjs <digest dir> <out dir> --name NAME [--since YYYY-MM-DD] [--until YYYY-MM-DD]
                 [--workspace a,b] [--exclude session,session] [--max-chars 125000]
                 [--prompt TEMPLATE --findings DIR] [--tokens-per-char RATIO]`;

function main(argv) {
  const { opts, positional } = parseArgs(argv, {
    name: null, since: null, until: null, workspace: null, exclude: null,
    "max-chars": "125000", prompt: null, findings: null, "tokens-per-char": null,
  });
  const [digestDir, outDir] = positional.map((p) => resolve(p));
  if (!digestDir || !outDir || !opts.name || (opts.prompt && !opts.findings)) {
    console.error(USAGE);
    return 2;
  }
  if (!existsSync(join(digestDir, "index.tsv"))) {
    console.error(`no index.tsv in ${digestDir}: run digest.mjs first`);
    return 2;
  }
  const max = Number(opts["max-chars"]);
  const rows = select(indexOf(digestDir), opts);
  if (!rows.length) {
    console.error("no session matched the range and filters");
    return 2;
  }

  const batches = [];
  let cur = null;
  for (const r of rows) {
    const chars = Number(r.digest_chars);
    if (!cur || (cur.chars + chars > max && cur.rows.length)) batches.push((cur = { rows: [], chars: 0 }));
    cur.rows.push(r);
    cur.chars += chars;
  }

  mkdirSync(outDir, { recursive: true });
  const template = opts.prompt ? readFileSync(opts.prompt, "utf8") : null;
  const ratio = opts["tokens-per-char"] ? Number(opts["tokens-per-char"]) : null;
  const fmt = (n) => Math.round(n).toLocaleString("en-US");
  console.log(["batch", "sessions", "chars", "from", "to", ...(ratio ? ["est. tokens"] : [])].join("\t"));
  batches.forEach((b, i) => {
    const id = `${opts.name}-${i + 1}`;
    const files = b.rows.map(stem);
    writeFileSync(join(outDir, `${id}.txt`), files.join("\n") + "\n");
    if (template) {
      const filled = template
        .replaceAll("{{OUTPUT_PATH}}", join(resolve(opts.findings), `${id}.md`))
        .replaceAll("{{DIGEST_DIR}}", digestDir)
        .replaceAll("{{FILES}}", files.join("\n"));
      writeFileSync(join(outDir, `${id}.prompt.md`), filled);
    }
    const span = [b.rows[0].start.slice(0, 10), b.rows.at(-1).start.slice(0, 10)];
    console.log([id, b.rows.length, fmt(b.chars), ...span, ...(ratio ? [fmt(b.chars * ratio)] : [])].join("\t"));
  });
  const chars = batches.reduce((a, b) => a + b.chars, 0);
  console.log(["total", rows.length, fmt(chars), "", "", ...(ratio ? [fmt(chars * ratio)] : [])].join("\t"));
  return 0;
}

if (invokedDirectly(import.meta.url)) process.exit(main(process.argv.slice(2)));
