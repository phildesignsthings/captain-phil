---
name: freeze-memory
description: >-
  Retire a project note whose content an authoritative external home has taken over — name the
  replacement, set its status to superseded with a pointer, move it to the archive, and give it
  a ledger gloss. Runs the reverse question too: read the tracker's document set and report
  which notes are ready to freeze.
when_to_use: >-
  Use when an external document now carries what a project note holds, when two sources
  disagree and one of them is ours, when a note has stopped being edited, or when somebody asks
  what in the project notes is out of date. Trigger phrases "freeze this memory file", "Linear
  has this now", "what can we retire from memory", "which notes are stale", "archive this note",
  "supersede this file".
compatibility: >-
  Reads memory.root, memory.archive, memory.doc, memory.gloss, issues.tracker and checks.guard
  from .agents/host.json. With memory.root null the repo keeps no project notes and this skill
  says so in one line and stops. Without memory.doc, the four statuses in
  references/memory-statuses.md apply. With issues.tracker null, there is no document set to
  sweep, so the reverse question cannot be answered.
metadata:
  suite: captain-phil
  host: [memory.root, memory.archive, memory.doc, memory.gloss, issues.tracker, checks.guard]
---

# Freeze a project note

A note is frozen when its content has one authoritative home outside the repo, and the note's
remaining job is to point at it. The note is never deleted: a reader who arrives with the old
filename has to land somewhere that points forward.

`references/memory-statuses.md` holds the four statuses and what each one means, and the file named
by `memory.doc` overrides it where the repo declares its own. This skill runs the transition, and
the question that comes up more often than the transition does.

**Stop where `memory.root` is `null`.** The repo keeps no project notes, so there is nothing to
freeze. Say that in one line and stop. Where the slot is absent, ask once whether the repo keeps
project notes anywhere, and offer to record the answer in `.agents/host.json`.

Two rules bind every run:

- **A file declaring `never_freeze: true` is a stop, not a preference.** Report it and move on. Each
  such file states its reason in its opening paragraph.
- **`frozen` and `superseded` are different states.** `frozen` means the file records what we
  believed at a moment and is worth keeping as history. `superseded` means the content moved, and
  the file it moved to is the correct one.

## The reverse question: which notes are ready

Answer this before proposing any move, and answer it on its own where that is what was asked.

1. Stop where `issues.tracker` is `null` or absent. Nothing outside the repo can supersede a note,
   and a note nobody edits is a note nobody edits.
2. Read the note recording which external services this project's material comes from, for the
   team's document set and its index document.
3. Read the index document first. It clusters every document by product surface, so a document
   missing from it is either brand new or misfiled, and a surface with no document has nothing that
   could supersede a note.
4. Sweep the tracker's own document list rather than trusting a table's titles. Titles churn, get
   re-prefixed, and get suffixed once they are replaced.
5. Report one line per note: which document covers it, whether that document is approved, and
   whether the note holds anything the document does not.
6. Recommend a freeze only where the document is **approved**. A draft is a peer, and freezing
   against a peer loses content to a document that can still change.

## 1. Name the replacement

1. Confirm which one note this is for. One file per run.
2. Open the document that carries the content and read it end to end.
3. Diff it against the note, and list what the note holds that the document does not.
4. Move that remainder before touching the status — into the document where it belongs there, or
   into the repo's open-questions note where it is an unresolved gap. A freeze that drops content is
   a deletion wearing a pointer.
5. Record the replacement's URL, or the in-repo path where the content stayed in the repo.

## 2. Set the status and the pointer

Edit the frontmatter, and edit nothing else in the file.

1. Set `status: superseded`.
2. Add `superseded_by:` with the URL from step 1. A value containing a colon and a space breaks the
   YAML parse, so quote it.
3. Keep the note's own `read_when:` triggers as they are. A reader still arrives by those, and the
   pointer is what they get.
4. Replace the body with one paragraph naming what moved and where, where the body would otherwise
   read as current truth. Leave a short note as it is.

A superseded file with no pointer is a dead end that still reads as authoritative, so step 2 is not
optional.

## 3. Move it to the archive

1. Run `git mv` into the folder named by `memory.archive`, so the move reads as a rename rather than
   a delete plus an add.
2. Leave the file where it is and say so in one line, where `memory.archive` is `null` or absent. The status
   and the pointer carry the retirement on their own.
3. Keep the filename. The name is how a reader arrives, and it is the key a ledger's gloss is
   written against.
4. Check no live file shares that basename. A ledger keyed by basename alone collides two files of
   the same name into one row.

## 4. Give it a ledger gloss

Skip this step and say so in one line where `memory.gloss` is `null` or absent.

1. Open the file named by `memory.gloss` and find the note's line.
2. Add one where it has none, so the archived row carries a gloss rather than an empty column.
3. Leave the line's position alone. Order in that map sets order within a group.

## 5. Check it, then say what moved

1. Run the command in `checks.guard`, which is what fails a superseded file with no pointer. Where
   the slot is `null` or absent, re-read the frontmatter by hand and confirm the pointer resolves.
2. Confirm the note renders under the archive group rather than as an orphan, wherever the repo
   lists its notes. An orphan row means the status did not parse.
3. Report the note, the document that replaced it, and what step 1 moved elsewhere. A reader who
   knew the previous shape needs one line naming which file holds the content.
