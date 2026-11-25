# Product

<!-- impeccable:product-schema 1 -->

<!-- Draft, 2026-11-19, written by the planner from plan.md in this folder. It moves to the captain-phil repo root through a PR in the first gate of the build. Not shipped yet. -->

## Platform

agent skills

A suite of agent skills for Claude Code, installed into a repo or globally with `npx skills add`. It has no app and no server. It runs inside whatever Claude Code session the designer opens.

## Stack

- **Skills:** markdown `SKILL.md` files, each with `references/`, `scripts/` and `assets/` folders that install alongside it. Bundled scripts are Node on the standard library only, with no dependencies.
- **Install:** the `skills` CLI (`npx skills add`, `npx skills update`), which records content hashes in `skills-lock.json`.
- **Configuration:** `captain.json` at the root of the designer's brain repo. It points at the taste overrides, each product repo with its host answers, and plans. For one release, the old in-repo `.agents/host.json` is read as a fallback with a warning.
- **Guard:** `npm run guard` checks the repo's invariants and house style before every commit.

## Users

- **First:** Phil alone. He's a product design lead who designs and prototypes in code with Claude Code, in gated plans that stop for his review.
- **Next:** other designers who code with Claude Code. This includes designers at Phil's employer, who can choose to use it. It isn't a deliverable for his employer.
- **Later:** anyone who finds the public repo.

The job is the same at every stage. A designer who isn't Phil gets output with his process and his quality bar, using Claude Code only, with no bot team behind it.

## Product Purpose

captain-phil is Phil's working defaults, packaged so another designer can drive them. It plans work as gates that stop for review. It asks for each decision in one fixed shape and reports finished work in another. It never calls a screen rendered until something has looked at it.

The designer keeps a brain repo of their own, laid out however they like. The suite reads it through `captain.json` and does the work in whichever product repo the designer points it at.

v1 adds the following:

1. `captain.json`, the brain's index, which every skill uses to find its answers.
2. Phil's taste as the shipped default. Correctness rules are the bar. Style rules can be overridden.
3. `taste-grill`, which records where the designer's taste differs from Phil's.
4. `plan-it`, which takes an idea to a written, gated plan one decision at a time.
5. `review-build`, a reviewer subagent with a fresh context. It writes the test plan before the build and reviews one commit after it.
6. `house-style`, which makes new code match a reference: the repo's own example code, or another repo the designer names.

Success means two checks pass on a cold run: a fresh brain with no agent-team tooling and none of Phil's setup. First, the loop works. The taste grill runs, one screen gets built, and the reviewer catches a planted bug. Second, the same screen brief, built by Phil's setup and by the cold run, holds up side by side when judged on the bar. After release, a real designer pilots it on their own work.

## Positioning

Most AI tooling for designers is prompt packs. captain-phil is a working discipline: gates, verification before "done", one shape for asking and one for reporting, and an independent reviewer. The discipline transfers. Phil's eye doesn't, and the suite doesn't claim it does.

It sits beside a sister product, an overnight runner, which runs a gated plan unattended overnight and reads the same gate-state record.

## Operating Context

- It runs in Claude Code sessions on the designer's own machine, started from their brain repo.
- Product repos stay untouched by default. Opt-in hooks go into a product repo only where they're needed, and gitignore lines go in `.git/info/exclude`.
- Gates are `## Gate <id>` headings in a plan, so a plan can be run by hand or overnight in the sister product.
- Updates pull from `main`. A breaking change gets a release with a fallback first, then removal in a later release.

## Capabilities and Constraints

**Confirmed**

- **One layer.** It's public and MIT, with no separate team pack. Client context lives in each designer's brain, never in the suite.
- **The suite doesn't build the brain.** It's personal and hands off. The suite only reads `captain.json`.
- **`captain.json` slots follow the host-file rules.** A value means use it, `null` means skip the step, and a missing slot means run the fallback and offer to write the answer.
- **Phil's taste is the default.** The designer's overrides sit on top. Correctness rules (counts add up, a tap equivalent for hover, a crowded stress case, the longest real content) can't be overridden.
- **The reviewer is independent.** It runs in a fresh context, reads its rules from the brain and the base branch, and never from the build branch. A permission rule that blocks edits to its files is on by default. After three failed rounds it hands back to the designer.
- **Every published file is name-clean.** No client, employer, coworker or personal-lane names. A name scan runs as an enforced step before each release merges.
- **Never add a dependency** to the suite repo.

**Undecided**

- Which hooks go into product repos, and when. This is the builder's call unless a hook touches files the client can see.
- Whether `captain.json` keeps a general `tools` slot for outside tools.
- When the 103 per-skill lessons land. They go into post-release rewrite batches after Phil reviews them, but the batch order isn't set.
- Who owns lessons that came from client work, even when they're written generically. Phil must settle this before the suite spreads.

## Brand Commitments

- **Name:** captain-phil. "Captain Phil mode" is the session switch.
- **Voice:** the README opens in Captain Phil's pirate voice, with one plain paragraph above it that says what the suite does, so a coworker sees the substance before the bit. Skills, references and reports are plain, declarative and unslopped.
- **MIT licensed**, public, read-only for outside contributors.

## Evidence on Hand

- 31 skills on `main`, plus the host file, three host templates, the guard and the `/articles` manual.
- Phil uses it daily on his own repos and client work.
- The lessons map: 108 lessons from Phil's bot team, mapped to the suite's skills and written generically (`context/lessons-map.md` in the plan folder).
- The plan with every decision and its why (`plan.md` in the plan folder).

**Absent, and not to be invented:**

- any designer other than Phil who has used it
- a measured comparison between Phil's output and another designer's
- adoption numbers or testimonials

## Product Principles

1. **The discipline ships. The eye doesn't.** The suite can enforce Phil's bar and carry his defaults, but review is where his output actually gets good. Treat the gap the cold run shows as the next work, not as a failure.
2. **Ship smaller than feels finished.** Hold v1 to its list. Scope has crept once already, from "fold in the learnings" to five new parts.
3. **Five skills before thirty.** A new designer gets a short "your first week" path in `articles` before they meet the full suite.
4. **Lessons get pruned, not just added.** Each lesson earns its place. The suite reviews them on a schedule, the way the reviewer's checklist does, so it never becomes the long prose its own writing rules warn against.
5. **Never break a designer mid-project.** A breaking change goes through a release with a fallback first.
6. **Fun on the outside, plain on the inside.** The pirate voice is the front door. Everything an agent or a designer acts on is written plainly.
