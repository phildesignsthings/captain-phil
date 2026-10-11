---
name: gate
description: >-
  Open a gate from the state record the last one left behind — find the record, confirm the
  previous gate is closed, state the reading in three lines, then build without waiting.
when_to_use: >-
  Use when a fresh chat opens on a gate that a previous session wrapped, when a handoff names a
  gate to pick up, or when work resumes after a review pause. Trigger phrases "/gate 4b", "pick up
  gate 3", "start the next gate", "carry on from the handoff". Do not use it to close a gate —
  `wrap-gate` does that — and do not use it to plan a gate that no record names.
argument-hint: "[gate-id]"
compatibility: >-
  Reads the gate-state record `wrap-gate` writes. Without that skill, point this one at whatever
  file records a gate's finished state and its entry point.
metadata:
  suite: captain-phil
---

# Open a gate

A gate opens from a record, never from a transcript. This skill reads that record, proves the previous gate is closed, and prints the reading before any work starts, so a misread costs one correction rather than a gate.

In short: find the record, check the previous gate is closed, print three lines, build.

## Requirements

- **A gate-state record**, which `wrap-gate` writes as `gate-state.md` into the project root's gitignored scratch folder.
- **`wrap-gate`**, to close what this skill opens.

Where `$1` names the gate, use it verbatim in every line printed. Where `$1` is empty, read the most recent entry in the record, name the gate its `### Next gate starts from` points at, and ask for a gate id where that heading names none.

## 1. Find the record

1. Look for `gate-state.md` in the project root's gitignored scratch folder, the path `wrap-gate` writes to.
2. Ask for the path in one line where that file is absent, then continue from the answer.
3. Report that no gate is in progress, and ask which plan the work follows, where no record exists anywhere.

## 2. Confirm the previous gate is closed

Read the most recent entry in the record and act on its `**State:**` line.

| The line reads | What it means | What to do |
|---|---|---|
| `verified` or `committed` | The gate is closed | Continue to step 3 |
| `built` | Verification is owed | Refuse, and name the routes the entry lists under **Verified on screen** (**Verified in the browser** where the record uses that heading) as unmeasured |
| `built \| verified \| committed` | The template placeholder survived, so nobody filled it | Refuse, and say the record is unfilled |
| No `**State:**` line | The entry is part-written | Refuse, and name the headings the template owes |

Refusing prints what the previous gate is missing, then stops. Start nothing, and poll nothing: a sibling session working the same gate leaves no trace this skill can read, so a wait has no end condition. The designer overrides a refusal by invoking this skill again with a word saying to proceed.

Report the gate as wrapped already, and ask which gate to open, where `$1` matches an entry the record holds.

## 3. State the reading

Print three lines, and nothing beside them.

```markdown
**Gate:** <$1, and its title from the plan>
**Starts from:** <the previous entry's "Next gate starts from", verbatim>
**Building:** <one sentence, what this gate produces>
```

- Quote the entry point verbatim, rather than paraphrasing it, so a mismatch reads as a mismatch.
- Name one deliverable on the third line. Two means the gate is oversized for a single context.

## 4. Build

1. Read every path the previous entry lists under **Landed**, and the plan section its `**Plan:**` line names.
2. Build without waiting for a nod. The scope was settled when the previous gate was wrapped.
3. Stop and ask where the record's entry point names a file, a board or a question that is absent.
4. Run `wrap-gate` when the build work is finished.

## Adapt on install

- Replace the record path in step 1 with wherever this repo records a gate's finished state.
- Replace the `**State:**` values in step 2 with whatever words that record uses for closed work.
- Cut the `wrap-gate` line in step 4 where this repo closes a gate another way.
