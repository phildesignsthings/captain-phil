---
name: new-screen
description: >-
  Build a screen inside an existing surface — read only the lessons that apply, propose the
  layout archetype, the density and the one hero moment, wait for the designer's nod, then build
  all four data states and check the file shape.
when_to_use: >-
  Use when a screen goes into an existing surface, when a screen is being redesigned, or when a
  screen is coming out as a stack of same-sized cards. Trigger phrases "add a screen", "build
  this screen", "redesign this page", "this looks generic", "what layout does this want".
compatibility: >-
  Reads docs.gotchas, surfaces.root, surfaces.doc, surfaces.compositionDoc, surfaces.limits,
  surfaces.seam, components.dir, dev.platform, checks.typecheck and checks.lint from
  .agents/host.json. Without surfaces.compositionDoc, the archetype menu and the data-state
  rules in references/composition.md apply. With docs.gotchas null, step 1 is skipped in one
  line. With surfaces.limits null, file shape is judged by reading.
metadata:
  suite: captain-phil
  host: [docs.gotchas, surfaces.root, surfaces.doc, surfaces.compositionDoc, surfaces.limits, surfaces.seam, components.dir, dev.platform, checks.typecheck, checks.lint]
---

# Build a screen

The short version: read the lessons that match, propose archetype plus density plus hero moment, wait for the nod, build the four data states in branch order, then check the file shape.

`references/composition.md` holds the archetype menu, the hierarchy rules, the four data states and the file-shape rules. The file named by `surfaces.compositionDoc` overrides it wherever the repo states its own. This skill is the order they get applied in, and **the pause in the middle is the point of it**.

## 1. Read only the lessons that match

1. Scan the rule lines in the index at `docs.gotchas`, and read the topic file or files whose rules match what this screen touches rather than all of them. Where the slot is `null`, the repo keeps no lessons file: say so in one line and carry on.
2. Read `surfaces.doc` for which layer each file lands in, and respect the import direction it states. Where the slot is absent, follow the layout the sibling screens already use rather than inventing a second convention.
3. Where `dev.platform` is `native`, read the repo's own narrow-width rules first. A layout that holds in a browser window is not evidence about a phone.

## 2. Propose the intent, then wait

Put three values in front of the designer and stop.

> **Archetype:** split-pane (member list + profile detail) · **Density:** dense, console-like ·
> **Hero:** the profile header band with display-type name · **Reference:** a well-known issue view

1. Name one archetype from the menu in `references/composition.md` § Choose the skeleton first. Two screens in one surface can take different archetypes, and that is usually a feature. Where `dev.platform` is `native`, also name where the screen lives. The choices are a tab stack, a sheet or a pushed screen, from § On a phone, the navigation is part of the skeleton.
2. Name the density once, for the whole screen. The unchosen middle — medium padding on everything — is where the generic look lives.
3. Name the single element that carries the screen, and keep everything else quiet.
4. Wait for the nod. The proposal is cheap to write and cheap to veto, which is what makes the compositional decision happen at all.

**A dashboard, or a grid of identical cards, needs an argument.** Both are the last layout to reach for rather than the first. Hierarchy comes from the heading ramp and whitespace, so a section is a heading with breathing room rather than a boxed card.

## 3. Build the four data states

Every screen that reads data has four states, and three of them get designed badly unless they get designed on purpose.

1. Branch on the data hook's named fields in this order: pending, error, empty, content.
2. Keep the states in their own file beside the page. Inline, they are the first thing that rots when the content layout changes.
3. Build the skeleton to reproduce the layout's own rhythm — the row heights, the divider cadence, the mass of a full-bleed band. A grey block answers none of the question a skeleton exists for.
4. Write empty and error as one quiet line each, until the screen earns more.
5. Leave forcing a state to the demo harness at `surfaces.seam`. A screen describes its states and never drives them. Where the slot is `null`, data is fetched at the call site: keep the four branches anyway, and say that forcing a state means editing the fixture.

## 4. Stay on the repo's own vocabulary

- Compose primitives from `components.dir` inside your own skeleton, rather than copying the page scaffolding out of a component library's example. Copying the example's *page* is how the card stack sneaks in.
- Reach for the repo's named type ramp instead of a utility framework's numeric sizes, where it has one. A named ramp can step itself at a narrow width; a numeric ladder does not, and mixing them makes a screen two overlapping scales.
- Add a missing token by whatever move the repo's theme rules state, and both halves of it. A token registered in one place and absent from the other resolves to a neutral with nothing to warn you.
- Run `add-primitive` for a missing component rather than hand-rolling one.
- Leave the look to the theme. Composition is arrangement rather than decoration.

## 5. Check the shape before handing back

1. Run `checks.typecheck` and `checks.lint`, and compare each against its recorded baseline.
2. Run `surfaces.limits`. The component-body limit is the one doing the work, because a file well under the file limit can still be one component doing everything. Where the slot is `null`, judge by reading: one component carrying most of its file is the signal.
3. Split along the layer the file sits in, and cut at a seam that has a name. Two or three props means you found one; eleven means you cut through the middle of something.
4. Verify the screen with the `verify-ui` skill, including the loading, empty and error states.

## Before handing back

Report the archetype built, the four states, and anything the designer nodded at that the code did differently. Keep the surface's readme honest as screens land.
