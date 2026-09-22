---
name: ask-issue-status
description: >-
  Refresh a surface's issue rungs from the person who moved them — read the rungs silently, open
  with one question asking whether any issue changed status, drill in only where the answer is
  yes, write the answers back into the ladder, and carry the changes into the pull-request body.
  Offers a third answer that retires the ladder where the repo tracks status somewhere else.
when_to_use: >-
  Use when a pull request a designer or a client reads is being written up or updated, when a
  pre-pull-request hook blocks the command over stale rungs, when a review round pushes new
  commits to such a pull request, or when a status the app displays looks stale. Do not run it
  for an internal fix: that changes no rung and the ask is noise. Trigger phrases "refresh the
  issue statuses", "what status is this issue", "the ladder is stale", "ask about the rungs",
  "update the issue ladder", "the status hook fired", "we don't track it in the tracker", "stop
  asking about issues".
compatibility: >-
  Reads issues.ladder, issues.tracker, issues.doc, issues.ask, issues.retired, git.doc,
  docs.local and checks.typecheck from .agents/host.json. With issues.ladder null or
  issues.retired true the repo declares no rungs: the skill says so in one line and asks
  nothing. With issues.ask absent the rungs are read out of the ladder file directly. With
  issues.doc absent the rung words are read off the ladder file's own type or table.
metadata:
  suite: phil-d-skills
  host: [issues.ladder, issues.tracker, issues.doc, issues.ask, issues.retired, git.doc, docs.local, checks.typecheck]
---

# Ask for the issue statuses

A surface's issue rung is hand-set in the repo's own ladder and nothing reads the tracker to check
it, so the ladder is only as true as the last time somebody was asked. This skill is that asking,
and pull-request time is where it happens.

The short version: read the rungs without showing them, ask **one** question — did any issue change
status — and stop there where the answer is no. Where the answer is yes, ask which ones and where
each one stands, write the answers back, and add a line to the pull-request body.

**This is not a `decision-request`.** The answer comes from what the person knows rather than from
looking at a screen, so the ask needs no link and no reproduction steps. Running both skills for one
ask produces two questions about the same thing.

## 1. Check the repo declares rungs at all

Three answers end the skill before it asks anything, and each one is a single line back.

1. Stop where `issues.retired` is `true`. The repo dropped the ladder deliberately, so say that once and never raise it again in the session.
2. Stop where `issues.ladder` is `null`. The repo declares no rungs, so there is nothing to refresh.
3. Stop where `issues.tracker` is `null` and `issues.ladder` names no file. Work is tracked outside any tracker this skill can name.

## 2. Run it for an outward-facing pull request alone

The file named by `git.doc` picks the pull-request template by audience, and that pick is this
skill's gate. Where the slot is absent, judge the audience yourself: a designer or a client reading
it means run the ask.

- **A pull request somebody outside the team reads** — run the ask. The rungs are the part of that body they act on.
- **An internal correctness fix or a sync** — skip it. Clear whatever pre-pull-request check guards the command, and say in one line that you skipped and why.

Decide on the audience rather than on the size of the diff. A one-line change to a screen a client
signed off on changes a rung; a thousand-line refactor behind a data seam does not.

## 3. Read the rungs silently

This step costs the agent and never the person answering. Show nothing and ask nothing.
**Printing the rungs above the question is the failure here**, because step 4's options already
carry each issue and its rung. A list above them asks the same question twice and reads as a
prompt to correct the list rather than as one question about status.

1. Run `issues.ask`, which prints the touched surfaces' issues with their rungs and counts the rest.
2. Read the declared issues out of `issues.ladder` where `issues.ask` is absent, filtered to the surfaces `git diff --name-only <base>...HEAD` touched.
3. Stop here and go back to the pull request where no touched surface declares an issue. Say in one line that there was nothing to ask about.

Read the rung words and their labels out of the file `issues.doc` names, or off the ladder file's
own type where that slot is absent. Read them from there rather than from this file, because the
option lists below are built from that table and a second copy of it goes stale in silence.

## 4. Ask one question

Open with a single `AskUserQuestion` carrying one question — *"Did the status of any issues you were
working on change?"* — and three options.

| Option | Then |
|---|---|
| No, nothing changed | Stamp the ask as done where `issues.ask` supports it, say in one line that nothing changed, and go back to the pull request. Stop here. |
| Yes, some changed | § *Which ones changed status* |
| We track this somewhere else | § *Retire the ladder* |

**The question covers issues outside this session too**, so *no* ends the skill for every declared
issue in the repo and not only for the ones this pull request touched. That is what keeps the common
answer to one question: most pull requests change no rung.

**The third option's description states its cost** — whatever panel renders the rungs empties, and
the tracker links go with it. It deletes a declaration from every surface in the repo, and the
person answering is the one authorising that, so they must read what it costs before they pick it.

## 5. Which ones changed status

`AskUserQuestion` takes **four questions per call and four options per question**, and it adds its
own "Other" option. That budget decides the shape.

1. Split the issues first: **the session's issues** are declared by a surface whose folder appears in the diff and get asked about individually; **everything else** is every other declared issue in the repo and gets one general question between them.
2. Ask up to three `multiSelect: true` questions, four of the session's issues per question, each option naming the issue and its rung — `Courses list and detail views · Approved`.
3. Word each question as **which of these changed status**, so that ticking nothing is one click.
4. Ask the general question last, as the fourth: *"Did any issue outside this session change status?"* with `No`, `Yes, I will name them`, and `Yes, read them off the tracker`.
5. Split into a second call where the session touches more than twelve issues, keeping the general question in the last call alone.

Never drill through the second set issue by issue. A repo of any size declares more issues than
anyone will answer for, and an ask that costs ten minutes gets skipped the next time.

Add no "Other" or "No change" option of your own. The tool supplies the first and the empty
multi-select is the second.

## 6. Where each one stands

1. Ask one question per issue that got ticked, up to four per call, worded as *"Where does &lt;title&gt; stand?"*.
2. Build each option list from the ladder **minus that issue's rung**, which leaves one fewer than the ladder holds — an issue never moves to where it already sits.
3. Take the answer as authoritative. The ladder is the repo's own reading, not the tracker's.

**A tracker read is a proposal, never a write.** Where the answer was *"read them off the tracker"*,
query `issues.tracker`, then put the rungs you derived back for confirmation. A tracker's workflow
runs to a dozen or more states against a ladder of a handful, so every mapping is a judgment call
that belongs to the person answering.

## 7. Write the answers back

1. Edit the status field of each changed issue in `issues.ladder`, and touch nothing else in the file.
2. Add the issues named in answer to the general question, under the surfaces that declare them.
3. Stamp the ask as done where `issues.ask` supports it, **in a Bash call of its own**. A pre-pull-request hook blocks the whole command line, so chaining the stamp onto the `gh pr` call clears nothing.
4. Run `checks.typecheck` against its baseline. A rung outside the ladder's own union fails the typecheck at the label table.

## 8. Carry it into the pull-request body

Add one row per changed rung to the body's verification table, per the templates the `open-pr` skill
carries: the issue, the rung it left, the rung it reached, and that the person answering said so. A
rung that changed without a line in the body is a change nobody reviewing the pull request can see.

## Before handing back

Report the rungs that changed and the rungs that held, and say plainly where the answer was
*"nothing changed"*. A quiet ask is a result rather than a skipped step.

## Retire the ladder

The repo tracks status somewhere else, so the ladder is machinery nobody reads. Deleting every
declaration is the whole opt-out: a surface declaring none is never asked about.

1. Confirm once, plainly, what is about to be deleted: every surface's declared issues, whatever panel renders them, and the stored tracker links.
2. Delete the declarations from `issues.ladder`, **and everything that only they referenced** — the project constants above them, their explaining comment, and the type import. A strict compiler reports one unused-symbol error per leftover, so a surface declaring eight projects throws nine of them from one file. Touch nothing else: the per-screen status field is the mechanism the repo is keeping.
3. Write the ruling into `docs.local`, carrying whatever frontmatter that folder requires: that the repo tracks status elsewhere, the date and who ruled it, and the tracker project name and URL the deletion dropped, so the link survives the ladder. Where `docs.local` is `null`, write it into the repo's docs folder instead, because the ruling holds for every branch.
4. Point the answerer at the surface that carries the status control, with a link and the control's name.
5. Run `checks.typecheck`, then note the deletion in the pull-request body's verification table.
6. Set `issues.retired` to `true` in `.agents/host.json`, which is what stops this skill asking again.
