---
name: work-report
description: >-
  Format a finished piece of work into a report the designer can skim in one screen — a verdict
  heading, one section per thing touched, a pointer at the reviewable artifact, and the next
  action on the last line. Three shapes: code, Paper, and docs or memory.
when_to_use: >-
  Use when a gate is finished and verified, when a build, a board or a writing pass is being
  handed back, or when a draft report has turned into paragraphs nobody reads. Use it whenever
  finished work is being handed back, even where the designer asks for none of those words.
  Trigger phrases "work report", "clean report", "write this up", "format this for me", "make
  this skimmable", "tl;dr this", "hand this back".
metadata:
  suite: phil-d-skills
---

# Report finished work

The reader is a junior or mid designer, on a phone, reading once. The report leads with the verdict,
carries the changes in bullets, points at the thing they can open, and ends with the next action.

**This skill formats; it does not verify.** The `wrap-gate` skill runs a gate's checks and the
`verify-ui` skill proves a screen rendered. A report of unverified work is a guess with headings.

## Requirements

None. No MCP, no script. The one file to read is `assets/report.template.md`.

## 1. Pick the shape

Take the first row that matches:

| Shape | Pick when | The middle carries |
| --- | --- | --- |
| Code | A URL exists for something that changed | One section per route, with its URL |
| Paper | A board changed and no URL exists | One section per page, with its board names |
| Docs and memory | Only files changed | One section per file path |

Where two shapes apply, use the first and fold the other in as one section.

## 2. Fill the template

1. Copy `assets/report.template.md`, keep the middle block for the shape picked, and delete the other
   two blocks and the HTML comments.
2. Fill every placeholder. A placeholder with nothing to say becomes the clause "nothing rendered"
   or "no checks", never a deleted line, so an omission reads as a fact.
3. Keep `### Two things for later` only where an item changes a later step.
4. Keep the whole report under 40 lines.

## 3. Translate for the reader

- Paste check output from the `check-baseline` script as it stands. Where checks came from anywhere
  else, write each as `<Name>: clean` or `<Name>: <n> new issues`, with no command names.
- Name a screen, a board or a file the way the designer sees it. Never a node id, a route path where
  a screen name exists, or a ticket key.
- Write the line under a URL in under 15 words, starting with a verb.
- Bullet anything that comes in threes or more; bold the noun that changed, never the sentence.
- Cut the closing caveat unless acting on it changes what the designer does next.
- Leave out guard or hook findings on lines the change did not touch.
- Write a client-facing report fresh: no internal ids, and one idea stated once.

## 4. Check before handing back

Delete every line that is not a heading, a bold phrase or the **Next** line. What remains must still
say what happened and what comes next. Where it does not, the middle needs cutting, not the heading.
