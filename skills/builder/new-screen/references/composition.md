---
doc: composition
house_style: true
---

# Composition — escaping the card stack

A component library's docs teach component *mechanics* through page-shaped examples, so an agent following them faithfully converges every screen onto the same skeleton: a card, a card header, a card title, stacked with a uniform gap. The primitives are fine — the **assembly** is the samey part. This file is the counterweight.

It works inside whatever constraints the repo sets: tokens only, the installed primitives, and the look belonging to the theme. Composition is *arrangement*, not decoration.

The `new-screen` skill is the procedure that applies this file: it reads the matching lessons, proposes the archetype and waits for the nod, then builds the four data states in branch order. Read the skill when you build; read this for the menu each of its steps chooses from. The file named by `surfaces.compositionDoc` overrides it wherever a repo states its own.

## Choose the skeleton first

Every screen gets a deliberate layout archetype, named in the design intent **before any code**. Never default silently. The menu, roughly:

- **Feed or stream** — one column of heterogeneous items, strong vertical rhythm
- **Split-pane** — persistent list or nav plus detail
- **Editorial** — display type, generous whitespace, full-bleed moments, magazine flow
- **Console or data table** — dense, tabular, scan-optimised, minimal chrome. The recurring one: admin screens are a standing shape, and a real table library beats a hand-rolled table element
- **Wizard or stepper** — one decision per screen, a big obvious next action
- **Dashboard** — mixed-size modules on a grid. Earn it; this one degrades into card soup fastest
- **Form page** — single column, grouped fields, a clear commit action
- **Canvas or board** — spatial arrangement is the content
- **Conversation** — message stream plus composer

Two screens in the same surface can use different archetypes. That is usually a feature.

## On a phone, the navigation is part of the skeleton

A native screen sits inside a navigator, and the navigator decides as much of the layout as the archetype does. Name both in the design intent, the archetype for the content and one of these for where the screen lives.

- **Tab stack.** A bottom tab bar of three to five top-level sections, each tab holding its own stack of pushed screens. The tab bar stays put while a tab's stack pushes and pops, so a screen inside a tab owns only the area above the bar. A section that needs no tab of its own is a pushed screen, never a sixth tab.
- **Sheet.** A panel rises over the current screen for one task, then returns to it. Filters, pickers, confirmations and short forms fit a sheet. The screen underneath stays visible at the top edge, which tells the user where closing goes. A task with its own navigation, or one longer than a scroll, is a pushed screen rather than a sheet.
- **Pushed screen.** A full screen on the current stack, with a back control where the stack has one. On a phone, a split-pane becomes a list that pushes its detail.

Keep the one primary action within thumb reach, at the bottom of the screen above any tab bar, rather than in a header corner. Respect the device's safe areas at both edges; a layout that runs under the home indicator or the status bar renders plausibly and cannot be tapped.

## Hierarchy comes from type and space, not boxes

- The heading ramp plus whitespace is the primary hierarchy tool. A **section is a heading and breathing room, not a card**.
- A card is for a **discrete, repeatable object** — something you could imagine dragging. Before wrapping anything else in one, ask whether a heading and spacing would do. Where they would, don't box it.
- Nesting boxes to show grouping is the smell. Prefer indentation, a subtle divider, or a single muted well.

## The ramp can step itself

- **Where the repo's type ramp is responsive, never write a breakpoint for type size.** A named ramp that steps at a narrow width and a utility framework's numeric sizes that do not are two overlapping scales, one of which changes and one of which does not. Stay on the named ramp.
- **Nothing at or below body size moves.** A 13px label that shrinks on a phone is a legibility bug, not a responsive scale.
- **Spacing roles that step are the exception, not the rule.** A repo usually steps two or three named roles — the page inset, the gap between blocks, the gap between sections — and leaves the numeric ladder alone, because that ladder sizes controls and touch targets as well as gaps. Reach for a stepping role only where the measurement genuinely has to change at a narrow width.
- **A surface that renders at the real window width gets all of that for free**, and what it still owes is its **layout**: the column count, what collapses, what moves, in ordinary breakpoints.

## Vary the spatial skeleton

- Asymmetry is allowed and usually better: a two-thirds and one-third split, an off-centre hero, a sidebar of metadata. Equal-width column grids read as template output.
- **Density is a choice, made once per screen**: airy and editorial, or dense and console-like. The unchosen middle is where the generic look lives.
- A grid of identical cards is the *last* layout to reach for. Lists have more shapes than cards: table rows, stacked rows with dividers, label and value pairs, plain type.

## One hero moment per screen

Pick the single element that carries the screen — a display-type headline, a full-bleed band, a big number, the one primary action — and give it real emphasis. Everything else stays quiet. Dominant-plus-accent beats evenly distributed emphasis: where everything is prominent, nothing is. This is also where motion belongs, never sprinkled.

## Data states

Every screen that reads data has **four** states, not one: loading, empty, error, content. Three of them get designed by default — badly — unless you decide them on purpose.

- **Branch on the hook's named fields**, in that order: pending, error, empty, content. A hook that hands back three-valued data pushes optional chaining into every screen that reads it.
- **The screen describes the states; it never drives them.** Forcing loading, error or empty is the demo harness's job, one layer down at the fetch seam. Every hand-rolled version of this put the switcher in the screen, and the switcher and the screen drifted apart within weeks.
- **A skeleton reproduces the layout's actual rhythm** — the row heights, the divider cadence, the mass of the full-bleed band. A generic grey block tells a designer nothing about whether the layout holds while it loads, which is the only question a skeleton exists to answer.
- **Empty and error are usually one quiet line each.** Say what will land here and why it is empty; say what failed and offer the retry where there is one. A full-page illustration for "no activity yet" is a bigger design decision than the state deserves.
- **Keep them in their own file beside the page.** Inline, they are the first thing that rots when the content layout changes.
- **An empty region is not an empty screen.** A schedule with no rows still has seven day heads and three filters, so its empty state is designed inside the grid rather than instead of the page.

## File shape

A size check sends you here. What to *do* about one is a composition question.

**Split along the layer the file is in.** The split is structural, never cosmetic:

- a **page** splits into the blocks it composes;
- a **block** splits into smaller pieces of the same slice;
- a **data slice** splits into its model — schema, fixtures, the hook — and its presentation;
- a component's long markup splits into named components **in the layer below**, never into three more components in the same file.

**The body limit is the one doing the work.** A file can sit well under the file limit and still be a single component doing everything — that is the file a developer chokes on, and a line count cannot see it. Where one component is most of its file, that is the signal, whatever the total says.

**Extract at the second instance, not the third.** Six hand-rolled back buttons in one surface is the case this rule exists for, and none of them tripped a limit. Before writing any component, search the repo's primitives and the surface's own layers for one that already does the job. On writing a second copy of something, stop and extract it into the layer below both call sites. Waiting for a third means three copies drift before anyone reconciles them.

**Cut at a seam that has a name.** "The first 80 lines" is not a seam. Where the piece you extract needs two or three props to exist, you found one; where it needs eleven, you cut through the middle of something and the props are the evidence.

Splitting is cheap, and the limits sit where they do so it stays cheap. Suppressing a check is not the fallback: an exemption needs a written reason someone can read later. A raised limit is not a removed one — it fires again at its own number.

## Comments earn their place

Reasoning recorded at the point of the decision is the handoff artefact a developer reads instead of taking a tour. The rule is not "fewer comments". It is that a comment carries what the code cannot.

**Earns its place:** the **mechanism**, where the code cannot show it; the **constraint** that makes this the right shape rather than the obvious one; the **trap** the next reader falls into otherwise.

**Cut:** how it was found, what was tried first, how long it took; a restatement of the line it sits above; first person and the incident-report voice. Length is not rigour — a fix comment is one to three lines, a new file's header at most eight.

```ts
// NO — the hunt
/* The spec has to be a module constant. A test that built one inline killed the
   worker after 62 seconds rather than throwing "Maximum update depth exceeded",
   because the loop is effect-cleanup driven and React's guard never fires.
   Cleanup withdraws, the effect re-adds, two state writes land... */

// YES — the mechanism
/* Deps stay primitive: an object dep re-registers every render and loops.
   `latest` lets the panel read current labels without widening them. */
```

**Nothing enforces this, deliberately.** No pattern separates a mechanism from a war story, and a half-working check would license everything it failed to catch. This one is read and applied rather than linted, which is exactly why it is written down rather than assumed.

## Same primitives, different assembly

Reuse the repo's primitives for what they are — buttons, inputs, tables, dialogs — but compose them inside **your** skeleton. Copying a library example's *page scaffolding*, rather than its component, is how the card stack sneaks in. A component catalogue shows what each primitive is; this file decides how they sit on the page.

## Design intent — the contract

No screen gets built until the designer has nodded at three values: the **archetype**, the **density**, and the one **hero moment**. Each has its menu or its rule above.

Cheap to write, cheap to veto — and it forces the compositional decision the card stack was silently skipping.
