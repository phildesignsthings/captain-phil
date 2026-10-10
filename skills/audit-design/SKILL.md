---
name: audit-design
description: >-
  Score a designed surface — a Paper page of boards — against six criteria quoted from the
  project's product record, with a fixed versioned sweep list, severity tagged by a scorer
  sub-agent in a fresh context, a script that turns severities into the score and renders the run
  record, and findings split into "just fix" and "needs a call".
when_to_use: >-
  Use when a page or a flow is finished enough to be judged, when a fix round has landed and the
  same surface has to be re-scored, when a designer asks how good a page is in a number, or when
  two scores are about to be compared. Trigger phrases "audit this page", "re-audit", "score the
  boards", "how does this page score", "run the heuristics", "is it at the bar", "what did the
  sweep catch".
argument-hint: "[surface]"
metadata:
  suite: captain-phil
---

# Audit a designed surface

The short version: fix the surface and the sweep version; read the records; run the sweep list in its four phases; write each finding to a board with its evidence, withdrawing on measurement; hand the findings to the scorer in a fresh context; run the script; split what survives into "just fix" and "needs a call"; render the run record. An audit reads and writes no boards.

The bundle is self-contained. `references/criteria.md` holds the six criteria, the severity table, the mapping and the terms. `references/sweeps.md` holds the sweep list and the Paper MCP facts it relies on; `references/sweeps.json` holds the ready-made calls. `scorer.md` is the sub-agent prompt. `scripts/score.mjs` does the arithmetic and the writing. Nothing outside this folder is required.

`<skill dir>` in every command below is the folder holding this `SKILL.md`. An installed skill is a symlink into a lock-managed folder, so the path differs per repo and hardcoding one breaks the run.

Everything a run produces is scratch. It lands in a gitignored folder — `.context/design-audit/<slug>/` by default, or whatever scratch folder the project ignores — and never in a tracked file.

## 1. Fix the run

1. Read `references/criteria.md` once.
2. Name the surface — for a Paper page, the file id and the page name — and pick a slug for the scratch folder. Where `$1` is given, it names the surface; otherwise ask.
3. Name the sweep version: the highest version in `references/sweeps.md`. Refuse to score a kind of surface that file has no list for; write its v1 first.
4. Read the product record — `PRODUCT.md`, a PRD, a brief, whatever the project has — and the surface's design record or rules board. Where no product record exists, write the six standards as stated assumptions in the skeleton's `assumptions` field and flag every finding that rests on one.
5. Read the previous run's record in the scratch folder where one exists, and never re-raise a finding it withdrew on measurement.
6. Set `loading_in_scope` (`references/criteria.md` § 6 states the rule) and the bar as a band; ask the designer for the bar when none was given, and default to Good when nobody answers.
7. Create the findings file:

   ```bash
   node <skill dir>/scripts/score.mjs --skeleton \
     --surface "<file id> · <page name>" --kind paper-boards --sweep 3 --bar Good \
     --loading-in-scope false > .context/design-audit/<slug>/findings.json
   ```

## 2. Sweep

1. Read `references/sweeps.md` § Scope and § Order of work, then open `references/sweeps.json`.
2. Run phase A, then send every phase B call in one message, then phase C in parallel messages of ten, then phase D one screenshot per message. `sweeps.md` § Paper MCP facts states why the order is what it is.
3. Log each sweep number as done in `<scratch>/sweep-log.md`. A skipped sweep voids the score.
4. Write each finding into `findings.json` as `findings.example.json` shows — id, criterion, board, finding, evidence, the sweep number that produced it, status — and leave `severity` null.
5. Set `"sweep": null` on a finding no listed sweep produced. The script reports it as an off-list check and scores it in no run.
6. Withdraw a finding the measurement or the records overturn with `"status": "withdrawn"` and a reason. The reason is a ruling the next run inherits.

## 3. Score in a fresh context

1. Launch one general-purpose agent in the foreground with the full text of `scorer.md`'s prompt, the absolute path of `findings.json`, and the absolute path of `references/criteria.md`. It tags severity, confirms each criterion, and returns the file.
2. Withhold every earlier score, the bar, the fix round's history and your own view of how the round went; `scorer.md` § What the scorer never sees states why.
3. Run the control, then the score:

   ```bash
   node <skill dir>/scripts/score.mjs --self-test
   node <skill dir>/scripts/score.mjs <scratch>/findings.json
   ```

4. Read each criterion's written scale against the number printed. A disagreement means one finding's severity is wrong; argue the severity with the scorer, never the number.
5. Mark a criterion `n/a` only when the surface cannot exercise it, in `criteria_na` with a one-line reason.

## 4. Split and present

1. Sort every open finding into **just fix**, where the surface already carries a precedent, and **needs a call**, where it does not.
2. Put each call to the designer with the board's coordinates and what to look at. Where the project has a decision-request skill, run it; otherwise give one link or location and numbered steps per call.
3. Report the withdrawals alongside the findings, with each reason.
4. Report the score against the bar under its sweep version, and separately how many of the previous run's findings closed. Never subtract one from the other.
5. Lead with what the surface is and what holds it down. The designer reads the finding, never the method.

## 5. Record

1. Render the run record and keep it in scratch:

   ```bash
   node <skill dir>/scripts/score.mjs --record <scratch>/findings.json > <scratch>/run-record.md
   ```

   The record carries the four things a later reader needs: the per-criterion score with each finding named to a board, the withdrawals with reasons, what the sweep caught that a read would not have, and what it missed. Fill the last two sections by hand; `--record` leaves the headings.
2. Version the sweep list in `references/sweeps.md` and `sweeps.json` for each off-list finding, then re-score the surface under the added version before the session ends.
3. File a withdrawal grounded in the surface's own rule as a line on the rules board or in the design record. Where the project has a record-design skill, run it; otherwise append the line yourself.
4. File a mechanism the sweep exposed — a tool that cannot see an attribute, a read that lies — in `references/sweeps.md` § Paper MCP facts, and in the project's own gotchas doc where it has one.
5. Fill § Missed after the fix round or the designer's read, never before.
