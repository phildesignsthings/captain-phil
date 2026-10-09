---
name: workflow-reflection
description: >-
  Study how a person has been working with Claude on one project, from their own session
  transcripts. Cut the transcripts to digests, price a sweep with one trial agent, have cheap
  agents read every session in date-ordered batches, merge their findings into one evidence file
  per phase, then write a team one-pager of the method as rules and a private report on the
  person's patterns and gaps.
when_to_use: >-
  Use when somebody wants to know how they work with AI on a project, wants their process written
  up so a teammate can repeat it, wants to find where their sessions lost time or spent the costly
  model, or has finished a stretch of work and wants a retrospective built from evidence rather
  than memory. Do not use it to judge a finished screen or board, which is `audit-design`, or to
  check a build against agreed scope, which is `drift-check`. Trigger phrases "how do I work with
  AI", "study my sessions", "write up my process", "retro on how I've been working", "what does my
  workflow look like", "read my transcripts", "where am I wasting tokens".
argument-hint: "[project folder or glob under ~/.claude/projects]"
compatibility: >-
  Needs Node and the session transcripts Claude Code keeps under ~/.claude/projects. Reads
  docs.local and docs.root from .agents/host.json. With docs.local set, the one-pager goes there.
  With docs.local null, it goes under docs.root. With docs.root null as well, it goes in the study
  folder beside the private report, and the hand-back says so. With docs.local absent, ask once
  where branch-local docs live and offer to record the answer.
metadata:
  suite: captain-phil
  host: [docs.local, docs.root]
---

# Workflow reflection

The short version: digest the transcripts, split them into date-ordered phases, price the sweep
with one trial agent and get a go, sweep one phase per gate with Sonnet agents, merge each phase's
findings into an evidence file, then write the one-pager and the private report from the evidence
files alone.

**Price the sweep before running it.** Reading a few hundred sessions costs millions of tokens. The
trial in step 4 turns that into a number the person agrees to before any other agent starts.

`<skill dir>` in every command is the folder holding this `SKILL.md`. An installed skill is a
symlink, so the path differs per repo. `<study>` is `.context/workflow-reflection/` in the project
root.

## 1. Scope the study

1. Ask the person four things in one message: their name and role, the project and its dates, any
   question they want a phase to answer, and their review budget.
2. Read `cleanupPeriodDays` in `~/.claude/settings.json`. Claude Code deletes transcripts older
   than that many days, 30 where the key is absent.
3. Tell the person how far back the transcripts reach. Offer to raise the setting, and edit it only
   on a yes.
4. Find the project's transcript folders. `~/.claude/projects/` names each one after the working
   directory's path with every character other than a letter or a digit turned into `-`, and each
   worktree gets its own.
   Where `$1` names a folder or a glob, start from it.
5. Run `git check-ignore -q .context/workflow-reflection` from the project root. Exit 1 means the
   folder is not ignored, so add `.context/` to `.gitignore` before writing anything.
6. Create `<study>/STATE.md`, holding the goal, the person's answers and a gate table with one row
   per phase plus a closing row for the two reports.

## 2. Digest the transcripts

1. Run the digest, labelling the person's turns with their first name in capitals:

   ```bash
   node <skill dir>/scripts/digest.mjs <study>/digests "~/.claude/projects/<project folder>*" --user NAME
   ```

2. Add `--since` and `--until` to bound the dates, and `--branch` to keep only sessions on one
   branch.
3. Read `<study>/digests/index.tsv`, and report the session count per workspace and the date span.
4. List the sessions whose titles name another client or project, and the session that opened this
   study. Ask which to leave out, and record the answer in `STATE.md`.

## 3. Split the work into phases

A phase is a stretch of dates where the work had one character: setup, a build, a hardening pass.
Each phase is one gate, so its evidence file has to fit one context.

1. Read the titles in date order and propose the phase boundaries, with dates and session counts.
2. Keep each phase to six batches or fewer, about 200 sessions. Split a larger stretch in two.
3. Make a second repo its own phase, where the person worked in two.
4. Write the phases into the gate table in `STATE.md`.

## 4. Price the sweep with a trial

1. Copy `assets/sweep-prompt.txt` to `<study>/sweep-prompt-1.txt`, one copy per phase.
2. Fill `{{PERSON}}`, `{{ROLE}}`, `{{PROJECT}}`, and `{{LABEL}}` with the name passed to `--user`.
3. Replace `{{EXTRA_SECTIONS}}` with the first two blocks of `assets/extra-sections.txt`, and fill
   `{{KNOWN}}` with "nothing known".
4. Add the third block where the person asked a question about this phase, filling `{{QUESTION}}`
   and `{{WHAT_COUNTS}}`.
5. Leave `{{OUTPUT_PATH}}`, `{{DIGEST_DIR}}` and `{{FILES}}` for `batch.mjs`, which fills them per
   batch.
6. Batch the first phase, writing one prompt per batch:

   ```bash
   node <skill dir>/scripts/batch.mjs <study>/digests <study>/batches --name 1 \
     --since YYYY-MM-DD --until YYYY-MM-DD --exclude <session,session> \
     --prompt <study>/sweep-prompt-1.txt --findings <study>/findings
   ```

7. Spawn one agent with `model: "sonnet"` set on the call, told to read
   `<study>/batches/1-1.prompt.md` and follow it exactly. An agent with no model inherits the
   session's, which is the costly one.
8. Read its findings file. Check every section is present and every point cites a session stem, and
   fix the prompt before anything else spends tokens on it.
9. Divide the agent's total tokens by the batch's characters to get a tokens-per-character ratio.
   Expect about one token per character. A ratio far above that means the agent read files twice
   or wandered outside its list.
10. Run `batch.mjs` once per phase with `--tokens-per-char <ratio>`, and add up the totals.
11. Tell the person the total tokens, the agent count and the gate count, and wait for a go.

## 5. Sweep one phase per gate

1. Make the phase's prompt copy as step 4 does, filling `{{KNOWN}}` with the firsts the earlier
   phases found.
2. Run `batch.mjs` for the phase with `--name <phase>`, `--prompt` and `--findings`. Skip this in
   the trial's phase, which already has its batches.
3. Leave out the batch the trial already read.
4. Spawn one agent per remaining batch in a single message, each with `model: "sonnet"`, each told to read
   its prompt file and follow it exactly.
5. Check every findings file exists and holds every section. Rerun a batch whose agent failed.
6. Tally the models, with the same `--exclude` the batches used:

   ```bash
   node <skill dir>/scripts/tally.mjs <study>/digests --since YYYY-MM-DD --until YYYY-MM-DD \
     --exclude <session,session> > <study>/tally-<phase>.txt
   ```

7. Write `<study>/evidence-<phase>.md` from the findings and the tally, to
   `references/evidence-template.md`.
8. Update `STATE.md` with the phase's cost, its checklist count and its firsts.
9. Stop at the gate. Run `wrap-gate` where it is installed.

## 6. Write the two reports

The closing gate reads the evidence files and nothing under `findings/`.

1. Read every evidence file, oldest phase first.
2. Read `~/.claude/usage-data/report.html` where it exists, and note the dates it spans.
3. Write the one-pager to `references/one-pager-template.md`, into the folder the compatibility
   line names.
4. Write `<study>/private-report.md` to `references/private-report-template.md`.
5. Run `unslop` over both where it is installed.
6. Hand back both paths and each file's word count. Say which one is private.

## Never

| Never | Why |
| --- | --- |
| Start a sweep the person has not priced and agreed | a few hundred sessions cost millions of tokens |
| Spawn a reading agent without `model: "sonnet"` | it inherits the costly model, and the sweep costs several times the trial's price |
| Commit `<study>` | the digests hold everything the person typed, including anything pasted by mistake |
| Put a habit, a gap or a cost in the one-pager | those are the private report's, and the person decides who sees them |
| Keep a point no session stem supports | the reports are worth reading only because every claim traces to a session |
