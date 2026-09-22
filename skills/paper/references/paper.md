---
doc: paper
house_style: true
---


# Paper Desktop

[Paper](https://paper.design) is a canvas design app where every element is real HTML and CSS. The
`paper` MCP (`mcp__plugin_paper-desktop_paper__*`) lets an agent read and write those files.

The `paper` skill runs the work: orienting, the design-brief gate, building, and the comment review
loop. This file holds what that procedure has to look up. A repo that keeps its own Paper notes
overrides it, because that file carries the traps the repo has already paid for.

## What to trust, and in what order

This file is a **quick lookup guide rather than a source of truth** — generalized notes on behaviour
that the tool schemas leave unstated. Paper ships fast, so treat any of it as possibly stale.

Precedence, highest first:

1. **The tool schemas in your session** — authoritative for *what you can call*. The published reference lags the shipped surface, so a tool missing from the docs may still exist, and the reverse holds too.
2. **`get_guide({ topic: "paper-mcp-instructions" })`** — Paper's own in-product instructions, for behaviour and quality bars.
3. **Official docs** — [Paper docs](https://paper.design/docs) · [MCP reference](https://paper.design/docs/mcp) · [tokens](https://paper.design/docs/tokens) · [paste](https://paper.design/docs/paste) · [vector](https://paper.design/docs/svg). Check these before trusting a workaround here, and **before believing a tool exists** — a note naming a tool is no evidence it shipped.
4. **This file.**

**Keep it living, and upstream.** This file installs from the skill suite, so an edit made in a
consuming repo is deleted by the next update. Send a fresh trap to the suite as a change to this
file, generalized into a rule, and record it in the consuming repo's own notes meanwhile. When
Paper fixes a trap, delete the entry, because a stale workaround costs the next agent a detour.
Where a note here contradicts the official docs, the docs win.

## Gotchas

- **Paper only lays out and screenshots the ACTIVE page.** If the user clicks to another page mid-build, every node reports `0×0` and `get_screenshot` returns nothing. This looks exactly like a broken layout and isn't. **Switch pages yourself with `open_file({ fileId, pageId })`** — token writes are file-wide and page-agnostic, but anything you need to lay out or screenshot must be on the active page.
- **A screenshot of a fill-less nested frame comes back on a black backdrop.** The artboard's own `backgroundColor` is not composited when you shoot a descendant, so a light theme reads as dark-on-dark and looks like every colour token failed. Shoot the artboard, or give the section frame its own `backgroundColor`.
- **An image fill stored as `background-size: round(100%, 0.5px)` renders zoomed and cropped.** Paper's own pixel-snapping wrapper does not resolve to `100%`, so a placed screenshot comes back as a tight centre crop of itself — which reads as "someone replaced my reference with a detail shot", not as a sizing bug. `get_fill_image` still returns the full, correct asset, so the asset is not the problem. Set `backgroundSize: "contain"` explicitly via `update_styles` (batch every image node on the board; find them with `find_nodes({filters:[{styleName:"background-size", styleValue:"*round*"}]})`).
- **A token binding cannot be overridden per-subtree.** Setting a custom property (`--color-card: #222`) on a frame via `update_styles` is accepted — it is not reported in `ignoredStyles` — and changes nothing: Paper resolves `var(--token)` against the file-wide token set, not the CSS cascade. So there is no way to render one artboard under a different set of token values. A theme or mode variant has to be remapped node by node: `find_nodes({nodeId, filters:[{styleValue:"#RRGGBB"}]})` per palette value, group the results by the returned `styleName`, then batch `update_styles`. A literal-colour query returns token-bound nodes too, reported as their `var(--…)` reference, so one query covers both and tells you which is which.
- **Node IDs are not stable — Paper re-keys them.** A stale ID reports `childCount: 0`, which reads exactly like the board was emptied. Confirm against `get_basic_info`'s artboard list and total `nodeCount` before believing a loss, and re-resolve IDs by layer name rather than trusting ones written down earlier.
- **`duplicate_nodes` scrambles order.** Clones insert *immediately after the source*, not at the parent's end, and cloning into a parent does not preserve array order. Pass `parentId` to target an empty container, or batch-duplicate and then fix the order with `move_nodes`.
- **`descendantIdMap` is not positionally reliable.** After cloning a subtree, `get_tree_summary` the clone to read true per-item IDs before any per-item edit — otherwise you restyle the wrong child.
- **To repeat a node, clone it inside `write_html` rather than calling `duplicate_nodes`.** An `<x-paper-clone node-id="…">` lands in document order at the insert point, and the call returns every descendant's ID beside its layer name, so `set_text_content` and `update_styles` can follow with no lookup and neither trap above applies. Override `position: static; left: auto; top: auto` in the clone's own `style` to lift an absolutely-positioned source into a flex parent.
- **Clipped content → set the artboard to `height: "fit-content"`** via `update_styles`. Don't guess a new fixed height, and don't delete the frame and start over.
- **Repeated rows need fixed-width slots** — `width` + `flexShrink: 0` on icons and trailing actions, even where a slot is empty in some rows. Gap alone will not hold vertical lanes. After three or more similar rows, screenshot and trace a vertical line through the icons to verify.
- **Icons render dark on dark** — `stroke="currentColor"` doesn't inherit. Set `stroke="var(--color-…)"` explicitly on the `<svg>` **and** every child path.
- **`fill` doesn't cascade from `<svg>` to its children either.** `fill="none"` on the root leaves child paths filled black, which reads as a broken icon. Set `fill="none"` on every path, or fix after the fact with `update_styles` on the child SVG nodes.
- **`color-mix()` is not evaluated — Paper keeps the FIRST colour and drops the mix.** It is not
  reported as invalid and the element does not go black, so `color-mix(in oklab, #F00 50%, #FFF)`
  paints solid `#F00` and reads as a value someone typed wrong. This matters because it is the
  obvious way to express a token at partial alpha (`var(--color-border)` at 30%), which is how most
  app surfaces are authored. **To render a token at alpha, nest instead:** a `position: absolute`
  fill child carrying `backgroundColor: var(--token)` + `opacity`, with the content in `position:
  relative` siblings over it. Putting the opacity on the container itself fades its text too.
- **CSS gradients in `background-image` don't render — the element goes black.** `repeating-linear-gradient`/`linear-gradient` silently fail and take any `backgroundColor` with them. Build grids and stripes from real flex children, or set a flat `backgroundColor`.
- **Inline `<span>` styling is flattened.** Paper has no rich text, so a coloured or weighted span inside a text element loses its styling and inherits the parent's. Split the run into sibling text nodes inside a flex row with `align-items: baseline`.
- **`position` is dropped by `update_styles` on an existing Frame.** It comes back in `ignoredStyles`, so you cannot retrofit a positioning context onto a node you want to hang an absolute child off. Author the wrapper through `write_html` instead — or `write_html` a `<x-paper-clone>` of a wrapper that already works, in `replace` mode.
- **Position artboards via `update_styles` `left` / `top`.** The `create_artboard` x/y args auto-stack below existing frames.
- **`write_html` appends, and Paper paints later children on top.** For a background layer, insert it and then `move_nodes` it to `index: 0`.
- **Wide multi-frame screenshots come back empty** (~6,000px+) — shoot one frame at a time.
- **Reference assets by absolute path** — `<img src="paper-asset:///…/assets/…">`.

## Tokens

Paper's token types: colour, font family, font weight, font size, line height, letter spacing, spacing, container, breakpoint, radius — the Tailwind v4 `--color-*` / `--text-*` / `--font-weight-*` / `--tracking-*` / `--leading-*` / `--spacing-*` / `--container-*` / `--breakpoint-*` / `--radius-*` namespaces. Always consume tokens already in the file; don't recreate them.

**Store behaviour** — each of these affects what you get back out:

- **Tailwind's paired syntax collapses.** `--text-h1--line-height` is stored as `--text-h1-line-height` (single dash), and renaming it back doesn't stick. A straight Paper→Tailwind v4 export won't re-pair line-heights with their font sizes.
- **oklch is re-quantised** — e.g. `oklch(0.1505 0.0042 285.88)` → `oklch(15.1% 0.004 285.9)`. Visually identical, but keep the codebase as the source of truth for exact values.
- **Bare numerics get `px` appended** — `100` becomes `100px`.
- **Renames preserve node bindings; value overwrites don't.** Renaming a token is safe and changes nothing visually. Overwriting its value restyles every node bound to it, across the whole file.
- **Font size is tokenised, but line-height is authored as literal px.** Swapping a type ramp therefore drifts the leading ratio on every board built against the old sizes. Don't misdiagnose this as broken bindings — restoring the token values usually snaps the leading back into ratio without touching a single node.
- **Tokens don't sync between files.** A theme copied into another file is a static copy.

**Syncing a codebase into a Paper file:**

- **Give the incoming set its own namespace.** A file's existing ramp is sized for its boards; an app's is UI type in a browser. Two scales for two media must not share a name, or restoring one breaks the other.
- **Never hand-convert a value.** Read resolved values live from the running app, and read the correct variant — whatever theme / mode / density axes the app has, all of them apply. Check what the board itself is showing before picking.
- **Tokens Paper has no type for** (shadows, z-index, opacity, `env()`) — document them on the board rather than forcing them under a nearest-fit type.
- **Do token writes in one call, sequentially.** Don't split token work across parallel agents, and don't let another agent touch the file mid-write.

- **A synced colour set is no evidence the rest of the set is synced.** Read the radius ladder off
  the running app like every other value, and resync the ladder in place rather than adding a
  parallel `--radius-ui-*` namespace.
- **A corner with no rung stays a literal.** Bare Tailwind `rounded` is 4px off the *framework*
  default, not off `--radius`, so it has no token to bind to and is the one place a literal is
  correct. Worth flagging to the designer: it also means that element won't re-round when a theme
  changes `--radius`.
- **A lane needs `minWidth: 0`.** `flex-grow: 1; flex-basis: 0` loses to the min-content floor when
  the child text is `white-space: nowrap`, so repeated rows drift by content length. Read widths out
  of `get_tree_summary` across the rows rather than eyeballing the screenshot.

**Reading tokens back out into code:** a file may hold more than one set — a base ramp and a hi-fi one, or a namespace per theme. **Confirm which set the board you're reading was built against before porting any value.** The names won't tell you, and picking the wrong set yields a plausible number that is wrong on every screen — the failure looks like a design disagreement, not a lookup error.
