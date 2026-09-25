---
name: ingest-theme
description: >-
  Turn a designer's theme export or brand colours into the repo's own theme — four intake
  questions, generate or transcribe the file, review the four derivation traps, register it in
  every place a theme has to appear, and verify it rendered.
when_to_use: >-
  Use when a designer brings generated theme CSS or a set of brand colours, when a repo has to be
  rebranded to a client identity, or when a theme slot ships unfilled and an engagement needs it
  filled. Trigger phrases "here is the tweakcn export", "rebrand this to the client", "ingest
  this theme", "these are their brand colours", "fill in the brand theme".
compatibility: >-
  Reads theme.dir, theme.registry, theme.contract, theme.generator, theme.doc,
  components.showcase, records.product, checks.guard, dev.start, dev.platform and verify.mcp from
  .agents/host.json. With theme.generator null the values are transcribed by hand and the four
  traps in references/theme-traps.md are checked by hand rather than reported. With theme.dir
  null the repo carries one hardcoded look, so the ingest writes a single stylesheet and steps 4
  and 6 collapse. With theme.registry null there is no list to register in: the file is the whole
  theme. With components.showcase null there is no token page, so step 6 checks the theme on real
  screens alone. With dev.platform native the simulator does step 6's looking, and every value is
  looked at. With verify.mcp null on the web nothing can drive the app, so step 6 reads the file
  instead of the screen and says so.
metadata:
  suite: captain-phil
  host: [theme.dir, theme.registry, theme.contract, theme.generator, theme.doc, components.showcase, records.product, checks.guard, dev.start, dev.platform, verify.mcp]
---

# Ingest a theme

The short version: ask four questions, write the theme file into `theme.dir` with `theme.generator`
or by hand, read every trap the derivation fell into, register the theme everywhere a theme has to
appear, and look at it.

Read `theme.doc` once rather than once per ingest. It holds the repo's own token contract, its theme
roles and which modes a theme carries. `references/theme-traps.md` holds the four traps, which are
the repo-independent part and the part this skill spends a whole step on.

**On a NativeWind stack, read `references/nativewind.md` before writing a value.** Its tokens are
space-separated RGB triplets, and a dark theme is one token set written in three blocks. A value in
the wrong shape, or a token missing from one block, renders plausibly and wrong.

**Where the repo ships an unfilled theme slot, fill it rather than adding one beside it.** A slot
that ships at neutral values, registered under a placeholder label, is the thing an engagement
renames and fills. Adding a second theme beside it leaves the placeholder in every picker and every
screenshot, and nothing says which of the two is the client's.

## 1. Intake

Four questions, asked one at a time.

1. **The id.** The client or the product, kebab-case, never a placeholder word. It ends up in every picker, under every screenshot, and a label reading "Brand" tells a client nothing about their own product. Agree the human label the same way.
2. **The anchors.** A generator export is the direct path. Brand colours alone work too: at minimum the primary, and ideally the grounds, the line colour and the status anchors.
3. **More than colours?** A display face, a different radius, bespoke surface finishes. Colours alone is the common answer, and anything past it is sanctioned rather than assumed.
4. **Light, dark, or both?** This is a property of the theme rather than a formality. An identity that exists on one ground alone must say so, and then the repo holds every surface wearing the theme to that mode. A single-mode theme writes its one face into the base block and carries no dark block at all.

Record the answers before writing anything. Steps 2 and 4 both spend them, and a mode decided
halfway through the file is a file with two shapes in it.

## 2. Write the theme file

Run `theme.generator`, passing the id, the label, the role and the modes from step 1 rather than
taking a default for any of them. Read its output before it lands on disk, and delete whatever file
it replaces in the same commit.

Where `theme.generator` is `null`, the repo has no generator and the values are transcribed by hand:

1. Copy the most complete theme file in `theme.dir` as the shape, rather than the shortest.
2. Transcribe the designer's anchors verbatim, so a hex they chose stays findable as that hex.
3. Fill every slot `theme.contract` names. A slot left out inherits whatever encloses the surface, renders plausibly, and is the failure the contract exists to catch.
4. Derive each follower by the formula the sibling file uses, then read `references/theme-traps.md` and check all four by hand. Nothing reports them where no generator ran.
5. Where `theme.contract` is `null`, read the slot list off a sibling theme file, because a theme with fewer slots than its siblings is a theme with silent gaps.
6. On a NativeWind stack, convert each anchor to a triplet and write every token into all three blocks, per `references/nativewind.md`.

**Read the generator's own diagnostics.** They report every trap that fired, and one thing an
export makes easy to miss: an anchor the export moved in the light block and left alone in the dark
one. That anchor falls back to the stock value, so the theme wears the client's colour on one face
and the framework's on the other, with both blocks looking complete.

## 3. Review the traps

`references/theme-traps.md` holds the four, their thresholds and what each correction is for. Every
correction is a judgment made on your behalf, so the review is the check on that judgment rather
than a formality.

1. Search the written file for the marker the generator leaves — a comment naming the trap and the value it corrected — and read every one.
2. Confirm each corrected value against what the trap says to look for, rather than against whether it compiles.
3. Treat the extreme-brand trap as a decision for the designer, because it is flagged and not corrected.
4. Hand-edit anything a formula got aesthetically wrong on top of the corrections, and say in the file where you edited.
5. Mark the file as hand-tuned the moment you move a value, because a later regeneration deletes every ruling and keeps the file compiling.

## 4. Register it

The file is one of the things a theme is, and missing any of the others renders as a plausible
screen rather than as an error. Where `theme.registry` is `null` the repo keeps no list: the file is
the whole theme, so say that in one line and go to step 5.

1. Add the entry to `theme.registry`, carrying the id, the label, the role and the modes from step 1. The modes must match what the file holds.
2. Wire the file into whatever the repo loads its themes from, with the comment above it describing what the theme is rather than what the slot was.
3. Check the selectors inside the file match what the repo's other themes use. A theme file hoisted above the base stylesheet wins at document level on one selector shape and loses on another, so a hand rename that collapses two selectors into one renders in the app and vanishes in a nested preview.
4. Run `checks.guard`, which is what fails the registry, the file and the wiring as a set.

## 5. Record what you decided

**The theme file is the record of its values, and there is no second one.** A self-contained theme
holds explicit literals, so a prose file restating them is only ever the copy that disagrees.

Two homes, and both exist before this skill runs:

- **The theme file.** Every trap you overrode, and every value you moved off the derivation, goes in a comment beside the value it explains. Give the file a short header saying what the identity is.
- **The design record of whatever surface pins the theme.** That record holds how those screens spend the system — which surfaces carry the brand colour, what the type pairing does, what not to do with the palette. Run `record-design` once there are screens to read it off.

**Renaming a placeholder slot to a client creates one obligation.** A theme named after a client
marks a real engagement, so `records.product` owes a file describing that client. Run
`start-engagement` where it is absent, rather than writing a stub.

## 6. Verify

Start the app with `dev.start` and look at it with `verify.mcp`, per the `verify-ui` skill. Where
`verify.mcp` is `null` on the web, nothing can drive the app: read the file, say the theme is
unverified, and name the diff as the only evidence.

Where `dev.platform` is `native`, the simulator does the looking, by deep link and screenshot through
`verify-ui`. Every value is looked at rather than measured, so check each trap's value in the file and
use the screenshot to confirm the screen spent it. Switch the simulator's appearance with
`xcrun simctl ui booted appearance dark` to see the second face.

1. Open `components.showcase` and confirm the theme renders every token group. A page that reads live values off the rendered DOM is where a wrong or missing token surfaces, and it is the only place all four traps are visible at once. Where the slot is `null`, the repo has no token page, so say so in one line. Read the four trap values out of the file by hand, and let items 2 to 4 carry the check on real screens.
2. Check both modes where the theme carries both, and confirm a single-mode theme renders its one face rather than an empty specimen.
3. Put the theme on a real screen, because a token page proves the values and a screen proves the pairings.
4. Spot-check one narrow-width surface. On native, boot the smallest phone the app supports. Device chrome stays on the repo's own tokens rather than the client's, and a stepped token has to carry its narrow half.
5. Run `checks.guard` again, then whatever test holds the generator's output where the repo has one.

## Before handing back

Name the theme's id, what it is pinned on, every trap that fired and what you did about each one,
and anything left for the designer to decide.
