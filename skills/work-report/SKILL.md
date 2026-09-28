---
name: work-report
description: >-
  Format a finished piece of work into a report the designer can skim in one screen — a verdict
  heading, one section per thing touched, a pointer at the reviewable artifact, and the next
  action on the last line. Four shapes: spike, code, Paper, and docs or memory.
when_to_use: >-
  Use when a gate is finished and verified, when a build, a board or a writing pass is being
  handed back, or when a draft report has turned into paragraphs nobody reads. Use it whenever
  finished work is being handed back, even where the designer asks for none of those words.
  Trigger phrases "work report", "clean report", "write this up", "format this for me", "make
  this skimmable", "tl;dr this", "hand this back".
metadata:
  suite: captain-phil
---

# Report finished work

The reader is a designer, on a phone, reading once. The report leads with the verdict,
carries the changes in bullets, points at the thing they can open, and ends with the next action.

**This skill formats; it does not verify.** The `wrap-gate` skill runs a gate's checks, the
`verify-ui` skill proves a screen rendered, and the `run-spike` skill collects a spike's evidence.
A report of unverified work is a guess with headings.

## Requirements

None. No MCP, no script. The one file to read is `assets/report.template.md`.

## 1. Pick the shape

Take the first row that matches:

| Shape | Pick when | The middle carries |
| --- | --- | --- |
| Spike | The work answered questions by measuring, and a results file holds the table | How it was tested, then one item per question id |
| Code | A URL or a deep link exists for something that changed | One section per route, with its URL, or with its deep link, taps and screenshot |
| Paper | A board changed and no URL exists | One section per page, with its board names |
| Docs and memory | Only files changed | One section per file path |

Where two shapes apply, use the first and fold the other in as one section.

A native app has no URL, so a code-shape section there carries three things in the URL's place:
the deep link as the command that opens it, the taps from where it lands, and the screenshot path
`verify-ui` recorded. Embed the screenshot as an image where the reader's client renders one.

## 2. Fill the template

1. Copy `assets/report.template.md`, keep the middle block for the shape picked, and delete the other
   three blocks and the HTML comments.
2. Fill every placeholder. A placeholder with nothing to say becomes the clause "nothing rendered"
   or "no checks", never a deleted line, so an omission reads as a fact.
3. Keep `### Two things for later` only where an item changes a later step.
4. Keep the whole report under 40 lines. A spike report gets one extra line per question.

### The spike shape

1. Write `How I tested` before any result: what was built, what stood in for the network, what
   recorded the evidence, and how many runs there were.
2. Open each item with its question id and the answer in a few words, both in bold, as
   `**Q3 · the prompt file works as well as the skill.**` The check in § 4 keeps only bold, so the
   bold part alone has to carry the answer.
3. Follow the bold with the action, then what happened, then the number.
4. Carry the same id on every line about one question, so the numbering never drifts from the
   questions.
5. End each item with the case it came from, as (`q3-prompt-file`), so the reader can open the
   output behind the claim.
6. Give every not-measured question its own item, saying why it went unmeasured.
7. Put findings that conflict with the spec or plan in their own section, after the answers.
8. List the results file, the fixtures, and what is left running, which is usually nothing.
9. End on the one decision the spike raised, with a recommendation, as the **Next** line.

## 3. Translate for the reader

- Paste check output from the `check-baseline` script as it stands. Where checks came from anywhere
  else, write each as `<Name>: clean` or `<Name>: <n> new issues`, with no command names.
- Name a screen, a board or a file the way the designer sees it. Never a node id, a route path where
  a screen name exists, or a ticket key.
- Write the line under a URL or a deep link in under 15 words, starting with a verb.
- Bullet anything that comes in threes or more; bold the noun that changed, never the sentence.
- Cut the closing caveat unless acting on it changes what the designer does next.
- Leave out guard or hook findings on lines the change did not touch.
- Write a stakeholder-facing report fresh: no internal ids, and one idea stated once.

## 4. Check before handing back

Delete every line that is not a heading, a bold phrase or the **Next** line. What remains must still
say what happened and what comes next. Where it does not, the middle needs cutting, not the heading.
