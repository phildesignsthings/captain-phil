---
name: add-primitive
description: >-
  Install a component-library primitive and register it so it appears in the repo's catalogue
  with a full spec sheet — check what exists, run the install command, append the registry
  entry, then verify both routes.
when_to_use: >-
  Use when a component the interface needs is absent from the repo's primitives folder, when a
  catalogue entry is incomplete, or when a primitive brings a token group the catalogue has to
  show. Trigger phrases "add a component", "install this primitive", "we need a date picker",
  "it is missing from the library", "add it to the catalogue".
compatibility: >-
  Reads components.dir, components.install, components.registry, components.showcase,
  components.doc, theme.contract, dev.platform, dev.url, verify.mcp and dev.start from
  .agents/host.json. With components.install null the repo writes a missing primitive by hand, so
  steps 2 and 4 change shape. With components.registry null the repo shows no catalogue:
  registration is skipped and said so in one line, and step 5 has one route to check instead of
  two. With components.showcase null there is no catalogue route, so step 5 checks the primitive in
  the screen that uses it. With dev.platform native, step 5 opens each route by deep link on a
  simulator and reports what it saw as looked at.
metadata:
  suite: captain-phil
  host: [components.dir, components.install, components.registry, components.showcase, components.doc, theme.contract, dev.platform, dev.url, verify.mcp, dev.start]
---

# Add a primitive

The short version: check `components.dir` first, run `components.install` with the component name,
append an entry to `components.registry`, and verify at `components.showcase` and the entry's own
route.

**Installing without registering is the failure this procedure exists to prevent.** An unregistered
primitive works in the screen that pulled it in and is invisible to everyone else, so the next
designer asks for one that already exists.

## 1. Check what exists

1. List `components.dir` and look for the primitive under the name its library ships it as.
2. Compose from what is there wherever a combination covers the need. A dialog with a form inside
   is two primitives, not a bespoke third.
3. Read `components.doc` for what a registry entry owes and which layer a component file belongs
   in. Where the slot is absent, copy the shape of the entries already there.
4. Stop here and go to step 3 where the primitive exists and only its catalogue entry is missing.

## 2. Install it

1. Run `components.install` with the component name appended, from the directory the repo runs it
   in. Never hand-roll a primitive the library ships.
2. Where `components.install` is `null`, the repo writes its primitives by hand: build it in
   `components.dir` to the shape of its siblings, and skip to step 3.
3. Read `git status` straight afterwards. An installer rewrites sibling primitives it treats as
   dependencies, so an add of one component lands edits in several files.
4. Revert any sibling rewrite that undoes a local change, and keep the ones that are stock.
5. Confirm the primitive composes the way the repo's other primitives do. A library that ships two
   composition styles installs whichever its configuration names, and a primitive on the other
   style typechecks and then fails at the first slot it is handed.

## 3. Register it

Append an entry to `components.registry`, reading the required fields out of `components.doc`
rather than guessing them. Where `components.registry` is `null`, the repo shows no catalogue: say
that in one line and go to step 5.

1. Copy the most complete entry already there as the template, rather than the shortest.
2. Reference the library's own documentation page for canonical example markup.
3. Fill every optional field for anything freshly installed, so the primitive gets a spec sheet
   rather than a placeholder note.
4. Write no per-component styling. A catalogue is generic over its registry, and a complete entry
   renders fully skinned on its own.

## 4. Register a token group, where the primitive brings one

A primitive that introduces tokens needs those tokens declared, and declared in both halves.

1. Add each token by the move the repo's theme rules state, in the same commit. Registering it in
   the stylesheet and stopping there is the silent failure: a token no slot in `theme.contract`
   names is never looked for, the guard stays green, and the token resolves to a neutral on every
   theme.
2. Where a token steps at a narrow width, declare both halves of the pair. A theme that steps one
   half without the other renders the wrong size with no error.
3. Add the group to the catalogue's own token listing, under whichever bucket the repo sorts by.
   Where that field is required by its type, an omission is caught at the typecheck.
4. Keep a token off the page, rather than out of the contract, where it has no specimen worth
   showing. An exemption in the contract carries its reason; a missing declaration carries nothing.

## 5. Verify

Start the app with `dev.start` and check the routes with `verify.mcp`, per the `verify-ui` skill.
Where `verify.mcp` is `null` on the web, nothing can drive the app: say the entry is unverified and
name the diff as the only evidence.

`components.showcase` is a route, the same on either platform. On the web it hangs off `dev.url` as
a URL. On native it hangs off `dev.url` as a deep link, and `verify-ui` opens it on the simulator.
Where `components.showcase` is `null`, the repo has no catalogue route. Check item 1 in the screen
that uses the primitive instead, and skip item 2.

**Where `dev.platform` is `native`, no DOM exists to snapshot.** Take a screenshot of each route and
of each state item 3 drives, and report every one as looked at. Item 3's warning still holds. A
screenshot of a closed sheet proves only that the trigger rendered, so tap the trigger and take a
second screenshot.

1. `components.showcase` — the entry appears in the catalogue, with its specimen rendered.
2. The entry's own route — the sandbox, the variant matrix, the states, the props table and the
   code snippet all render.
3. Drive one interactive control per primitive. A closed overlay stays in the DOM, so a snapshot
   alone proves the trigger rendered and nothing more.
4. Where the catalogue can show a specimen under a second theme, switch it and confirm the specimen
   re-skins while the page's own chrome holds its theme.
5. Run the repo's prose and file-shape checks.

## Before handing back

Name the primitive, the registry entry, and any token group that came with it. Note the install in
the pull-request body, per whatever the repo's dependency rule states.
