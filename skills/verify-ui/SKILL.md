---
name: verify-ui
description: >-
  Prove a UI change rendered — look with the repo's browser tool or the simulator, assert with a
  probe, control the probe before trusting its numbers, and report what was measured alongside
  what was not.
when_to_use: >-
  Use when a screen has to be confirmed rendered rather than assumed, when a number is going
  into a pull-request body or a gate write-up, or when a measured value comes back too clean to
  be true. Trigger phrases "verify this rendered", "check it in the browser", "measure the
  contrast", "prove this works", "the probe looks wrong".
compatibility: >-
  Reads dev.start, dev.cwd, dev.url, dev.platform, verify.mcp, verify.probes, verify.doc,
  verify.agent and checks.typecheck from .agents/host.json. With dev.platform native the
  simulator does the looking, dev.url is the app's deep-link base, and every value is looked at
  rather than measured. With dev.url absent on native the scheme is read from the app's config;
  with it null the app takes no deep links, so every route is reached by taps from launch. With
  verify.mcp null on the web nothing can drive the app, so the change is reported as unverified
  rather than inferred from the diff.
  With verify.probes null no number can be asserted and every value is reported as looked at
  rather than measured. Without verify.doc, the rules in references/measuring.md apply.
metadata:
  suite: captain-phil
  host: [dev.start, dev.cwd, dev.url, dev.platform, verify.mcp, verify.probes, verify.doc, verify.agent, checks.typecheck]
---

# Verify a UI change

The short version: start the app, look with `verify.mcp` or the simulator, assert with a probe
from `verify.probes`, control the probe before believing a sweep, and say what you left
unmeasured.

`references/measuring.md` holds the payload — the two tiers, the exit codes, the measuring
mechanisms and the constants that masquerade as measurements. The file named by `verify.doc`
overrides it wherever the repo states its own, because that file carries the traps this repo has
already paid for. This skill is the order the work happens in.

**One word decides how much this skill can claim.** Looking proves a screen rendered. Measuring
proves a number. A write-up that calls the first one the second is the failure the whole procedure
exists to prevent.

## 1. Start the app

1. Run `dev.start` from `dev.cwd`. Where the slot is `null`, the repo has no runnable app: say so
   in one line and stop, because nothing here can be verified by looking.
2. Read the URL the server prints, rather than trusting `dev.url`. A dev server walks up from its
   default port whenever another process holds it, so the printed URL is the one that answers and
   the slot is the expectation. On native, keep `dev.url`. A bundler such as Metro prints the
   address its own client connects to, and that address is no deep-link base.
3. Where `dev.start` is absent, ask once for the command, and offer to record it in
   `.agents/host.json`.
4. Where `dev.platform` is `native`, boot a simulator before starting, and read `dev.url` as the
   app's deep-link base, such as `myapp://`. Where that slot is absent, read the URL scheme from the
   app's own config, and offer to record it. Where it is `null`, the app takes no deep links: say so
   in one line, and reach every route by tapping from launch.

## 2. Look

Ask the looking questions: does the route render, did the dialog open, is the content clipped.
Which tool asks them depends on `dev.platform`, so read it before `verify.mcp`.

**Where `dev.platform` is `native`, the simulator does the looking,** so a `null` `verify.mcp`
does not stop the check. There is no accessibility tree to snapshot, so the screenshot is the evidence.

1. Open the route by deep link: `xcrun simctl openurl booted <dev.url><route>`. A route no link
   reaches is opened by tapping from the nearest one that does, and with `dev.url` `null` every
   route is tapped to from launch. Write each tap down.
2. Keep screenshots in the project root's `.context/` folder, out of the working tree. Run
   `mkdir -p .context`, then `git check-ignore -q .context/<screen>.png`. Exit 1 means the folder
   is not ignored: add `.context/` to `.gitignore` before writing anything.
3. Wait for the screen to settle, then take the screenshot:
   `xcrun simctl io booted screenshot .context/<screen>.png`. A capture taken during a launch or a
   transition shows colours that look right and are not, so check one pixel you know the value of
   before reading the rest.
4. Read the screenshot, and keep its path. The deep link, the taps and that path stand in for the
   URL wherever a later step asks for one.
5. Report every value as looked at, never measured. A pixel read off a simulator screenshot is a
   reading of a screenshot.

**Where `dev.platform` is `web`:** point `verify.mcp` at the URL.

- Take the text snapshot rather than a screenshot. An image costs tokens, so spend one on a
  specific layout concern you can name.
- Where `verify.mcp` is `null`, nothing can drive the app. Report the change as unverified and
  name the diff as the only evidence. Never infer a rendered result from source.

## 3. Reach for a probe the moment a number gets asserted

Use a probe from `verify.probes` wherever the value lands somewhere a reader acts on it unchecked —
a pull-request body, a gate write-up, a verification table. `references/measuring.md` § Two tiers
states which tier answers which question.

**Where `dev.platform` is `native`, no probe runs.** The probes measure a DOM, and a simulator has
none, so steps 3 and 4 are skipped. Say so in one line, and report every value as looked at.

**Where `verify.probes` is `null`, no number can be asserted.** Say which values went unmeasured,
and report what you looked at as what it is. A scratch probe written for one run is legal where the
repo keeps none, and it owes the same control as a permanent one.

**Exit 3 means the harness is lying, which is a different finding from the app having a bug.** On a
3 the number does not exist: fix the control and run again.

Where `verify.agent` names a sub-agent, hand one route's measurement to it and read its return.
Where the slot is absent on the web, offer to copy `assets/ui-prober.agent.md` into the repo's agent
folder with its slots filled in, rather than driving every route from this session. Make no offer on
native, because that agent drives a browser.

## 4. Control the probe before trusting the sweep

1. Feed the probe one value whose answer you already know.
2. Run it under its control flag, confirm it exits 3, then confirm a normal run does not.
3. Discard any run whose control failed to fail, however confident the output reads. A control
   nobody has watched break is returning a plausible constant.
4. Read the measured count before reading the values. A walk that reports 8 of 180 elements
   measured the shell of a route rather than its content.
5. Check a suspiciously round result against `references/measuring.md` § When a number looks too
   clean before reporting it.

## 5. Measure the running app honestly

This section is about the DOM, so it does not apply where `dev.platform` is `native`. There, the
screenshot from step 2 is the only evidence.

The mechanism behind each of these is in `references/measuring.md` § Measuring the rendered DOM,
along with the traps this list does not name.

- Poll for the state you are asserting on, rather than sleeping and reading.
- Assert on something identity-revealing. A closing overlay is still in the DOM, listing the
  previous trigger's contents.
- Drive controls with trusted input only. A scripted `element.click()` is not a click on an overlay
  primitive, and a scroll lock or a focus trap cannot be tested from page JS at all.
- Scroll a control into view, re-read its box, then click. Trusted-input coordinates are viewport
  coordinates, so a dispatch aimed past the fold lands on whatever sits there and raises no error.
- Match structurally rather than by text, and scope to the container before matching at all.
- Read a rendered colour off a pixel rather than parsing the computed string, which the browser
  serialises in the authored colour space.
- Do the interaction and the assertion inside one page lifetime. An automation layer that reloads
  between tool calls makes a choice that persisted look exactly like one that failed.
- Screenshot before a sweep that changes shared state, and check whether any control you drive
  writes to disk.
- Read the console on every route you drive. A render warning survives five widths, both actions
  driven, and a byte-for-byte diff.

## 6. Typecheck against the baseline

Run `checks.typecheck` and compare the result to the baseline recorded beside it. A count matching
the baseline is a pass; a count under it is a pass that lowers the baseline in the same commit.

**Read the command as the repo wrote it.** A typecheck invoked with the wrong flag can resolve zero
input files and exit 0 however broken the code is, which is the one failure mode that reads as a
clean run.

## Before handing back

Say what you measured and what you did not. Measurement covers objective correctness, and whether
the screen looks right is the designer's call.
