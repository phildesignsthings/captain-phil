---
name: paper
description: >-
  Design in Paper Desktop through the paper MCP — orient in the file, read the components the
  code already ships, gate a from-scratch direction behind a written brief, build section by
  section with small writes, screenshot to review, and work the designer's comment threads.
when_to_use: >-
  Use when designing or iterating on a board in Paper, reproducing coded screens on the canvas,
  reading exact values out of a Paper file into code, or answering comments a designer left on a
  board. Trigger phrases "design this in Paper", "put this on the board", "mock some
  directions", "read this off the board", "work my Paper comments", "make a Paper file for
  this".
compatibility: >-
  Requires Paper Desktop running with the paper MCP server connected. Without it no step here
  can run, so say so rather than describing a board from memory. Reads records.design,
  surfaces.root, theme.dir, theme.registry, components.dir, components.registry,
  components.showcase, docs.local and dev.platform from .agents/host.json. Every one of those is
  read in step 2 alone, and a null or absent slot drops its line from the brief rather than stopping the
  work. With no slot answered at all, step 2 reads the shipped screens directly and the brief
  says which components it could not check. With dev.platform native, values come from the theme
  file rather than from the running app, because a simulator has no DOM to read them off.
metadata:
  suite: captain-phil
  host: [records.design, surfaces.root, theme.dir, theme.registry, components.dir, components.registry, components.showcase, docs.local, dev.platform]
---

# Work in Paper

`references/paper.md` holds the precedence ladder, the gotcha index and the token reference. This file is the procedure. Go to the reference the moment Paper behaves oddly, and go to it before believing any note here over the shipped tool schemas.

The short version: orient with `get_basic_info`, read what the code already built, post a brief and wait where the work is a fresh direction, then build one visual group per `write_html` call and screenshot after each.

## 1. Open every session this way

1. Load Paper's own instructions once per session with `get_guide({ topic: "paper-mcp-instructions" })`. Reload it where a long thread may have compressed it.
2. Orient with `get_basic_info` — artboards, dimensions, loaded fonts, existing tokens — and read focus with `get_selection`.
3. Call `get_font_family_info` before the first typographic style. An unavailable family or weight breaks the design in silence, so prefer a family the file has loaded.
4. Bind the right file and page. The first call makes a file sticky, `open_file` rebinds it, and passing `fileId` on one call reads another file without rebinding. `open_file` also takes `pageId`, which is how the active page changes.
5. Open the file whose scope the work belongs to, rather than adding a page to the nearest one. A scope with its own device or its own audience is its own file, and each file carries its own divider set.
6. Give new work its own page, named so the name says what it is and when it was made, and create it under the divider that matches how settled the work is. Fresh output goes under the first divider and never under a later one. Promotion is the designer dragging the page, so never move one yourself.
7. Ask which page the work belongs on where the file carries no dividers, rather than inventing a structure for somebody else's file.

**Paper lays out and screenshots the active page alone.** Every node on an inactive page reports `0×0`, which reads exactly like a broken layout. Switch pages yourself rather than assuming the designer left the right one open.

**Rule out the two impostors before blaming the MCP.** An inactive page reports `0×0`, and a stale node ID reports `childCount: 0` — both read as a board that emptied itself. Confirm against `get_basic_info` before believing a loss, then restart the session, because a long agent session is Paper's own first fix. Both traps are written up in `references/paper.md` § Gotchas.

## 2. Read what the code already built

Read the codebase before the brief, never after. A board drawn against the Paper file's tokens alone specifies components that do not exist and variants a primitive cannot do, and nothing catches that until build time, after the designer has approved the board.

Skip this step only where the surface is not in this repo.

1. Read the surface's design record, found through `records.design`. The section holding its named rules is the list of designs the surface has already rejected.
2. Read the theme the surface pins, out of `theme.registry` and the file it names in `theme.dir`, for the values behind the tokens the board spends.
3. Read `components.registry` for which primitives are installed, and open `components.showcase` where a variant's real range matters. Where `components.registry` is `null`, list `components.dir` instead. Where `dev.platform` is `native`, the showcase is a deep link, opened on the simulator through `verify-ui`.
4. Open the screens that ship under `surfaces.root`, and read the components the new board sits beside.
5. Check `docs.local` for the repo's own reference board before drawing the first one from scratch.
6. Name in the brief every component the board reuses, and every one it invents. An invented component is a decision the designer makes knowingly, and `add-primitive` is what answers it.

Drop the line for any slot that is `null` or absent, and say in the brief which of these you could not check. A board built against an unread design record reproposes something the surface already rejected.

**A board may propose what the code cannot do yet.** The rule is that it says so. A board that invents a variant in silence reads as buildable, and the cost lands on whoever builds it.

## 3. Gate a fresh direction behind a brief

Post a design brief **before any mutation call**, and wait for the answer. This is a hard gate rather than a suggestion, because a board built against an unstated direction gets rejected whole.

The brief carries six things, in this order: mood candidates, the chosen mood, the palette, the type scale, the direction, and what step 2 found — the components the board reuses and the ones it invents. Skip the gate only where the task is reproduction or a read.

## 4. Build

1. Write small and often — one visual group per `write_html` call, with `targetNodeId` and `mode: "insert-children"`. A card with a header, four rows and a footer is six calls, so the designer watches it build.
2. Style with real CSS: flex layouts and containers, `var(--token)` inline, and no utility classes. Units are `px` for font size, `em` for tracking, `px` for line height.
3. Reuse rather than re-author — `duplicate_nodes` plus `set_text_content`, `update_styles` or `delete_nodes`, or an `<x-paper-clone node-id="…">` inside `write_html`. Paper has no component or instance system, and tokens alone are live-linked.
4. Reorder and reparent with `move_nodes`, which preserves node IDs and keeps existing references valid. Never delete and rewrite a subtree to change its structure.
5. Screenshot after each meaningful group and review it: spacing, typography, contrast, alignment, artboard fit, repetition. Shoot at 1x, and use `scale: 2` only to read small text.
6. Call `finish_working_on_nodes` when you pause or finish.

Consume tokens the file already holds rather than recreating them, per `references/paper.md` § Tokens. Read that section in full before writing any token, because a value overwrite restyles every node bound to it across the whole file.

## 5. Lay the page out

A page reads **left to right for the flow and top to bottom for a screen's states**. Clone a board the page already holds with `<x-paper-clone>` rather than re-deriving the numbers.

| What | Value |
|---|---|
| A lo-fi screen board | 390 × 844 for a phone, the background token as the ground, the largest radius, 2px solid black border |
| A hi-fi screen board | the device's own frame, 393 × 852 for a phone, a literal white ground, no border and no radius |
| The next screen in the flow | board width + an 80 gutter, in x — 470 at a 390 board |
| A state of that screen | board height + a 100 gutter, in y, in the parent's own column — 944 at an 844 board |
| A band header's top to its first board's top | 316, whatever the header's own height is |
| The last board of a band to the next band header | 400 |
| A band header's width | the first column's left edge to the right edge of the band's rightmost thing, note or board |
| A note | 280 wide, `height: fit-content`, 16px padding, the base radius, a 1px border |
| A note's slot | the board grid — the same 470 in x and 944 in y the boards take |
| A band header's box | white fill, 2px solid black outline, the largest radius, the section spacing as padding |

The rules the numbers do not carry:

1. Name a state board after its parent plus a letter — `A4` becomes `A4a`, `A4b`, `A4c` — and hang it under the parent, never in a spare slot to one side.
2. Write a band header as what the band is, on the left, and the date it was last updated, on the right. No eyebrow, no kicker, no hairline label, nothing else in the bar.
3. **A lo-fi row and a hi-fi row are different rows, and the frame is the marker.** Never restyle a lo-fi board into a hi-fi one: clone it and leave the original in place, so the two read as before and after rather than as one board that changed its mind.
4. Move the bands rather than the boards when a column needs another rung, and move each band's header, boards and notes together by one row pitch.
5. Give a sticky note one thought — a tag, a headline that states it, and a short paragraph of source and reasoning. A note carrying four paragraphs is four notes.
6. **Put a note in the board grid, not in a side rail.** A note takes a board slot at the same 470 and 944 pitch: an empty slot inside the band where one sits next to the board that prompted it, then fresh columns past the last board once the band is full. Widen the band header to cover them.
7. **The name carries the note's state and the colour only repeats it.** Name a note `Note · CHANGED <id> — <headline>` or `Note · GAP <id> — <headline>`, numbering ids per state across the page. Never drop the word and leave the fill to say it.
8. **A gap that closes keeps its id and changes its word** — `GAP G2` becomes `Note · CHANGED G2 closed`. Renumbering it severs the answer from the question it answers.
9. **Give a look round its own page, and clone the lo-fi board onto it as the base.** How a screen looks is a different question from how its flow runs, so a set of hi-fi directions gets its own page rather than another band under the flow. Put the lo-fi board the directions re-skin at the left of the row, and name each direction after the look it is trying rather than after the screen, which the base already names.
10. Put on a board only what the screen shows. A footnote explaining why the design works this way is a note, and a line of interface copy that states a ruling is the same leak wearing product voice.

**Every board a band holds is a screen, and the band reads as a flow.** A component specimen, a state chart or a legend belongs in a note rather than in a board column, because a column of specimens makes the designer reconstruct the journey from parts.

**400 between bands is the number that gets missed.** A page built without it reads as one undifferentiated field of boards, which is the state this convention exists to fix.

## 6. Pick the mode

- **From scratch** — run the step 3 gate, then build section by section.
- **Iterating on coded screens** — run step 2 against the screen, mock variations on the canvas, and screenshot-compare. Touch no code until the designer picks a direction.
- **Reproducing coded UI** — build it 1:1 as labelled cards, with no invented variants, grouped by screen, in gated passes the designer reviews between.
- **Reading a design into code** — take exact values from `get_jsx`, `get_computed_styles` and `get_fill_image`, and translate Paper's CSS output into this repo's conventions rather than pasting it. **Never build code from a screenshot**; a screenshot verifies a result. A line-height comes out of Paper as px and goes into a React Native theme as a ratio, per `references/paper.md` § Tokens.
- **Generated or shader-driven visuals** — capture rather than approximate. Screenshot the live element at the frame's exact height and place it as a `paper-asset://` image. A simulator captures the whole screen, so on native crop the capture to the element before placing it. A rebuild out of `radial-gradient()` stacks will not converge.
- **Syncing tokens between the app and a board** — follow `references/paper.md` § Tokens, and do token writes in one call, sequentially. Never split token work across parallel agents. Where `dev.platform` is `native`, the values come from the theme file, never from a simulator screenshot.

## 7. Work the comment threads

A designer's comments are the review channel: `list_comment_threads` → `get_comment_thread` → fix → `set_comment_thread_status`. Resolve each thread as you land it.

1. Convert and record every pin in a frame **before** editing that frame. Offsets are frozen against the layout at comment time, so one deletion or resize throws every later conversion off by the reflow.
2. Resolve "this" and "and here" from the pin rather than from the screenshot. Add the pinned node's `worldX` and `worldY` to the thread's `xOffset` and `yOffset`, then match the result against `get_node_info` bounds.
3. Treat two nearby pins with different wording as two complaints until you have read both.
4. Leave a thread **open** where the designer still has to decide something. Paper ships no reply tool, so anything awaiting an answer goes in your report.

## Before handing back

1. Give the designer a handoff link — `https://app.paper.design/file/<fileId>/<pageId>` — paired with the file and page **names**. Node IDs re-key and names do not.
2. List the threads you resolved and the ones left open with the question each is waiting on.
3. Name every component the boards invented, so the build knows what it owes before it starts.
4. Send any fresh trap to the skill suite as a change to `references/paper.md`, generalized into a rule, and record it in this repo's own notes meanwhile.
