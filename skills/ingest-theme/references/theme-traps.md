---
doc: theme-traps
house_style: true
---

# The four traps a derived theme falls into

**Scope:** the four preconditions a colour-derivation formula leaves unstated, and what to do where
a real palette breaks one. The `ingest-theme` skill is the order this work happens in; this file is
what its review step checks against. The file named by `theme.doc` overrides it wherever a repo
states its own rules.

A theme built from anchors derives most of its tokens. A **follower** is any token a formula
computes off an anchor: a status foreground off a status colour, a border weight off a line colour,
a link hover off the brand. Each formula was written against the palette it shipped with, and each
carries a precondition nobody wrote down. A palette that breaks one produces a value that compiles,
renders and is wrong.

**None of the four throws.** Each was found by looking at a page that prints every token live.
Where a repo has such a page, open it in both modes after any ingest; where it has none, read the
four values named below out of the generated file by hand.

## Trap 1 — a grayscale anchor has no hue to tint with

A near-zero-chroma anchor resolves to hue 0, which is red. A status formula that tints by hue at a
fixed chroma then paints a maroon wash onto a palette whose whole point is that it carries no hue.

**The correction:** zero the chroma rather than pinning the hue, and emit a flat neutral tint.
Check the result reads as neutral rather than as dead.

**Threshold:** chroma below 0.02 in oklch.

## Trap 2 — an opaque dark line inverts an alpha ladder

A line colour is usually laddered by alpha: a subtle weight at a low percentage, the base weight,
and a strong weight above it. Where a theme makes its dark-mode line **opaque**, the alpha ladder
runs against a solid rather than against the ground: the subtle weight goes invisible and the strong
weight comes out weaker than the base. The ramp collapses and reverses.

**The correction:** ladder the two derived weights by **lightness** instead. Look at the three
weights together afterwards, because the check is that they read as three.

## Trap 3 — a pastel status anchor takes a foreground nobody can read

A `-foreground` formula puts near-white type on a status colour, which works on a saturated one and
disappears on a pastel.

**The correction:** use the theme's own ink, written as a variable reference rather than a literal,
so it resolves on the element that wears it. Check the pair at whatever page prints resolved values. Where the repo has no such page, read the
pair out of the file, then confirm it on a screenshot of a screen that wears it.

**Threshold:** lightness above 0.85 in oklch.

## Trap 4 — an extreme brand makes a link derivation meaningless

A link hover is commonly the brand shifted by a fixed lightness step. A brand already at ink or
already at near-white has nowhere to go, so the hover renders identical to the resting state and the
affordance vanishes.

**This one is flagged and not corrected**, because the fix is a design decision. An ink link
recolours through a **mark** — an underline, a highlight behind the text — rather than through the
colour token. Decide the affordance with the designer, and leave the computed value in place so the
slot is filled while they decide.

**Threshold:** lightness at or below 0.25, or at or above 0.9, in oklch.

## What a correction owes the next reader

1. Write the reasoning beside the value, in a comment in the theme file, rather than in a prose file elsewhere.
2. Name which trap fired and what it was corrected to, so the next reader finds a decision rather than an anomaly.
3. Say in the file that the theme is hand-tuned, wherever you move a value off the generated output. A hand-tuned theme is never regenerated, because a rerun deletes every ruling and keeps the file compiling.

## The failure that hides behind all four

A follower is the repo's value and not the designer's. Where a formula gets one wrong, the screen
still renders, the checks still pass, and the only evidence is the colour itself. **Read every
corrected value before handing the theme back.** A generated theme nobody looked at is a theme whose
four hardest values were guessed.
