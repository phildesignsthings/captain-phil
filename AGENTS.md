---
house_style: true
---

# Editing this repo

This repo publishes agent skills that install into other people's repos. Every rule below exists
because a mistake here lands in a repo the author never sees.

## What this repo is

- `skills/<name>/SKILL.md` is one skill. Its `references/`, `scripts/` and `assets/` folders install
  with it and are the only things it can read off disk.
- `host/` is the questionnaire a consuming repo fills in at `.agents/host.json`, its schema, and four
  filled templates. Read [the host file spec](host/README.md) before touching a slot.
- `scripts/skills-guard.mjs` enforces the invariants. Run `npm run guard` before every commit.
- `README.md` indexes the skills. A skill and its table row land in the same commit.

## The rules

- **A portable skill names no host repo's paths.** Apply the generic-versus-host test to every
  sentence: would the rule hold in a repo that shares none of this one's files? Yes, and it is
  bundled under the skill's `references/`. No, and it cites the host file by slot.
- **A skill that reads a slot declares it twice** — in `compatibility` as the prose fallback, and in
  `metadata.host` as the machine-readable list. The guard fails a body that reads an undeclared slot.
- **A `null` slot is an answer.** The repo said it has none of that thing, so the skill skips the
  step, says so in one line, and never asks.
- **Never put a `SKILL.md` anywhere but `skills/<name>/SKILL.md`.** The installer treats every
  `SKILL.md` it finds as a skill named after its parent folder, so a stray one publishes a skill
  nobody wrote.
- **A bundled script compares REAL paths in its main-module guard.** A skill installs as
  `.agents/skills/<name>/` with `.claude/skills/<name>` symlinked at it, so `import.meta.url` is
  resolved while the entry path a user types is not. Comparing the two raw strings makes the script
  exit 0 having run nothing, and a check that silently passes is worse than no check. Use
  `realpathSync` on both sides, as `skills/write-doc/scripts/house-style.mjs` does.
- **Never add a dependency.** `package.json` is `private` with no `dependencies`, and the guard runs
  on the standard library alone. A guard that needs an install step is a guard that stops running.
- **Cite a bundled reference by its path inside the skill** — `references/criteria.md`, never a path
  that walks out of the folder. An installed skill is one directory and nothing above it exists.
- **Write to the house style.** `skills/write-doc/scripts/house-style.mjs` is the single copy of the
  mechanical rules; the guard runs it over every markdown file in the repo.

## Adding a skill

1. Create `skills/<name>/SKILL.md` with `name`, `description` and `when_to_use` folded as `>-`.
2. Set `metadata.suite: phil-d-skills`, and `metadata.host` where the skill reads any slot.
3. Write `compatibility` naming the fallback for every slot listed.
4. Add `argument-hint` where the body reads `$1`.
5. Bundle whatever the skill reads off disk under `references/`, `scripts/` or `assets/`.
6. Add one row to `README.md`'s `## Skills` table, naming the moment the skill runs.
7. Run `npm run guard`.

## Adding a slot

`host/README.md` § Adding a slot holds the six steps. Do not add a slot no skill reads.

## Checking a change reached a consuming repo

The guard never runs in a consuming repo, so a rule about how an installed skill behaves has to be
tested by installing it:

1. Create a scratch repo and run `npx skills add goji-phil/phil-d-skills --all` in it.
2. Confirm `.claude/skills/<name>` is a symlink into `.agents/skills/`.
3. Drop the matching `host/templates/*.json` in as `.agents/host.json`.
4. Invoke the skill in a fresh session and read what it does with an absent slot and a `null` one.
