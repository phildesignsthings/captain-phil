---
name: write-doc
description: >-
  Write or rewrite a doc, a skill or a project note so it lands in the right home and reads to
  house style — triage procedure against catalogue against retirement record, cut duplicated
  facts down to one home, apply the writing rules, link the jargon, and self-check.
when_to_use: >-
  Use when adding a doc, rewriting one, splitting a doc into a skill, appending a section,
  writing a skill, recording a meeting's outcome, appending to a decision ledger or an
  open-questions list, or when a doc has grown past the point anyone reads it. Trigger phrases
  "write a doc", "update the docs", "turn this into a skill", "document this", "update our
  memory", "record this meeting", "log this decision", "this doc is too long", "where does this
  go".
compatibility: >-
  Reads docs.root, docs.index, docs.glossary, docs.retired, docs.local, memory.root, memory.doc,
  memory.gloss and checks.guard from .agents/host.json. With docs.root null, the repo keeps no
  docs folder and a doc is written where the reader who needs it will be; with it absent, ask
  once and offer to record the answer. With memory.root null, the repo keeps no project notes,
  so step 1 never routes content there. Without checks.guard, step 6 runs by hand.
metadata:
  suite: captain-phil
  host: [docs.root, docs.index, docs.glossary, docs.retired, docs.local, memory.root, memory.doc, memory.gloss, checks.guard]
---

# Write a doc or a skill

`references/house-style.md` owns the rules. This skill runs them in order.

Do the triage before writing a word. Content written into the wrong home reads fine and gets read by nobody, which is the failure this whole procedure exists to prevent.

The short version: decide which of the four homes the content takes, search for the fact before writing it, apply the house style, index the file where a reader finds it, and run the guard.

## 1. Triage the content

Ask what the content is, in this order, and stop at the first match.

1. **One project's context — a decision somebody made, a question nobody has answered, research, something a stakeholder sent** → a project note, under `memory.root`. Go to step 1a.
2. **Ordered, triggered, has a done state** → a procedure. It belongs in a skill.
3. **Scanned and matched — a table, a token list, a symptom index, a template** → a catalogue. It belongs in a doc under `docs.root`.
4. **Explains why something is gone, and asks nothing of the reader** → a retirement record. It belongs under `docs.retired`.

`references/house-style.md` § Three kinds of content, three homes carries the test behind each row.

Two calls that come up every time:

- **A topic that splits is the normal case.** Put the steps in the skill and the tables in the doc.
- **A doc you cannot rewrite without repeating a procedure is holding one.** Move the procedure out rather than trimming around it.

**Each `docs` slot has three states, and `null` is an answer.** Take the row that matches:

| Slot | Set | `null` | Absent |
|---|---|---|---|
| `docs.root` | Write the doc there | The repo keeps no docs folder, so write the doc where the reader who needs it will be, and say so in one line | Ask once where the repo keeps its docs, then offer to record the answer in `.agents/host.json` |
| `docs.retired` | Write the retirement record there | Keep the record beside the doc it retires from, and say so in one line | Run the `null` behaviour, and offer to record the answer |
| `docs.local` | Write a branch-local note there | Every note is repo-wide, so the convention goes in the doc that owns its topic | Run the `null` behaviour |

Never ask about a `null` slot. The repo already answered, and being asked the same question every session is how a suite gets uninstalled.

### 1a. Route it inside the project notes

Run this branch for anything landing under `memory.root`. The three-way triage does not choose the file there, because a note's home is decided by a different question: which status the content takes, and therefore which file can hold it.

1. Stop where `memory.root` is `null`. The repo keeps no project notes, so the content belongs in a doc or a skill — go back to step 1 and take the next matching row.
2. Read the file named in `memory.doc` for the repo's statuses and how each one is edited. Where the slot is absent, read the four statuses the `freeze-memory` skill bundles under its own `references/` folder.
3. Skim every candidate file's `read_when` frontmatter and pick the one whose trigger fires on this content.
4. Read the target file's `status` before writing, because each status is edited a different way.
5. Append to an `append-only` file, in date order, and never rewrite an entry already there.
6. Overwrite a `living` file where it has stopped being true, rather than appending a correction beside the stale sentence.
7. Stop at a `frozen` or `superseded` file, and write the current view elsewhere.
8. Say which earlier entry a new one supersedes, whenever it supersedes one.
9. Separate what got decided from what got discussed, and label the second as ideation.

**A branch-local convention is not a project note.** A vocabulary, an approval loop, a process log or a lesson that binds one branch goes under `docs.local`, per the table in step 1.

## 2. Cut it to one home

Search for the fact before writing it. A fact lives in exactly one file.

1. Grep the corpus for the distinguishing noun — the token name, the path, the component, the rule's subject.
2. Where a second copy turns up, pick the file whose `read_when` trigger fires first, and delete the other copy.
3. Replace the deleted copy with a citation naming the file, the section, and what the reader gets there.
4. Never quote a table into a skill. Cite it.

## 3. Apply the house style

`references/house-style.md` § The rules is the full table. The rules that bite hardest:

- Write one instruction per list item in a procedure.
- Open every list item the same way, so the list reads as one shape.
- Open each paragraph with its distinguishing fact.
- Say `must`, `We recommend`, `can` or `might`, and avoid `should`.
- Cut the anchoring words the table names.
- Cut excessive claims: `simply`, `easy`, `just`, `it's that simple`.
- Cut metaphor and figurative language from a doc or a skill.
- Reserve all caps for a prohibition or a trap that already cost time, and use bold elsewhere.
- Break any wall of text into paragraphs, headings or a list.

The carve-outs are in that table and nowhere else. A design record keeps its metaphor; a retirement record and an append-only note keep their dated language; every other rule binds all four homes.

**Writing a skill takes a second reference.** `references/skill-authoring.md` holds the frontmatter shape that makes a skill trigger, what `argument-hint` and `context: fork` cost, and why `allowed-tools` stays unset.

## 4. Link the jargon

1. Read the file named in `docs.glossary` and check whether each internal term the draft uses has an entry.
2. Add a heading and a definition there for any term that has none.
3. Link the term's first use in the draft to the glossary entry, rather than defining it in place.
4. Define an acronym the same way.

Where `docs.glossary` is `null` or absent, the repo keeps no glossary: define each term on its first use in the draft, in one clause, and never twice in the same file. Offer to record the answer where the slot is absent rather than `null`.

## 5. Wire it up

- **A doc gets `read_when` frontmatter**, one trigger per section the doc routes. A `read_when` item containing a colon and a space breaks the YAML parse, so quote the whole item.
- **A doc declares `house_style: true`**, which opts its prose into the guard's checks. Write to the style and set the flag in the same commit.
- **A project note gets `read_when` and `status`**, and never `house_style: true`. A file whose `status` is missing or unrecognised is an orphan wherever the repo lists its notes.
- **A project note gets a one-line gloss** in the file named by `memory.gloss`. A note with no gloss lists blank. Skip this where the slot is `null` and say so in one line.
- **A doc gets a line in the read-when index at `docs.index`**, naming the trigger rather than the contents.
- **A skill gets a line in that same index**, carrying its frontmatter `name` verbatim.

Where `docs.index` is `null`, the repo runs no read-when index and the file is findable by search alone — say so in one line. Where the slot is absent, say the same and offer to record an index file in `.agents/host.json`.

## 6. Self-check before handing back

Run these, and fix what they report:

1. The command in `checks.guard`, from the repo root. Where the slot is `null` or absent, run `node <skill dir>/scripts/house-style.mjs <file>` over each file the pass touched.
2. A grep of the draft for `should`, and for each anchoring word the style table names.
3. A read of the first screen alone, asking whether an agent that stopped there would act correctly.
4. A run of every command the draft hands a reader, pasted verbatim into a shell this session. Fix any that fails, and mark any you cannot run as `not run` beside the command.

**A repo's guard rarely reads its project notes.** Confirm what `checks.guard` covers before reading a clean run as a pass on a note, and run steps 2 and 3 by hand where it covers nothing.

Report what moved and where it went. A reader who knew the previous shape needs one line naming which file holds what.
