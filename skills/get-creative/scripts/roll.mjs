#!/usr/bin/env node
// The dice for get-creative. Throws N draws of four dice, looks every number up
// in its table, refuses an exact repeat of a draw already kept in this log, and
// appends the throw sheet to the log so the designer can read what forced each
// direction. Nothing here judges a draw; the only rejections are mechanical.
//
//   roll.mjs --subject "<s>" --log <abs path> [--n 3] [--out "<where it lands>"]
//            [--objects <path>] [--record <DESIGN.md>]
//   roll.mjs --self-test
//
// Tables: ../references/{descriptors,objects,compositions,rules}.md. A product's
// own object table (--objects) replaces the generic one; a DESIGN.md (--record)
// supplies rule entries 2–6 from the bold leads under "## Named Rules".
//
// Exit codes: 0 rolled · 1 usage or a table that failed its count · 2 a
// prerequisite is missing, with the sentence to say to the designer.

import { randomInt } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, appendFileSync, writeFileSync } from "node:fs";
import { dirname, isAbsolute, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const SKILL = resolve(HERE, "..");
const REF = (f) => join(SKILL, "references", f);
const DICE = { descriptor: 100, object: 20, composition: 20, rule: 6 };
const RESTRAINT = "Nothing — fully inside the rules";

const [major] = process.versions.node.split(".").map(Number);
if (major < 18) {
  console.error(`Node ${process.versions.node} is too old for the dice; 18 or newer is needed. Install it from nodejs.org, then say roll again.`);
  process.exit(2);
}

const args = parseArgs(process.argv.slice(2));

if (args["self-test"]) {
  selfTest();
  process.exit(0);
}

const subject = args.subject;
const logPath = args.log;
const n = Number(args.n ?? 3);
if (!subject || !logPath || !Number.isInteger(n) || n < 1) usage();
if (!isAbsolute(logPath)) {
  console.error(`--log has to be an absolute path (got "${logPath}"). A relative path after a cd is how a throw lands in the wrong file.`);
  process.exit(1);
}

// ---- tables -----------------------------------------------------------------

const descriptors = readTable(REF("descriptors.md"), DICE.descriptor);
const compositions = readTable(REF("compositions.md"), DICE.composition);

let objectsSource = REF("objects.md");
if (args.objects) {
  if (!existsSync(args.objects)) {
    console.error(`No object table at ${args.objects}. Write one from the product record using assets/objects.template.md, or drop --objects to use the generic table.`);
    process.exit(2);
  }
  objectsSource = resolve(args.objects);
}
const objects = readTable(objectsSource, DICE.object);

const { rules, rulesSource } = readRules(args.record ? resolve(args.record) : undefined);

// ---- the log ----------------------------------------------------------------

mkdirSync(dirname(logPath), { recursive: true });
if (!existsSync(logPath)) {
  const tpl = readFileSync(join(SKILL, "assets", "combat-log.template.md"), "utf8")
    .replace("<subject>", subject)
    .replace("<the element under exploration>", subject)
    .replace("<N>", String(n))
    .replace("<Paper page, or route>", args.out ?? "not stated");
  writeFileSync(logPath, tpl);
}
warnIfUnignored(logPath);

const log = readFileSync(logPath, "utf8");
const round = (log.match(/^## Round \d+/gm) ?? []).length + 1;
const kept = new Set(
  [...log.matchAll(/^- Draw \w+: (\d+) · (\d+) · (\d+) · (\d+)/gm)].map((m) => m.slice(1, 5).join("·")),
);

// ---- throw ------------------------------------------------------------------

const draws = [];
const rethrown = [];
let guard = 0;
while (draws.length < n) {
  if (++guard > 500) {
    console.error("Five hundred throws without a fresh draw; the log has kept nearly every combination. Start a new log.");
    process.exit(1);
  }
  const d = {
    descriptor: randomInt(1, DICE.descriptor + 1),
    object: randomInt(1, DICE.object + 1),
    composition: randomInt(1, DICE.composition + 1),
    rule: randomInt(1, DICE.rule + 1),
  };
  const key = [d.descriptor, d.object, d.composition, d.rule].join("·");
  if (kept.has(key)) { rethrown.push(`${key} — already kept in this log`); continue; }
  const clash = draws.find((k) => k.object === d.object || k.composition === d.composition);
  if (clash) {
    const axis = clash.object === d.object ? "object" : "composition";
    rethrown.push(`${key} — shares its ${axis} with draw ${letter(draws.indexOf(clash))} of this set`);
    continue;
  }
  kept.add(key);
  draws.push(d);
}

// ---- write and print --------------------------------------------------------

const lines = [];
lines.push("", `## Round ${round}`, "", "### Tables", "");
lines.push(`- Descriptors: d100, references/descriptors.md`);
lines.push(`- Objects: d20, ${objectsSource === REF("objects.md") ? "references/objects.md (generic)" : objectsSource}`);
lines.push(`- Compositions: d20, references/compositions.md`);
lines.push(`- Rules: d6, ${rulesSource}`);
rules.forEach((r, i) => lines.push(`  ${i + 1}. ${r}`));
lines.push("", "### Throws", "");
draws.forEach((d, i) => {
  lines.push(`- Draw ${letter(i)}: ${d.descriptor} · ${d.object} · ${d.composition} · ${d.rule}`);
  lines.push(`  - ${descriptors[d.descriptor - 1]} ${objects[d.object - 1].toLowerCase()}`);
  lines.push(`  - ${compositions[d.composition - 1]}`);
  lines.push(`  - Rule spent: ${rules[d.rule - 1]}`);
});
if (rethrown.length) {
  lines.push("", "### Rethrown by the script", "");
  rethrown.forEach((r) => lines.push(`- ${r}`));
}
lines.push("", "### Saves", "", "<!-- the player appends one block per built direction here, shape in assets/save.template.md -->", "");
appendFileSync(logPath, lines.join("\n"));

console.log(`Round ${round} · ${subject}`);
console.log("");
draws.forEach((d, i) => {
  console.log(`${letter(i)}. ${article(descriptors[d.descriptor - 1])} ${descriptors[d.descriptor - 1].toLowerCase()} ${objects[d.object - 1].toLowerCase()}.`);
  console.log(`   ${compositions[d.composition - 1]}.`);
  console.log(`   Rule spent: ${rules[d.rule - 1]}.`);
  console.log("");
});
if (rulesSource.startsWith("generic")) console.log("No design record was given, so the rule die used the generic table.");
if (objectsSource === REF("objects.md")) console.log("No product object table was given, so the object die used the generic table.");
console.log(`Log: ${logPath}`);

// ---- helpers ----------------------------------------------------------------

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith("--")) usage();
    const k = a.slice(2);
    const next = argv[i + 1];
    if (next === undefined || next.startsWith("--")) out[k] = true;
    else { out[k] = next; i++; }
  }
  return out;
}

function usage() {
  console.error('usage: roll.mjs --subject "<s>" --log </abs/path.md> [--n 3] [--out "<where>"] [--objects <path>] [--record <DESIGN.md>] | --self-test');
  process.exit(1);
}

function letter(i) { return String.fromCharCode(65 + i); }
function article(w) { return /^[aeiou]/i.test(w) ? "An" : "A"; }

function readTable(path, size) {
  if (!existsSync(path)) { console.error(`Table missing: ${path}`); process.exit(1); }
  const entries = [];
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const m = line.match(/^(\d+)\.\s+(.+?)\s*$/);
    if (!m) continue;
    const idx = Number(m[1]);
    if (idx !== entries.length + 1) { console.error(`${path}: entry ${idx} is out of order (expected ${entries.length + 1}).`); process.exit(1); }
    if (/^<.*>$/.test(m[2])) { console.error(`${path}: entry ${idx} is still a template placeholder.`); process.exit(1); }
    entries.push(m[2]);
  }
  if (entries.length !== size) { console.error(`${path}: ${entries.length} entries, a d${size} needs exactly ${size}.`); process.exit(1); }
  const dupes = entries.filter((e, i) => entries.findIndex((x) => x.toLowerCase() === e.toLowerCase()) !== i);
  if (dupes.length) { console.error(`${path}: repeated entries: ${dupes.join(", ")}`); process.exit(1); }
  return entries;
}

function readRules(recordPath) {
  const generic = readTable(REF("rules.md"), DICE.rule);
  if (!recordPath) return { rules: generic, rulesSource: "generic, references/rules.md (no design record given)" };
  if (!existsSync(recordPath)) {
    console.error(`No design record at ${recordPath}. Point --record at the surface's DESIGN.md, or drop it to use the generic rules.`);
    process.exit(2);
  }
  const text = readFileSync(recordPath, "utf8");
  const section = text.split(/^## Named Rules\s*$/m)[1]?.split(/^## /m)[0] ?? "";
  const leads = [...section.matchAll(/^- \*\*(.+?)\*\*/gm)].map((m) => m[1].replace(/\.$/, ""));
  if (leads.length === 0) {
    console.error(`${recordPath} has no bold-led bullets under "## Named Rules". Add them, or drop --record to use the generic rules.`);
    process.exit(2);
  }
  const five = leads.slice(0, 5);
  let source = `${recordPath} § Named Rules`;
  if (five.length < 5) {
    const pad = generic.slice(1, 1 + 5 - five.length);
    five.push(...pad);
    source += ` (${leads.length} rules there; padded from the generic table)`;
  }
  return { rules: [RESTRAINT, ...five], rulesSource: source };
}

function warnIfUnignored(path) {
  if (!path.includes("/.context/")) return;
  let dir = dirname(path);
  for (let i = 0; i < 8; i++) {
    const gi = join(dir, ".gitignore");
    if (existsSync(gi) && /^\.?\/?\.context\/?\s*$/m.test(readFileSync(gi, "utf8"))) return;
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  console.log("Note: .context/ is not in a .gitignore above the log, so the log will show up in git status.");
}

function selfTest() {
  const d = readTable(REF("descriptors.md"), 100);
  const o = readTable(REF("objects.md"), 20);
  const c = readTable(REF("compositions.md"), 20);
  const r = readTable(REF("rules.md"), 6);
  if (r[0] !== RESTRAINT) { console.error(`rules.md entry 1 must read "${RESTRAINT}".`); process.exit(1); }
  const seen = new Set();
  for (let i = 0; i < 1000; i++) {
    const v = randomInt(1, 101);
    if (v < 1 || v > 100) { console.error("randomInt out of range"); process.exit(1); }
    seen.add(v);
  }
  if (seen.size < 90) { console.error("randomInt covered fewer than 90 of 100 faces in 1000 throws; the generator is suspect."); process.exit(1); }
  console.log(`self-test ok: d100 ${d.length} · d20 ${o.length} · d20 ${c.length} · d6 ${r.length} · rng covered ${seen.size}/100 faces`);
}
