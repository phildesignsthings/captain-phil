---
house_style: true
read_when:
  - "A doc, a skill or a project note is being written and the writing rules are needed"
  - "The same fact has turned up in two files"
  - "Something has to be filed as a procedure, a catalogue or a retirement record"
---

# House style

The written standard the suite's prose is held to. `write-doc` runs it; the guard named in
`checks.guard` checks the mechanical half of it, through the copy of `scripts/house-style.mjs` that
installs beside this file.

## Three kinds of content, three homes

| Content | Test | Home |
|---|---|---|
| **Procedure** | Ordered, triggered, has a done state | A skill |
| **Catalogue** | Scan-and-match: tables, token lists, symptom indexes, templates | A doc |
| **Retirement record** | Explains why something is gone, and carries no action | A retirement record |

Apply the test in that order, and stop at the first match.

- A procedure has a trigger, so it belongs in a skill. A doc runs only when somebody opens it, and
  nobody opens a doc at the moment a procedure starts.
- A catalogue has no trigger and no done state. A reader arrives with a symptom or a name and
  matches against a list. Keep it in a doc, because a skill a reader has to scan is a doc.
- A retirement record earns its keep by stopping somebody re-adding a deleted thing. It earns no
  place on a reading path, because it names no action.

**Splitting one topic across a doc and a skill is the point, rather than a compromise.** The doc
keeps the tables a reader matches against; the skill runs the steps and cites the doc.

## One fact, one home

**A fact lives in exactly one file.** A skill cites a doc's table. A skill never restates one.

The duplication this rule exists to stop has a shape: a skill opens by naming a doc as its source of
truth, then repeats the doc point for point, so the two drift and the reader cannot tell which one
lost. Cite instead — name the file and the section, and say what the reader gets there.

Three consequences worth stating outright:

- A rule two docs both want belongs in the one whose trigger fires first, and the other doc cites
  it.
- A skill that cannot be written without repeating half a doc means the doc is holding a procedure.
  Move the procedure.
- A number, a path or a threshold is a fact. Read it from the file that owns it rather than copying
  the value into prose that ages separately.

## The rules

Every page in Google's [General principles](https://developers.google.com/style) section is house
style for the suite's docs and for every skill. Frontmatter is exempt. The table below is the
digest, with the calls that resolve each collision with this corpus's voice.

| Rule | Note |
|---|---|
| Fewer than 26 words per sentence | Advisory, and counted rather than reported. |
| Break up walls of text with paragraphs, headings and lists | The largest change for most corpora. |
| One instruction per list item in a procedure | Binds every skill. |
| Parallel structure: every list item opens the same way | Binds every list. |
| The distinguishing fact opens the paragraph | Binds every paragraph. |
| Define an acronym on first use | Link to the glossary rather than re-defining. |
| No double negatives | "You can continue without a path", rather than "a missing path won't prevent you from continuing". |
| No exceptions for exceptions | |
| Say `must`, `We recommend`, `can`, `might` — avoid `should` | Google's prescriptive-documentation rule, and the one that bites a mixed corpus hardest. |
| No figurative language or metaphor | **Carve-out:** a design record is exempt, because a creative north star does different work than an instruction. Repo names that have become terms stay. |
| No anchoring words: `currently`, `now`, `new`, `existing`, `old`, `latest`, `eventually`, `soon` | **Carve-out:** dated language stays legal in an append-only note, in a retirement record, and in a design record. |
| No excessive claims: `simply`, `easy`, `just`, `it's that simple` | |
| No `please`, no exclamation marks, no pop-culture references | |
| Meaningful link text, never "click here" | |
| No directional language: `above`, `below`, `right-hand side` | **Carve-out:** legitimate for a rendered layout or a numeric threshold, as in "below 40rem". The rule concerns orienting a reader in a file. |
| Don't skip heading levels, and write no empty headings | |
| No `&` in place of *and* in a heading | **Carve-out:** `## Elevation & Depth` is canonical in a design record, and Impeccable's spec forbids renaming it. |
| All caps marks a prohibition or a trap that already cost time; bold carries every other emphasis | Narrowed from Google's flat ban. |

**A file opts its prose in with `house_style: true` in its frontmatter.** Every skill body is in
scope by existing. A file landing without the flag is exempt from the prose rules and counted in the
guard's summary line, so the gap is visible rather than silent — write to the style and set the flag
in the same commit.

## What the mechanical half checks

`scripts/house-style.mjs` installs beside this file and runs standalone:

```bash
node <skill dir>/scripts/house-style.mjs <file>...
```

Six rules are mechanical: empty headings, skipped heading levels, an ampersand standing in for
*and* in a heading, link text naming nothing, `should`, and the anchoring words a regex can tell
apart from their ordinary sense. Three anchoring words are deliberately left out — `new`, `existing`
and `old` — because no regex separates the dating sense from the ordinary one, and a check that is
wrong most of the time is one everybody learns to scroll past. Those three stay a reading rule.

Everything else in the table is read by a person.

## Retirement records

A retirement record holds prose that must survive a deletion without sitting on a reading path.
Retire content in these cases:

- A rule, an axis or a component is gone, and the reasoning stops somebody re-adding it.
- A worked case sits behind a rule that states itself in one line. Keep the rule in the live doc,
  and move the walkthrough.
- A dead name needs to stay greppable, so somebody searching for it lands on what replaced it.

Retire nothing that carries an action. A step a reader has to take belongs in a skill, and a list a
reader has to match against belongs in a doc.
