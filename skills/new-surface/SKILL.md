---
name: new-surface
description: >-
  Scaffold a new surface — the intake questions asked one at a time, the design-intent contract
  agreed before any code, the folder written to the repo's own structure, its records, its issue
  declaration on an engagement branch, and a check that it renders.
when_to_use: >-
  Use when somebody wants to start a new prototype, screen set, flow or user journey, when a
  surface has been scaffolded by a form and needs finishing, or when a new area of the app needs
  its own folder. Trigger phrases "new prototype", "start a new flow", "add a journey", "scaffold
  a screen set", "I made one with the form".
compatibility: >-
  Reads surfaces.root, surfaces.unit, surfaces.doc, surfaces.route, surfaces.limits, theme.registry,
  memory.connectors, records.design, issues.ladder, issues.doc, issues.retired, components.dir, dev.platform,
  dev.start, dev.url and verify.mcp from .agents/host.json. With surfaces.root null the repo has a
  single application, so the surface is a route folder and step 3 asks once where it lives. With
  surfaces.doc absent the structure is read off a sibling surface rather than a document. With
  theme.registry null the repo has one look, so the theme question is not asked. With issues.ladder
  null, or issues.retired true, no issue declaration is written. With verify.mcp null step 4 reads
  the files rather than the screen and says so.
metadata:
  suite: phil-d-skills
  host: [surfaces.root, surfaces.unit, surfaces.doc, surfaces.route, surfaces.limits, theme.registry, memory.connectors, records.design, issues.ladder, issues.doc, issues.retired, components.dir, dev.platform, dev.start, dev.url, verify.mcp]
---

# New surface

`surfaces.doc` is the structure this skill fills in. Read it before scaffolding anything; this skill
is the order and the questions, not the folder's rules.

Call the thing by the word in `surfaces.unit` in every line printed. A repo that calls them
prototypes and a skill that calls them surfaces are two vocabularies the designer has to translate
between on every turn.

## 1. Interview first

**Skip a question a form already answered.** Where the folder exists because somebody scaffolded it
elsewhere, read what is in it and go to step 2. Re-asking what a file already says reads as the
scaffold having failed.

Otherwise ask the intake questions one at a time, in this order, taking each answer before the next
question. `surfaces.doc` owns the list where the repo states one; where it does not, these five are
the list.

1. **The title and the folder name.**
2. **What is this?** Two or three sentences, in the designer's words.
3. **Whose journey, and what are they trying to do?** One line per role.
4. **Which viewport?** Ask it as three answers rather than two: the phone, the desktop, or both at
   every width. Offer the third as what it is — a commitment to build and keep two layouts — rather
   than as the safe middle, and never infer it from a summary that merely mentions a phone. Where
   `dev.platform` is `native` the question is which device sizes, and the answer binds the same way.
5. **Which look?** The repo's default is the honest answer for most surfaces. Offer a theme from
   `theme.registry` by its **label** rather than its id, and where the only identity slot is still
   unfilled, say so and offer to run `ingest-theme` first. Where `theme.registry` is `null` the repo
   has one look and this question is not asked.

**Light and dark is not a sixth question — it comes with the theme.** A theme declares which modes
it carries and the surface inherits them. Say nothing where the theme carries both. Where it carries
one, tell the designer the surface will be that mode only, and do not offer to change it: the lock
belongs to the theme rather than to this surface. A surface may narrow its theme and never widen it,
and it only narrows where the designer raises it — "these screens are only ever seen dark" is a
design statement rather than a default worth prompting for.

**A sixth question exists only on an engagement branch: which stories do these screens answer?** Ask
it where `memory.connectors` records a real tracker project, and skip it while that block is still
placeholders. The answer is one or more **parent stories** — the ones with a client-legible title —
and never the design sub-task hanging off one. Skip the question too where `issues.retired` is
`true`: a ladder that was dropped on purpose does not come back one surface at a time. The answers
become the declaration in step 3.

## 2. Design intent — before any code

Run step 2 of the `new-screen` skill, which holds the contract's format and the menus behind its
values. Wait for the nod.

This is the step that stops every screen becoming a stack of same-sized cards. Do not skip it, and
do not bury it in a wall of text.

## 3. Scaffold

Write the folder under `surfaces.root`, to the structure `surfaces.doc` states. Where `surfaces.root`
is `null` the repo has a single application: ask once where a screen of this kind lives, then follow
whatever a sibling does.

Four things hold wherever the folder lands.

- **Three records, written as the folder is created.** One for the developer — what this is, what is
  real, what is faked, and the decisions already taken, starting with the intent step 2 agreed. One
  for the next designer, recording the visual system the built screens land rather than the plan:
  scaffold it unfilled below its overview and fill it from the screens, because values recorded
  before the build get defended against the screens instead of describing them. One for the agent —
  short, pointing at the two files to read first and the rules that bind inside the folder. Add the
  design record to `records.design` as it is created — a record no host file lists is one
  `record-design` never comes back to. The entry is an object rather than a path, and the shape is
  printed here because the schema does not travel with the host file: `{ "surface": "<the surface,
  in the repo's own word>", "path": "<the record>", "sidecar": null }`.
- **Compose from `components.dir` rather than building a primitive.** Check what is there before
  writing any interface; the primitive usually exists. Data never gets hardcoded in a component.
- **Every file lands in a layer, and imports run one direction only.** `surfaces.doc` names the
  layers. Where it names none, match the sibling that most resembles this surface.
- **The size limits are a command, not a memory.** Run `surfaces.limits` rather than recalling a
  number. A screen outgrowing one wants a smaller component pulled out of it rather than a longer
  file.

Two declarations are conditional.

- **A second screen means the surface declares its screens** — a slug and a title each — which is
  what makes each one addressable, listable and reload-proof. A brand-new surface declares nothing
  and gains entries as screens land.
- **Client work means the issue declaration from step 1's sixth question**, in the shape
  `issues.ladder` types, with each rung's status derived by the table in `issues.doc` and the
  seed's provenance recorded in the developer's record rather than in a code comment a form's save
  would delete. Omit it entirely for work that is not client work.

## 4. Verify

With `dev.start` running, confirm four things at `surfaces.route` under `dev.url`: the surface
renders, it wears the theme it pins, it comes up in the frame its viewport answer asked for, and it
appears wherever the repo lists its surfaces. Drive it with `verify.mcp` and read the accessibility tree rather than
trusting a screenshot. Where `verify.mcp` is `null`, say that the surface was read rather than
driven, and name what went unchecked.

A theme pin that was never registered, and a mode pin that widens its theme, both render as a
plausible screen rather than as an error. Where the surface narrows its mode, walk out of it too:
leaving must restore the designer's own preference rather than stranding the app in this surface's
mode.
