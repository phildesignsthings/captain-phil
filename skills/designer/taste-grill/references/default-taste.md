---
house_style: true
read_when:
  - "A session opens in captain-phil-mode, and the taste has to be loaded"
  - "Work designs, reviews or critiques a product, a screen, a flow, a component, a board or UI copy"
  - "Somebody asks what the default would do about a design call"
---

# The default taste

The suite's default product and UI design taste. Use it to make the call the default makes, and to check work before anyone sees it. The motion rules are in `references/default-motion.md`.

Every rule is one bullet, and ends in one of two tags.

**The bar** is a correctness rule, tagged `[bar]`. Work that breaks it is wrong, whatever the taste, and neither a designer's overrides nor a product's design file changes it.

**A style rule**, tagged `[style]`, is a taste call. The designer's taste overrides file changes it, in the format `references/overrides-format.md` sets out.

**A product's own design file** (a design record, a design system) sets the values a rule uses, such as a spacing, a colour or a timing. It never changes a rule, of either tag.

## The one rule: clarity

- **A product says what the user can do, and lets the user say what they want back.** Clarity runs both ways: the available actions are obvious, and the user states their intent without translating it into the product's terms. [bar]
- **Run the black-and-white test on every screen.** The design still works with everything in black and white and only system colours. If it doesn't, the design is wrong. [bar]
- **WCAG AA is the floor.** Colour never carries a signal alone: the signal also says what it means in words or in shape. [bar]

## Where a design starts

- **Start from the user's moment and the constraints, not a concept.** Who is using it, where they are, what they are trying to get done, what the system can do, the real data and the edge cases. [style]
- **Data-forward.** Map the real data shapes and every state (empty, loading, error, full, overflow, very long text) before the layout. It keeps the work feasible and catches edge cases early. [bar]
- **Every hover has a tap equivalent.** Anything that relies on hover, such as a tooltip on a pin, also works by tap, so a touch screen never inherits a hover-only design. [bar]
- **Check with the longest real content**, such as the longest name or the biggest scope, not the happy-path fixture, before ruling a sentence or a headline the screen's hero. [bar]
- **Anything that plots data on a scale gets a crowded stress case** beside the happy path: a timeline, a chart or a track of events, at the same width with many items packed close, plus the overflow rule (stack, nudge or zoom). [bar]

## Data on screen

- **Counts add up.** A stat's breakdown adds up to its headline. A headline that counts people or things counts each one once, with the per-instance detail in the list beside it. Two stats, or a stat and a banner, never count the same items. [bar]
- **One word, one count.** A summary above a list uses the exact words the rows use, so one word never names two numbers. [bar]
- **Every summary stat changes what the user does in the next five minutes.** Proof-of-value numbers go in reports. Freshness goes in a header status line that turns into a banner when stale. [style]
- **A list grouped by status never repeats the group's status on every row.** Each row keeps only what is new about it, such as an owner or a time, and a status word appears only on the row that differs from the rest of its list. Sort by severity inside each open group. [style]
- **A node graph only where the data branches.** A linear flow reads as well in columns, and wires add nothing to it. [style]

## Convention, then break it

- **Lay the product out with conventions first.** Then go through it looking for the places where breaking a convention helps the user. [style]
- **Borrow across verticals.** Look at how other kinds of product handle a similar feature, because a pattern from a different type of product sometimes fits exactly. [style]
- **Delight makes the task easier.** A product that is fun while it is useful is winning. [style]
- **Never play it safe to the point of sterility.** A product with no risk anywhere is a failure too. [style]

## Delight: hero moments, not everywhere

- **Pick a few hero moments and land them.** Delight on every screen wears thin and stops reading as delight. [style]
- **No delight where the stakes or the stress are high:** errors, payments, deleting, anything irreversible. None on tasks repeated many times a day, and none where it isn't worth the effort, such as settings. [style]
- **Motion informs or delights.** Never motion for its own sake. This file decides where delight goes, and `references/default-motion.md` decides how it moves. [style]

## Density: the onion

A product is an onion the user peels back to reach more complexity.

- **The default layer** shows what this moment needs, with the rest one tap away. Most people stay here. [style]
- **The second layer** is focused, one-decision views for when the user goes in to act. [style]
- **The third layer** is the dense expert view: everything visible, held together by strong hierarchy. [style]
- **A user can sometimes pick a layer as their default,** and a systems-heavy utility can open on a denser layer. [style]

## Design systems

- **Work inside the design system.** Spacing, margins and gaps are consistent, and grouping follows a decided logic, never case by case. [style]
- **The system changes when the change improves the product, and the change works everywhere the component exists.** [style]
- **No one-off variants and no detached components.** Creativity happens inside the system. [style]
- **A status indicator lines up with the first line of the text it belongs to.** A dot beside a two-line label sits level with line one, not centred on the block. [style]
- **One shape, one meaning, across the product.** Once a shape means a status, every banner, problem line and nav item gets an icon that names its own problem rather than reusing that shape. [style]
- **The action colour marks only what the user can act on:** buttons, links, focus and the active nav. Never charts or decoration, and not clickable words inside running text at rest. [style]
- **The destructive style is only for what can't be undone.** A good outcome, such as Done, Resolve or Complete, takes the primary or secondary style. [style]

## Copy

- **Clear, in the fewest words that make the point, and still with a voice.** [style]
- **Plain and specific, in the user's words.** Buttons start with a verb. An error says what broke and what to do next. [style]
- **Voice shows in small doses,** in empty states and hero moments, the same rule as delight. [style]
- **Copy helps the user act or tells them something new. It never explains the product's rules.** Rule footnotes, group descriptions that define the category, stat subtitles that restate the number and event lines that explain how the system works are design notes leaking into the UI. [style]
- **Name a kind by grouping, a header or an icon, never by an inline prefix** such as "Type: Managed" in a chip, a picker, a sentence or a graph node. [style]
- **A placeholder name never belongs to a real person,** least of all one the team works with. That holds in mock data, specs, boards, copy, tests and examples. [bar]

## Process

- **Explore at middle fidelity, wide in idea, and bump the winner to hi-fi quickly.** Hi-fi is cheap, so there is no lo-fi stage. [style]
- **The loop:** three options, a review, then refine or combine the best parts. Three more built on the best, and repeat until it holds up. Then take the most polished direction into a prototype or the build. [style]
- **The three options differ in premise,** never one idea reskinned. [style]
- **A prototype gets a per-screen state switch** before its big screen groups are built: a small review control that flips the screen in view between live, loading, error, empty and offline, with loading drawn as skeletons in the screen's real layout. [style]

## Working with product and engineering

- **Everyone keeps the shared context relevant and current,** so the moving parts stay in sync. [style]
- **Lean on each person's expertise in their lane, and step into another lane at times.** Everyone is part of each team, with varied specialties. [style]
- **When an engineer says a thing is far too much effort, listen.** [style]

## Critique

- **First ask whoever made it what they were going for,** then be direct and specific, with the why. [style]
- **Clear, actionable async feedback beats live feedback.** A live gut check can help but is often wrong, so weigh it rather than obey it. [style]
- **Critique works the same way for art, design and product.** [style]

## Things that make the default twitch

- **Anything nobody can explain.** If nobody can say what a button does, it doesn't exist. No fake features, unless what sits behind the click or tap is mocked up too. [bar]
- **Inconsistent spacing and alignment** that is only close enough. [style]
- **Tight gaps between buttons.** Buttons side by side or stacked get at least 12 px between them, because 8 px reads cramped. A card and the action under it get 24 px. [style]
- **An empty state that only says "No data".** [style]
- **An icon-only button with no label.** [style]
- **A modal on a modal,** and "Are you sure?" on things that aren't scary. [style]
- **Fake urgency and dark patterns.** [bar]
- **Blended UI styles that don't go together.** [style]
- **Overused gradients.** [style]
- **A coloured stroke down the left side of a card or callout.** It reads as machine-made. Show emphasis with surface, type size, an icon or a tinted band instead. [style]
- **A shadow on a shadow.** Nothing shadowed sits inside something shadowed, glass included. Actions go outside the card, or lose their shadow inside it. [style]
- **Mixed elevation in one group.** Buttons side by side float together. Where the secondary buttons are glass with a shadow, the primary beside them gets the same depth cues: a soft sheen down the face, a bright top edge and a darker bottom edge. [style]
- **Motion for motion's sake.** [style]
- **Sterile, risk-free design.** [style]

## What good looks like

These have one thing in common: each commits fully to a point of view, stays a focused tool, prefers curation over volume, and uses design to teach.

- **Not Boring apps:** they went all in on delight and stuck with it, and they stay focused tools instead of turning into a mega product. [style]
- **Apple Music:** tight curation, high-quality radio, lossless audio, and it's pretty. [style]
- **A5 Leuchtturm1917 notebooks:** thoughtful products. [style]
- **Old-school instruction manuals and communication graphic design.** The game *TUNIC* teaches its player through pages of its manual collected along the way. [style]
- **Old electronics, with knobs, switches and dials.** Going all in on skeuomorphism sometimes works, given a clear idea of what can and can't be analog in a digital space. [style]

## Before showing anyone anything

- **Every element on the screen has an explanation.** [bar]
- **It passes the black-and-white test.** [bar]
- **The states are mapped with real data,** including empty, error and overflow, the longest real content and a crowded case. [bar]
- **The counts add up,** and every hover has a tap equivalent. [bar]
- **The spacing is on the system,** with nothing close enough. [style]
- **Delight sits only in the hero moments.** [style]
- **The work takes one risk somewhere.** [style]
- **It passes the unslop design check below.** [style]

## Unslop design check

Run this on every screen and board before anyone sees it. It catches the tells that make work read as machine-made. A few items are for marketing sites, and most apply to product UI too.

- **Delete filler badges.** No "New", "Beta" or eyebrow pills that say nothing. A tag stays only where it changes what the reader does, such as *Proposed* on a board. [style]
- **Drop redundant labels.** Where the content already says it, cut the label, such as a heading reading FAQ over the FAQs. [style]
- **No random italic word** in a headline, and no serif italic accent word for flavour. [style]
- **Monospace only where it earns it:** code, IDs and aligned figures, never decoration. [style]
- **Use the design system's tokens, type rungs and spacing,** with no one-offs. [style]
- **Show the actual product,** with real screens and real data shapes, never abstract blobs or spheres. [style]
- **Make the main thing big.** The feature or fact that matters gets the size. [style]
- **Group with spacing** before reaching for boxes, borders or dividers. [style]
- **Be specific.** A headline or title says the concrete thing, such as "Couldn't reach 3 customers" rather than "Communication issue". [style]
- **Emphasise the call to action.** One primary action per view, clearly stronger than the rest, and equal-weight buttons only when the choices really are equal. [style]
- **One accent colour,** used on purpose for actions and links. [style]
- **Consistent icons:** one set, one stroke weight, one size per role. [style]
- **Remove embellishments that do no work:** decorative gradients, glows, ornaments and the coloured left stroke on cards. [style]
- **Concentric radii.** An inner radius is the outer radius minus the padding, so nested corners look parallel. [style]
- **Text contrast meets AA,** muted text included, on glass and tints too. [bar]
- **Wrap headlines on purpose.** No one-word orphan lines, and a balanced break. [style]
- **Align by eye, not only by the numbers.** Icons, glyph overhangs and round shapes get optical nudges. [style]
- **Tabular numbers** wherever figures change or line up: times, counts and money. [style]
- **Every fetch has a loading state,** drawn rather than mentioned. [bar]
- **Animate useful feedback.** The action confirms itself in place, such as Add to cart becoming Added, and nothing animates only to decorate. [style]
