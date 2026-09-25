---
name: receive-prototype
description: >-
  Take a prototype folder out of a design repo and into a real application — run it where it was
  built, read its two records, keep the parts that carry a contract, point the data seam at a real
  endpoint, strip the demo machinery by its markers, and prove the states still render.
when_to_use: >-
  Use when a developer has been handed a prototype folder or a design repo's branch, when a
  prototype graduates into the production codebase, or when the demo-only machinery has to come
  out. Trigger phrases "I have been handed this prototype", "productionize this", "strip the demo
  harness", "wire this to the real API", "what do I keep from this folder".
argument-hint: "[path to the source checkout]"
compatibility: >-
  Takes $1 as the path to the source checkout and reads THAT repo's .agents/host.json for dev.cwd,
  dev.start, dev.url, dev.platform, surfaces.root, surfaces.route, surfaces.seam, surfaces.harnessMarkers,
  surfaces.receiveDoc and records.design; checks.typecheck is read from the receiving repo's own
  host file. With no $1 the folder arrived on its own, so step 1 is skipped and the reading is done
  from the files. With no host file in the source, every path is found by grep and proposed before
  anything is deleted. With surfaces.receiveDoc absent the keep-and-discard list is
  references/what-survives.md. With surfaces.harnessMarkers empty nothing is marked, so the demo
  machinery is identified by reading and named before it is cut. With surfaces.seam null the source
  fetched at the call site, so step 4 edits each call rather than one file. With dev.platform
  native, dev.url is a deep-link base, and each screen is opened on a simulator rather than in a
  browser.
metadata:
  suite: captain-phil
  host: [dev.cwd, dev.start, dev.url, dev.platform, surfaces.root, surfaces.route, surfaces.seam, surfaces.harnessMarkers, surfaces.receiveDoc, records.design, checks.typecheck]
---

# Receive a prototype

The short version: run it where it was built, read its records, keep the schemas and the hook
shapes, swap the fixture loader for a real request, and delete the demo machinery by its markers.

`$1` is the path to the source checkout. Read its `.agents/host.json` first, because every path in
this procedure is a slot in that file rather than a convention this skill can assume. Where `$1` is
absent, the folder arrived on its own: skip step 1, and find by grep what the host file would have
told you, proposing each deletion before making it.

## 1. Run it where it was built

Run `dev.start` from `dev.cwd` inside the source checkout, and open the folder at `surfaces.route`
under `dev.url`. Drive every screen and every state before reading a line of its code. A prototype's
value is in the decisions you can see, and half of them are invisible in the source.

Where `dev.platform` is `native`, open each screen on a simulator by deep link, the way the
`verify-ui` skill's step 2 does. The taps from where the link lands reach the states no link
does. Take a screenshot of each state, because the receiving repo's build is compared
against those in step 6.

What renders around the screens — the frame, the palette, the theme switcher — is the source repo's
own harness rather than part of the work. Step 5 is what takes it off.

## 2. Read the folder's records first

1. Read the developer's record for what the thing is, what is real, what is faked, and the decisions
   already taken. It exists so a deliberate choice does not get reviewed as an accident.
2. Read the design record — the entry in `records.design` whose surface is this folder — for the
   system the built screens landed: colour, type, layout, depth, components, and what not to do.
3. Skip the agent brief. It is instructions for a tool rather than for you.
4. Read `surfaces.root`'s structure document once. The folder is a small application with its
   imports running one direction, and moving a file across that direction is how the folder stops
   compiling.

## 3. Decide what to keep

`surfaces.receiveDoc` is the source repo's own list of what survives and what does not. Where that
slot is absent, `references/what-survives.md` is the list. Read the whole of it before moving a
file.

The short form: the schemas and the hooks' return shape carry contracts, the designed loading, empty
and error states carry intent, and the source repo's own tooling carries neither.

**The folder's imports are the list of what the receiving application owes.** A prototype leans on
a schema library, a fetching library, a set of primitives and a set of fonts, and none of them come
with the folder. Read every import the folder makes, install what is missing before moving a file,
and check each primitive it composes exists on this side. A missing one fails as a blank screen
rather than as a missing dependency, which costs an afternoon of reading the wrong file.

**The look is a theme, and the folder names which one.** It is one file of values rather than a
style hunted out of components, so port the file and give the receiving application whatever
compiles those values into its own utilities.

## 4. Make the data real

1. Replace the call inside each hook's fetching function. `surfaces.seam` is the one file that loads
   a fixture in the source repo and becomes a real request in the application. Where that slot is
   `null` the source fetched at each call site, so the edit is per hook.
2. **Leave the schema parse on the far side of that call where it is.** It is the runtime contract
   you diff the real response against, and deleting it turns a contract drift into a blank cell.
3. Re-tune the fetching library's defaults. A prototype disables retries and never marks data stale,
   which are demo values rather than production ones.

## 5. Strip the demo machinery

`surfaces.harnessMarkers` lists the strings the source repo marks its demo-only machinery with. They
exist so the receiving developer finds every line by grep rather than by memory. A marker is used
two ways and the position tells you which:

- **In a file's opening comment**, the whole file is demo-only. Delete the file.
- **On a line inside a file that is not**, that line alone is the wiring. Delete the line and nothing
  else in the file.

```bash
grep -rn "<marker>" <source>    # every hit, once per marker
```

1. Delete every file whose marker sits in its header.
2. Delete the marked lines elsewhere, and nothing around them.
3. Swap the prototype's wrapped data hook for the fetching library's own, dropping whatever fields
   existed only to name a state for the palette.
4. Inline the default wherever a screen read a scenario switch. The default is the first option,
   which is what a visitor who touched neither switch saw.

**Where `surfaces.harnessMarkers` is empty, nothing is marked.** Identify the demo machinery by
reading, list it, and get the list agreed before deleting anything: an unmarked helper that looks
demo-only is sometimes the only thing arranging the fixture a screen still needs.

## 6. Verify

1. Confirm each screen renders against the real endpoint, including its loading, empty and error
   states. All four were designed, and three of them are invisible unless you force them. On
   native, open each one by the same deep link and taps as step 1, and set its screenshot beside
   the one step 1 took.
2. Confirm a grep for every marker returns nothing.
3. Run `checks.typecheck` in the receiving repo. A deleted seam that a screen still imports fails
   there and nowhere else.

## Before handing back

Name the entities pointed at a real endpoint and the ones still on fixtures. A half-migrated folder
looks identical to a finished one on screen, which is the one failure this whole procedure
exists to make visible.
