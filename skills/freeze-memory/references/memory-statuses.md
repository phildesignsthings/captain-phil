---
house_style: true
read_when:
  - "A project note is being written and its status decides how to edit it"
  - "A repo answers no memory.doc slot and the statuses have to come from somewhere"
  - "A note is being retired and the difference between frozen and superseded matters"
---

# The four note statuses

Every project note declares a `status` in its YAML frontmatter, and the status says how to edit it.
Read the status before writing, because the four are edited in four different ways and the wrong one
destroys the audit trail the file exists to hold.

These four are what this suite assumes where a repo answers no `memory.doc` slot. Where the slot
names a file, that file wins and this one is the fallback.

## The statuses

| Status | Means | How to edit it |
|---|---|---|
| `living` | The current truth on its topic | Edit in place. Overwrite what has stopped being true. |
| `append-only` | A dated ledger | Add an entry. Never rewrite or delete one. |
| `frozen` | A record of what we believed at a moment | Do not touch it. Write the current view elsewhere. |
| `superseded` | The content moved somewhere else, and that somewhere is authoritative | Do not touch it. Read `superseded_by` and go there. |

## Frozen and superseded are different states

`frozen` means the file records what we believed at a moment and is worth keeping as history.
`superseded` means the content moved, and the file it moved to is the correct one.

A `superseded` file carries a required `superseded_by:` naming where the content went — a document
URL, or a path inside the repo. Without that pointer the file is a dead end that still reads as
authoritative.

A superseded file stays in the repo rather than being deleted, because a reader who arrives with the
old filename has to land somewhere that points forward.

## Which files never freeze

A file no external system replaces declares `never_freeze: true` beside its `status`, and states the
reason in its opening paragraph. The flag is a stop, not a preference.

The test is whether the content has one authoritative home outside the repo. An approved topic
document in the client's tracker is such a home, and it outranks anything written here. A term list
somebody reads while writing product copy is not, because nobody maintains it there.

## What the status drives

A repo that lists its notes groups them by declared status. Two consequences:

- A file with an unknown or missing `status` renders as an orphan row rather than being dropped, so
  the gap is visible.
- A file's one-line gloss is editorial and lives wherever `memory.gloss` names. A file with no gloss
  still lists, with an empty one.
