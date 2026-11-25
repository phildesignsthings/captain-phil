---
doc: measuring
house_style: true
---

# Measuring the rendered page

**Scope:** measuring a running app, and when not to believe the measurement. The `verify-ui` skill is the order this work happens in; this file is what each of its steps chooses from. The file named by `verify.doc` overrides it wherever a repo states its own, because that file carries the traps that repo has already paid for.

Nearly every entry here is the same failure wearing a different hat: a probe that returned a **plausible constant instead of a measurement**, and so could not fail. That is worse than a broken probe, because it reads as evidence. **Control the probe before you trust the sweep** — feed it one value whose answer you already know, and where that does not come back right, discard the run however confident it looks.

## Two tiers

**A browser tool for looking, a probe for asserting.** The tool named by `verify.mcp` answers "does this route render, did the dialog open, is this clipped". Where `dev.platform` is `native`, the simulator's screenshot answers those questions, and no probe runs, because there is no DOM to measure. Use a probe from `verify.probes` when a number will be **asserted** — a pull-request body, a gate write-up, anywhere someone acts on it unchecked.

Neither tier needs a browser installed up front in most setups: a driving tool downloads its own on first use. Where a probe cannot find one, the fix is the driver's own install command, and a probe worth keeping says so in its error.

Four questions come up often enough that a repo keeping probes usually keeps one for each.

| question | its own control |
|---|---|
| Does every advertised route render? | an unmatched path must read as blank |
| Does the app stay silent while a route is **driven** with real input? | two provocations in two windows land one in each |
| Does every text element clear the contrast bar against its **composited** background? | a tint of the text colour over white must composite, not read `1.00` |
| Does a resize across a layout boundary change the frame **without remounting** the content? | the fixture must be genuinely taller than its scroller, or a dead gesture shim reads as `scrollTop 0 → 0` |

**Exit codes:** `0` clean · `1` findings · `2` harness error · `3` probe unreliable. The last is distinct from `1` because conflating "the harness is lying" with "the app has a bug" gets an unreliable run triaged as real. Every probe must exit `3` under its control flag and must not in a normal run: a control you have never seen fail is returning a plausible constant. **On a `3` the number does not exist** — fix the control and re-run.

## Measuring the rendered DOM

- **Poll for the state you are asserting on; never sleep and read.** A select read 300ms after Escape gave width 0 while still listing the *previous* trigger's options — a closing overlay is still in the DOM. Assert on something identity-revealing.
- **Trusted input only.** A scripted `element.click()` is not a click on an overlay primitive; a scroll lock or focus trap cannot be tested from page JS at all — `overflow: hidden` still allows *programmatic* scrolling, `el.focus()` skips the tab order, and `offsetParent` is `null` under `position: fixed`. Control the push on the *ungated* route.
- **Trusted-input coordinates are viewport coordinates — scroll the control into view first.** The debugger protocol's mouse dispatch takes viewport x/y, while `getBoundingClientRect()` on a below-the-fold element returns a y past `innerHeight`. The click is still dispatched — onto whatever is at those coordinates, or onto nothing — so driving a control below the fold does nothing, raises no error, and yields a wrong artifact. Call `scrollIntoView({block: "center"})`, **re-read the box**, then click, and assert the state changed rather than trusting the dispatch.
- **Match structurally, never by text.** The same label is often exposed twice on one page, at opposite ends of it, so a label query is ambiguous page-wide. A strict driver turns that into a loud error; `.first()` or a raw `querySelector` silently drives the wrong control, and a screenshot of the end you meant to touch looks unchanged. Scope to the container first, and where a list's labels are content rather than chrome, match the role and index it.
- **Measure a rendered colour; never parse the computed string.** A browser serialises in the authored space, so digit-parsing an `oklch(...)` string scores white-on-magenta as `1:1`. Fill a 1×1 canvas, read the pixel back, and composite down to the first **opaque** layer.
- **Geometry measures the box, not the descendants.** A leaf-*element* scan cannot see a bare text node, so it reports the first child's edge. Read `rect.left + borderLeft + paddingLeft`.
- **`rect.right > innerWidth` is not an overflow test** — it flags an intended carousel. Ask whether the nearest `overflow-x !== visible` ancestor can be *scrolled* (`auto`/`scroll`) or not (`hidden`/`clip`), and skip screen-reader-only nodes and any third-party overlay mounted at the body root.
- **A sub-second animation cannot be observed by polling** — an `evaluate()` round trip outlasts the spring, so a working shared-element morph reads as an instant snap. Install an in-page `rAF` sampler *before* the trigger and assert the **projection transform**, not the box: a morph translates back to `0` where a remount is `transform: none`.
- **A route that forces its own theme cannot be used to read a seeded one.** Where a layout sets the theme on entry, every rendered screen wears the forced value whatever storage says, and across a sweep every row agrees — which reads as consistency rather than as a bug. Measure a forced theme by loading the route that forces it; measure any other by loading an unmatched path, or by writing the theme attribute yourself after load, because a provider's effect runs only when its own state changes and the override sticks.
- **An automation layer that reloads the page between tool calls turns a persisted choice into an apparent failure.** Page uptime resetting after every call is the shared-browser layer, not the app. Do the interaction and the assertion inside **one evaluate, one page lifetime**, never two round trips.

## When a number looks too clean

Each of these looks like a measurement and is really a constant, so it cannot fail.

- **`document.fonts.status === 'ready'` is never true** — the settled value is `'loaded'`, and `ready` names the *promise*, so as a guard it skips the measurement.
- **`getClientRects().length` returns `1`** for a block however many lines it wraps to — one rect per *box*. Divide height by line height.
- **"Something scrolled" goes true mid-smooth-scroll**, with 800px left to travel. Poll for two equal `scrollY` reads, then assert the target's `top`.
- **`canvas.fillStyle` silently keeps its previous value when it cannot parse the new one.** Fed an unresolved `var(--color-muted-foreground)` it returned leftover black as a confident 19.81:1. `getPropertyValue()` returns the unresolved `var(...)`, and a build step that inlines custom properties keeps them off the runtime root.
- **Stopping at the first background that merely *paints* returns `1.00`** — it lands on a tint of the very colour the text is drawn in, scoring the element against itself.
- **Flipping the mode and reading in the same block returns the old colour.** A class change starts a transition; it does not finish one. Anything carrying a colour transition still computes its pre-flip paint for the whole duration, so a mode walk that writes the class and reads synchronously records light's values under a dark heading. Wait out the longest transition duration on the page, measured rather than assumed. **And make the control watch a painted value, never a token:** a custom property flips instantly, so a control asserting the background moved passes cleanly through exactly the run this rule describes.
- **A control that passed at the start says nothing about the end.** Subscribing proves the listener is attached, not that the run stayed open. A late async script landing after the network settled read as a clean console in thirteen straight runs.
- **"I cannot tell" is not "clean".** A contrast walk that withholds a third of its elements because they sit over a canvas sibling still has to exit non-zero.
- **A `MutationObserver` installed at document-start observes nothing.** A script seeded before the document is parsed finds `document.documentElement` is `null`, `observe()` throws, and the recorded sequence comes back **empty** — which reads as "the page never mutated", the settled and healthy answer. Observe `document` with `subtree: true`, which always exists and picks up the root element the moment it appears.
- **Reading a live attribute inside an observer callback returns the value after the whole batch**, not after the record you are looking at. A six-mutation boot sequence prints six rows all showing the final value, and any ordering question answers itself as "no ordering at all". Record `attributeOldValue: true` and reconstruct backwards.
- **A settled DOM is not the arrived content.** Everything behind a fetch seam is still a skeleton when the DOM settles, and a skeleton has no text — so a walk measures the masthead and the heading, finds nothing wrong, and prints CLEAN about a screen whose table it never saw. The tell is the population, not the verdict: 8 of 180 elements on a route with a seven-column table in it. Name the content that has to be on screen, so a route that never produces it fails instead of reporting the shell. Where a scratch probe wants a time floor anyway, **read it out of the app** rather than typing a number that stops covering the delay the day somebody tunes it.
- **One key press can arrive thousands of times.** A full browser auto-repeats a single dispatched keyDown until the run ends — 8002 keydowns from one press — where a headless shell delivers exactly one. Every repeat runs the app's handler, so a toggling shortcut lands on the parity of a race and the same code reports "the key did nothing" and "the key worked" on alternate runs. Press keys from the headless shell, and count the keydowns in the page so a doubled press fails the control instead of reading as a no-op.

And **read the console**: a render warning logged on every render survived five widths, both actions driven, and a byte-for-byte diff. Otherwise "verified" means "verified except for the part that was shouting at me".

## Before calling a change verified

- **Measurement covers objective correctness only.** Say what you measured *and* what you did not; whether it looks right is the designer's call.
- **Self-check the route against the repo's own lessons**, at `docs.gotchas`.
- **Screenshot before an interaction sweep that changes shared state.** A sweep over a control that re-skins the page leaves every shot in the last state clicked — several byte-identical images under a report that says they differ. The version of this that costs more is a control that writes to disk: a sweep over it leaves the working tree on the last option you touched.
