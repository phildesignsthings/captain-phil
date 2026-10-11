#!/usr/bin/env node
// Links every skill under skills/ into .claude/skills/, so a session in this
// repo runs the working copy. Run it with `npm run link-skills`.
//
// Each link is relative, `.claude/skills/<name>` -> `../../skills/<name>`, the
// same shape the installer gives a consuming repo, so the hooks' paths under
// `$CLAUDE_PROJECT_DIR/.claude/skills/` resolve here too. .claude/skills/ is
// gitignored: a committed link would sit in the repo the installer clones, and
// the installer publishes every SKILL.md it finds.
//
// A link whose skill has gone, after a rename or a deletion, is removed. A real
// file or folder in .claude/skills/ is reported and left alone, because it is
// something this script did not write.
import {
  existsSync,
  lstatSync,
  mkdirSync,
  readdirSync,
  readlinkSync,
  symlinkSync,
  unlinkSync,
} from "node:fs";
import { dirname, join, resolve } from "node:path";

const root = resolve(dirname(new URL(import.meta.url).pathname), "..");
const SKILLS = join(root, "skills");
const LINKS = join(root, ".claude", "skills");

mkdirSync(LINKS, { recursive: true });

const skills = readdirSync(SKILLS).filter((n) => existsSync(join(SKILLS, n, "SKILL.md")));
const made = [];
const removed = [];
const foreign = [];

for (const name of readdirSync(LINKS)) {
  const path = join(LINKS, name);
  if (!lstatSync(path).isSymbolicLink()) {
    foreign.push(name);
    continue;
  }
  const target = readlinkSync(path);
  if (target === join("..", "..", "skills", name) && skills.includes(name)) continue;
  unlinkSync(path);
  removed.push(name);
}

for (const name of skills) {
  const path = join(LINKS, name);
  if (existsSync(path) || foreign.includes(name)) continue;
  symlinkSync(join("..", "..", "skills", name), path);
  made.push(name);
}

if (made.length) console.log(`linked: ${made.join(", ")}`);
if (removed.length) console.log(`removed stale links: ${removed.join(", ")}`);
if (foreign.length)
  console.log(
    `left alone, not links: ${foreign.join(", ")}. A real folder in .claude/skills/ shadows the ` +
      `working copy under skills/. Delete it to link the skill instead.`,
  );
console.log(`link-skills: ok — ${skills.length} skill(s) linked into .claude/skills/.`);
