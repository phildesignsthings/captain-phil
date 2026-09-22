---
name: clean-done
description: >-
  Account for everything a session started before calling it done — kill the processes that were
  scaffolding, keep the ones asked for, report each check once, and write down anything that
  exists only in the transcript.
when_to_use: >-
  Invoke immediately before saying a task is complete, finished or done, before handing work back,
  before writing a handoff, and before opening a pull request. Invoke it whether the work took one
  turn or twenty. Example moments: a build is finished and about to be reported, a gate is about to
  be wrapped, a report is about to be sent, a session is about to fork to a fresh chat.
compatibility: >-
  Runs standalone in any repo. Step 2 needs the project's own check command; without one, report
  that no automated checks exist.
metadata:
  suite: captain-phil
---

# Finish clean

Done means the work is finished and the session left nothing behind. A task reported complete with
a watcher still running, a finding still in the transcript and a status still wrong is three
problems handed to the next person.

## The two classes of process

- **Scaffolding** is anything started to produce a number: a probe, a check, a screenshot script, a
  one-off server opened to measure something. It dies when the number has been read.
- **The deliverable** is anything the user asked for: a dev server behind a review link, a watcher
  they wanted left up. It stays, and it gets named.

Killing the second class is the same failure as leaving the first class running. Three things are
always the second class: a dev server behind a review link, a browser an MCP server drives, and
anything started before this session. An MCP browser is shared across every open workspace, so
killing it breaks somebody else's session.

## When it does not run

Skip this skill where the session started no process, wrote no file, produced no finding and moved
no status. A one-line answer or a single typo fix has nothing to account for, and an accounting of
nothing is noise.

Where a gate is being wrapped, `wrap-gate` owns the checks and the record. Run this skill inside it
and report only what those two do not already carry.

## 1. Account for what the session started

1. List every background process this session started, by what it was for.
2. Kill each one started to produce a measurement, once the measurement has been read.
3. Leave each one the user asked for, and name it with the port it bound.
4. Report both lists. "Nothing left running" is a line to write, never a line to omit.

## 2. Report each check once

1. Run each check once and report its result against the recorded baseline.
2. Never re-run a clean check to feel sure. A second clean run is not more evidence. This is a
   rule about running checks, not about writing them up.
3. Report a check that did not run as not run, rather than leaving it out.

## 3. Write down what exists only in the transcript

1. Name every finding, measurement and ruling produced in this session.
2. Write each one into the file that owns it, before reporting done.
3. Say where each went.

A finding that lives only in the transcript is gone at the next session, and the work that produced
it was wasted.

## 4. Leave every status true

1. Mark ready for review only what a reader can open and review without waiting on more work.
2. Leave an in-progress item reading in progress.
3. Correct any status this session made wrong.

## What the report has to carry

This skill does not format the hand-back. It decides what goes in it. Carry these four facts into
whatever writes the report, and let that skill shape them:

1. What was killed, and what was left running on purpose, with its port.
2. Each check's result, reported once, against its baseline.
3. What was written down, and to which file.
4. What changed status, and what stays in progress.

## Adapt on install

- Replace the check in step 2 with this repo's own command and its baseline file.
- Name this repo's homes for findings and rulings in step 3, so "the file that owns it" resolves.
