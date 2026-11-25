#!/usr/bin/env node
// Links every skill under skills/<hand>/ into .claude/skills/, so a session in
// this repo runs the working copy. Run it with `npm run link-skills`.
//
// Each link is relative, `.claude/skills/<name>` -> `../../skills/<hand>/<name>`.
// The link keeps the flat name the installer gives a consuming repo, so the
// hooks' paths under `$CLAUDE_PROJECT_DIR/.claude/skills/` resolve here too.
// .claude/skills/ is gitignored: a committed link would sit in the repo the
// installer clones, and the installer publishes every SKILL.md it finds.
//
// A link whose skill has gone, after a rename, a deletion or a move to another
// hand, is removed. A real file or folder in .claude/skills/ is reported and
// left alone, because it is something this script did not write.
import {
  existsSync,
  lstatSync,
  mkdirSync,
  readdirSync,
  readlinkSync,
  statSync,
  symlinkSync,
  unlinkSync,
} from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SKILLS = join(root, "skills");
const LINKS = join(root, ".claude", "skills");

mkdirSync(LINKS, { recursive: true });

const skills = new Map();
for (const hand of readdirSync(SKILLS)) {
  if (!statSync(join(SKILLS, hand)).isDirectory()) continue;
  for (const name of readdirSync(join(SKILLS, hand)))
    if (existsSync(join(SKILLS, hand, name, "SKILL.md")))
      skills.set(name, join("..", "..", "skills", hand, name));
}
const made = [];
const removed = [];
const foreign = [];

for (const name of readdirSync(LINKS)) {
  const path = join(LINKS, name);
  if (!lstatSync(path).isSymbolicLink()) {
    foreign.push(name);
    continue;
  }
  if (readlinkSync(path) === skills.get(name)) continue;
  unlinkSync(path);
  removed.push(name);
}

for (const [name, target] of skills) {
  const path = join(LINKS, name);
  if (existsSync(path) || foreign.includes(name)) continue;
  symlinkSync(target, path);
  made.push(name);
}

if (made.length) console.log(`linked: ${made.join(", ")}`);
if (removed.length) console.log(`removed stale links: ${removed.join(", ")}`);
if (foreign.length)
  console.log(
    `left alone, not links: ${foreign.join(", ")}. A real folder in .claude/skills/ shadows the ` +
      `working copy under skills/. Delete it to link the skill instead.`,
  );
console.log(`link-skills: ok — ${skills.size} skill(s) linked into .claude/skills/.`);
