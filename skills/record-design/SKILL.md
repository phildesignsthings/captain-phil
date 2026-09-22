---
name: record-design
description: >-
  Fill or refresh one surface's design record from the screens it shipped — read the built
  interface with a probe, write the canonical sections, then triage every rule found into the
  repo's lessons file or into the record's own named rules.
when_to_use: >-
  Use when a surface's design record is unfilled below its overview, when a drift watch reports
  the record has fallen behind the code, when the look has moved since the record was written,
  or when a surface is being handed to a developer or a designer who was not in the session.
  Trigger phrases "fill in the design record", "the design record is stale", "record the design
  system", "document this surface's design", "re-derive the design record", "what look did this
  land".
argument-hint: "[surface]"
compatibility: >-
  Reads records.design, records.designDoc, records.driftWatch, surfaces.root, surfaces.unit,
  theme.registry, docs.gotchas, verify.mcp and verify.probes from .agents/host.json. Without
  records.designDoc, the format in references/design-record-format.md applies. With
  records.design empty, ask which file records this surface and offer to record the answer.
  With records.driftWatch null, drift is noticed by reading rather than reported.
metadata:
  suite: phil-d-skills
  host: [records.design, records.designDoc, records.driftWatch, surfaces.root, surfaces.unit, theme.registry, docs.gotchas, verify.mcp, verify.probes]
---

# Record a surface's design

A design record describes the system a build **landed**, read off the shipped screens. It never
describes the plan, the comp or the intention. That single rule is what the whole procedure exists
to hold: a record written from intentions becomes a set of values nobody measured, and the next
agent defends them against the screens instead of describing them.

`references/design-record-format.md` holds the canonical section list, the order and the length
rule. The file named by `records.designDoc` overrides it wherever the repo states its own. This
skill runs the derivation.

Where `$1` names the surface, record that one. Where it is empty, ask which surface before reading
any screen — one record per surface, and a record never describes two.

Two things go wrong often enough to name up front:

- **A value used once is not a system.** Leave it out. A record listing every hex the screens
  contain is a screenshot in prose.
- **The tokens belong to the theme, not to the surface.** Record how these screens *spend* them.
  Retuning a value is an edit to the theme file, and it moves every surface pinned to that theme.

## 1. Scope it to one surface

1. Find the surface under `surfaces.root`, in whatever the repo calls one — `surfaces.unit` carries
   the word. Where `surfaces.root` is `null`, the repo is one application and the surface is the
   route or the area you were pointed at.
2. Read its own configuration for the theme it pins and the screens it declares, and its
   developer-facing readme for what is real and what is faked.
3. Read the record already on disk, where `records.design` names one for this surface, and note
   which sections carry values against which sit unfilled. A refresh replaces what has moved and
   keeps what still holds. Where the list names no file for this surface, ask where the record
   belongs and offer to add the entry to `.agents/host.json`.
4. Stop and say so where the surface holds one placeholder screen. There is nothing to read off
   yet, and an invented record is worse than a scaffold's honest blanks.
5. **A repo's own chassis is a surface too.** Where `records.design` lists an entry for the
   harness, the shell or the tooling, the same format and the same triage apply: read the theme
   `theme.registry` marks as the chassis one for the pin, and the repo's own routes for the
   screens. Nothing else about the procedure changes.

## 2. Read the shipped screens before writing a word

The screens are the source. Reading the theme file alone produces a record of what a theme offers
rather than of what these screens took.

1. Start the app and open every screen the surface declares, at the viewport it pins.
2. Drive each screen through its four data states, so the record covers loading, empty and error
   rather than the happy path alone.
3. Measure rather than eyeball. The `verify-ui` skill runs the probe from `verify.probes` and
   carries the rule for a number that looks too clean. Where `verify.mcp` is `null`, nothing can
   drive the app: derive from the source, and say in the record's first line that it was read off
   code rather than off screens.
4. Read computed values off the rendered DOM, not out of the stylesheet. A token declared and never
   spent belongs in no section of this record.
5. Note where a screen departs from the theme's default. A departure is the most useful line a
   record carries, and it is invisible to anyone reading the theme file.

## 3. Write the record

Write the sections by hand from what step 2 measured. Where a scaffold record is already on disk,
each unfilled section carries the instruction for what to read off the build.

Four rules bind the writing:

1. Keep the canonical headings and their order. A near-miss such as `## Elevation and Depth` is a
   section every reader walks past, and a repo that checks its records mechanically fails it.
2. Drop a section rather than inventing rules to fill it. The overview is the one section that is
   true from the first screen and stays.
3. Keep the record under the length rule in `references/design-record-format.md`. Past it, the
   record has started listing values used once.
4. Write the record beside the surface it describes. A design record filed at repo level claims to
   describe the repo.

Metaphor is legal in a design record and in little else: a record carries a creative north star,
which does different work than an instruction.

**Where a documenting tool is installed, offer it as one of two routes rather than as the better
one.** Hand off to it scoped to this surface alone, then check its result against the section list
before returning. Nothing mechanical depends on it, so the manual route is a first-class answer.

## 4. Triage every rule you found

A derivation surfaces rules. Each one has two possible homes, and filing it in the wrong one is how
a decision about one surface gets applied to a surface that never agreed to it.

1. Ask of each rule: **would this hold on a surface that shares none of this one's tokens?**
2. Yes — it is a **mechanism**, a CSS, React or styling-layer trap that bites anyone anywhere. File
   it under `docs.gotchas` and index its heading. Where that slot is `null`, the repo keeps no
   lessons file: say so, and put the mechanism in the record with a line marking it as portable.
3. No — it is a **ruling** about how this surface spends the system. File it under the record's
   named-rules heading, which the format provides beneath colour, type and elevation.
4. Write a ruling so it can reject a plausible design. "Use spacing thoughtfully" rejects nothing;
   "a headline figure stays 400, never 500" rejects something.

## 5. Check it, then say what moved

1. Run whatever the repo checks its prose files with, and its file-shape check.
2. Run `records.driftWatch`. A drift watch is quieted by the record and its sources shipping in one
   commit, or by a derivation moment later than every source's commit. A catch-up re-derive only
   ever gets the second, so **stamp the derivation moment to the second**. A bare date parses as
   midnight, which backdates the derivation behind every source commit made later that same day,
   and the watch then reports drift that no re-derive can clear.
3. Add the surface to the watch's list where the record is worth watching, naming the theme it pins
   as the source. Keep the source list tight — a source that moves for unrelated reasons turns a
   true report into noise.
4. Report which sections changed and which rules were filed where. A reader who knew the previous
   record needs one line naming what moved.
