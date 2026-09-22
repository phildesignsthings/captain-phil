#!/usr/bin/env node
// Greps a direction's presentation text for the words that betray the method.
// The deliverable argues for itself or it is unfinished; a hit names the word
// and the line so the player can rewrite it.
//
//   leak-check.mjs <file> [<file>...] [--allow word,word]
//
// --allow exempts a word the subject owns (a tide table, a data table).
// Exit codes: 0 clean · 1 a hit or usage.

import { existsSync, readFileSync } from "node:fs";

const WORDS = ["die", "dice", "roll", "rolled", "reroll", "table", "d100", "d20", "d12", "d6",
  "entry", "throw", "thrown", "draw", "cursed", "crit", "loot", "synergy", "referee", "combat", "descriptor"];

const argv = process.argv.slice(2);
const allowIdx = argv.indexOf("--allow");
const allow = new Set(allowIdx >= 0 ? argv[allowIdx + 1].split(",").map((w) => w.trim().toLowerCase()) : []);
const files = argv.filter((a, i) => a !== "--allow" && !(allowIdx >= 0 && i === allowIdx + 1));
if (files.length === 0) { console.error("usage: leak-check.mjs <file> [<file>...] [--allow word,word]"); process.exit(1); }

let hits = 0;
for (const f of files) {
  if (!existsSync(f)) { console.error(`no such file: ${f}`); process.exit(1); }
  const lines = readFileSync(f, "utf8").split("\n");
  lines.forEach((line, i) => {
    for (const w of WORDS) {
      if (allow.has(w)) continue;
      if (new RegExp(`\\b${w}\\b`, "i").test(line)) {
        hits++;
        console.log(`${f}:${i + 1}: "${w}" — ${line.trim()}`);
      }
    }
  });
}
if (hits) { console.log(`\n${hits} leak${hits === 1 ? "" : "s"}. Rewrite the line so the direction stands without the method.`); process.exit(1); }
console.log("clean");
