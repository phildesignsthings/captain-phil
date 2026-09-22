---
doc: design-record-format
house_style: true
---

# The design record format

**Scope:** what a design record owes — its sections, their order, its length rule and its audience.
The `record-design` skill runs the derivation; this file is the shape the derivation writes into.
The file named by `records.designDoc` overrides it wherever a repo states its own.

## Who reads it

Whoever designs the next screen on this surface, and the developer who inherits it. Neither was in
the session. Both arrive at one section, take a value, and leave — which is why the order is fixed
and the headings are not paraphrased.

A design record is **not** a component catalogue, a token list or a changelog. The token list
belongs to the theme, the catalogue to the component registry, and a record that repeats either one
goes stale the first time the theme moves.

## The sections, in order

Optional frontmatter carrying the machine-readable tokens, then:

1. `## Overview` — what this surface is and the one sentence describing the look it landed. The
   only section true from the first screen, and the only one that never drops.
2. `## Colors` — how these screens *spend* the palette: which role carries the page, which carries
   emphasis, what a departure from the theme's default is doing.
3. `## Typography` — the ramp as used, not as offered. Which rung carries a screen, which weight
   the figures take, where the surface steps at a narrow width.
4. `## Layout` — the archetypes in play, the density, the rhythm between blocks, the measure.
5. `## Elevation & Depth` — what sits above what, and by what means: shadow, border, a well, plain
   spacing. This heading keeps its ampersand; it is canonical and renaming it breaks every tool
   that matches on it.
6. `## Shapes` — radius, stroke, the shapes that recur and the one that does not.
7. `## Components` — the composed pieces this surface invented, as against the primitives it
   inherited. One line each, pointing at the file.
8. `## Do's and Don'ts` — what a designer coming to this surface must and must not do.

**Drop a section rather than inventing rules to fill it.** An unfilled heading reads as a system
nobody has decided, which is honest; an invented one reads as a decision, which is not.

Beneath colour, type and elevation, the format provides `### Named Rules` — the home for a
**ruling**, a decision about how this surface spends the system. A ruling dies with the surface. A
**mechanism** — a trap that bites anyone anywhere — goes to the repo's lessons file at
`docs.gotchas` instead. The test is one question: would this hold on a surface that shares none of
this one's tokens?

## The rules that bind the writing

- **Read it off the shipped screens.** A record derived from a plan, a comp or an intention is a
  set of values nobody measured, and the next agent defends them against the screens.
- **A value used once is not a system.** A record listing every hex the screens contain is a
  screenshot in prose.
- **Record how the screens spend the tokens, never what the tokens are.** Retuning a value is an
  edit to the theme file, and it moves every surface pinned to that theme.
- **Point at the canonical file rather than describing it.** Per-screen prose goes stale and
  doubles the source.
- **Write a rule so it can reject a plausible design.** "Use spacing thoughtfully" rejects nothing.
- **Metaphor is legal here.** A creative north star does work an instruction cannot, and this is
  the one document in a repo where that trade is worth making.

## Length

A record is matched against rather than read through, so it takes a looser cap than a file of code
— on the order of a thousand lines where the repo sets one. The cap is a symptom check, not a
budget: past it, the record has started listing values used once. Where the repo declares its own
limit, that number wins.

## Where it lives

Beside the surface it describes, and named in `records.design` so every tool that reads records
finds it. A record filed at repo level claims to describe the repo, and a record nothing indexes is
one the next designer writes again from scratch.
