# The sweep list — Paper boards

Read this file at step 2 of `SKILL.md`. `sweeps.json` beside it holds the ready-made query for every mechanical sweep; copy the query rather than composing one.

A sweep keeps its number for life. A version adds numbers and removes none, and a retired sweep keeps its number with the word *retired* beside it. A run names the version it executed, runs every live sweep on it, and a skipped sweep voids the score.

## Scope

**The surface is the screens.** Everything else on the canvas organises the page or records a decision, and none of it scores:

- **Canvas furniture** — section header bars, band labels, margin notes.
- **Annotation stickies** — CHANGED and GAP notes, whatever they say and whatever they leave out.
- **Record boards** — an icon set, a reference card, a drift table. A run **reads** these as the standard the screens answer to (sweeps 2, 6, 17, 23) and raises the finding against the screen that departs from them. A defect in the record itself is housekeeping, and it goes on the fix list unscored.

A finding whose subject is any of the three is withdrawn on scope.

## Paper MCP facts the list relies on

- **Pass `fileId` on every call.** An omitted `fileId` targets whichever file was opened last.
- **Only the active page lays out.** Every node on an inactive page reports 0×0 and screenshots return nothing; switch with `open_file({ fileId, pageId })` first.
- **`get_screenshot` calls run one at a time.** Parallel calls wedge the renderer for the whole page until Paper Desktop relaunches; reads keep working, which is how you tell a wedge from a stuck document.
- **Every read except `get_screenshot` is parallel-safe.** `find_nodes`, `get_jsx`, `get_tree_summary` and `get_computed_styles` batch freely in one message.
- **`find_nodes` stops at 200 matches** and flags `truncated`. It is a predicate tool: query for the thing that must not exist and expect zero.
- **Neither `find_nodes` nor `get_computed_styles` indexes an SVG `stroke` attribute.** Two glyphs sharing a path and differing only in stroke colour look identical to both; `get_jsx` is the only read that separates them.
- **A literal colour query also returns token-bound nodes**, reported as their `var(--…)` reference, so one query covers both and says which is which.

## Order of work

The order is cost order: one tree read, one parallel batch of queries, one parallel batch of JSX reads, then screenshots for the boards that earned one. Sweep numbers stay as listed; the phase is where each runs.

| Phase | What runs | Calls for a 30-board page |
|---|---|---|
| A · Orient | `get_tree_summary` on the page root at depth 10, once; read the product and design records | 1 + files |
| B · Query | every `find_nodes` in `sweeps.json`, in one parallel message | ~15, one message |
| C · Read | `get_jsx` on every screen board, in parallel messages of ten | 30, three messages |
| D · Look | `get_screenshot`, sequential, on one hero per band and every board a finding names | ~8 to 12 |

Phase C is the measurement. A board's JSX carries every path, stroke, size, token, literal and text node on it, so one read per board answers sweeps 3 to 6, 11, 13 to 19 and 21 to 24 without a further probe. `get_computed_styles` is for the one value a JSX read leaves ambiguous.

## Version 3

**v3 retires sweep 1 and adds sweep 24.** v2 added 22 and 23 to v1. A run under v2 executed 1 to 23; a run under v1 executed 1 to 21.

**Orient — phase A**

2. Read the product record and the surface's design record or rules board before raising a finding, and check every candidate finding against them.
20. Check root frame widths and board positions against the page's stated convention, from the tree summary.

**Query — phase B**

7. Query typed glyphs standing in for icons — `←` `‹` `›` `–` `—`.
8. Query the vocabulary the product or design record has ruled out, one word per query.
9. Query each semantic colour token, and list where it is used.
10. Query the font families that are off the type system, one family per query.
11. Query `line-height` and `letter-spacing` literals where a token covers the value.
12. Query the placeholder facts — the sample user's name, email, code and organisation — for leaks and disagreement between boards.
22. Query the typed check and cross characters, `✓` and `✗`.

**Read — phase C**

3. Measure any element before calling it a defect. A board's JSX is the measurement; `get_computed_styles` settles a value the JSX leaves ambiguous.
4. Compare every SVG that repeats across boards on path, size and stroke, board by board, from the JSX.
5. Compare every glyph against its icon library's source path, path by path.
6. Measure every glyph's size and stroke against what the icon-set board declares, reading that board as a contract.
13. Trace every duration, count and promise on a screen to a named source.
14. Compare one control's whole type treatment across every board that draws it — colour, weight, line-height and alignment together, rather than colour alone.
15. Compare the eyebrow, the footnote, the required marker, the inline message and the disabled state across every board drawing one.
16. Compare the two states of one screen against each other, and against the same state elsewhere on the page.
17. Check that every glyph a board draws appears on the icon-set board.
18. Measure every non-text mark carrying an affordance against the contrast floor the product record sets. An unset floor is a criterion 1 gap.
19. Count the data states per flow — empty, error, offline, and loading where `loading_in_scope` is true — and name the door out of each error.
21. Where a previous round fixed something, read the boards the fix did not name for the inconsistency it created.
23. Read the icon-set board for a glyph no board draws, which is sweep 17 run backwards.
24. Read every screen board's JSX once, in full, and inventory its controls, glyphs, tokens, literals and text nodes into the sweep log before comparing anything.

**Look — phase D**

1. *Retired in v3.* Screenshot every board, one call at a time. Replaced by 24 for measurement and by the phase D rule for composition.

Composition and lanes (criterion 5) are judged from screenshots of one hero board per band, plus every board a phase C finding names. Take them one at a time, after phase C, and never in a message with another screenshot.
