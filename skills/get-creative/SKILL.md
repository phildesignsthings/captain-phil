---
name: get-creative
description: >-
  Produce design directions whose constraints come from four dice — a d100 descriptor, a d20
  object, a d20 composition and a d6 rule spent — thrown by a script, shown to the designer
  before anything is built, and logged.
when_to_use: >-
  Use when the designer asks for random or off-the-wall options, or rejects a round of
  directions as safe, boring or samey; the method is opt-in every time, so offer it in one line
  and wait for an answer before rolling. Trigger phrases "give me 3 random options", "off the
  wall", "get weird", "surprise me", "roll for it", "this is a snoozefest", "show me the log".
metadata:
  suite: captain-phil
---

# Get creative

The short version: offer the method and wait for a yes; fix the subject; run `scripts/roll.mjs`;
show the designer the draws and wait; build all N; write a save per direction and run
`scripts/leak-check.mjs`; hand over the log's path; offer `audit-design`. Nothing about the method
reaches the work.

A **draw** is one throw of the four dice, read as a sentence: *a sinking punch card, inline in a
sentence, breaking the one-accent rule*. The **combat log** is the one file per subject where the
script records every draw and you record every save. `references/` holds the tables, `assets/` the
shapes of what gets written, `scripts/` the two commands.

## Requires

Check these before the offer, and say the sentence when one is missing.

| Needs | When | If missing, say |
|---|---|---|
| Node 18 or newer | every round, for the dice | "Node isn't installed, so I can't roll. Install it from nodejs.org and say roll again." |
| Paper Desktop MCP | only when the directions land on a Paper board | "Paper isn't connected. I can build the directions as HTML boards instead, or you connect Paper and say go." |
| Playwright MCP | only when a coded direction on the web needs a screenshot | "I can't capture a screenshot, so I'll hand you the link and skip the capture." |
| a booted simulator | only when a coded direction in a native app needs a screenshot | "No simulator is booted, so I'll hand you the deep link and the taps and skip the capture." |
| the `audit-design` skill | step 8 | "audit-design isn't installed, so there is no scoring step. The directions stand as built." |

## 1. Ask, and wait

**ASK BEFORE ROLLING, EVERY TIME.** Loading this skill grants no permission to run it. Offer it in
one line and stop:

> Want me to roll these off dice rather than pick them? Four dice per direction — a descriptor, an
> object, a layout and one house rule to break — and you see the throws before I build anything.

- Make the offer when the designer asks for random, weird or surprising options, or rejects a round as safe, samey or boring.
- Skip the offer when the designer named the method: `/get-creative`, "roll for it", "the dice thing".
- Withhold the offer when the work has a right answer to find, or when the build has started.
- Treat a no as final for this piece of work.

## 2. Fix the subject

1. Name the **subject** (the element under exploration), the number of directions **N** (three by default), and where the output lands.
2. Choose the log path `.context/<slug>/combat-log.md` as an **absolute path**; the script creates the folder.
3. Find the product record (`PRODUCT.md`) that governs the surface. Where one exists and no `get-creative-objects.md` sits beside it, write that file from `assets/objects.template.md`: twenty physical nouns from the product's world, one per line. Where none exists, say so in one line and use the generic table.
4. Find the design record (`DESIGN.md`) that governs the surface. Its § Named Rules feeds the rule die. Where none exists, say so in one line and use the generic table.

## 3. Roll

```bash
node <skill dir>/scripts/roll.mjs --subject "<subject>" --log /abs/path/.context/<slug>/combat-log.md \
  --n 3 --out "<where it lands>" [--objects <dir>/get-creative-objects.md] [--record <dir>/DESIGN.md]
```

- Run it once per round. It throws N draws, rethrows only an exact repeat of a kept draw or a shared object or composition within the set, appends the round to the log and prints the draws.
- Fix what a non-zero exit names and run it again. Roll nothing by hand.

## 4. Show, and wait

Post the printed draws to the designer, one line per die per direction, and stop. The designer can
build the set, kill one draw, or ask for a fresh throw. Roll again only on "again"; a killed draw is
replaced by running the script with `--n 1`.

## 5. Build

- Read each die into the subject: the descriptor is a quality the object shows, the object is what the element becomes, the composition is how the screen lays out, the rule is broken where the paragraph says.
- Build all N, and present them together in one message before discussing any one of them.
- Write each direction's card from `assets/direction.template.md`: link, numbered steps, what it is, what it needs, what it costs. Where a rule was spent, the costs line contains a sentence beginning "If the break fails," naming what returns.
- Write no die, table or throw into the deliverable or the card.

## 6. Save, and check for leaks

1. Append one block per direction under the round's `### Saves` heading in the log, from `assets/save.template.md`: which element carries the descriptor, which is the object, how the composition shows, where the rule is broken or that nothing was spent.
2. Run `node <skill dir>/scripts/leak-check.mjs <card file>...` on every card. Pass `--allow <word>` only for a word the subject owns (a tide table is a table). Rewrite until it prints `clean`.
3. Record the leak-check result on the save block's last line.

## 7. Hand over

Give the designer the log's path in one line, and read none of it aloud.

## 8. Offer the audit, and wait

Offer `audit-design` in one line on the direction the designer names, and stop. A no is final for
this piece of work. This skill scores nothing itself.
