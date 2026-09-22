---
name: wrap-gate
description: >-
  Close out a plan's gate so the designer can review it — run the checks against their recorded
  baselines, verify what changed in the browser, post one clickable URL per screen, update the
  gate-state record, and offer a forked-chat handoff.
when_to_use: >-
  Use when a gate's build work is finished, when a plan step reaches its review pause, or when a
  session has run long enough to hand off. Trigger phrases "wrap the gate", "gate 3 is done",
  "close this gate out", "ready for review", "hand this off to a fresh chat".
argument-hint: "[gate-id]"
compatibility: >-
  Reads checks.typecheck, dev.url and verify.mcp from .agents/host.json. Without a checks block the
  script falls back to the package manifest's own scripts against a baseline of zero and says so;
  without verify.mcp, step 2 cannot run and the gate is reported unverified.
metadata:
  suite: phil-d-skills
  host: [checks.typecheck, dev.url, verify.mcp]
---

# Wrap a gate

A gate is a checkpoint where the designer reviews finished work before the next step starts. A
wrapped gate has three artifacts: a check result against a baseline, one clickable URL per changed
screen, and a state record a fresh chat can read in place of the transcript. Missing any one, the
gate is not wrapped.

## Requirements

- **The browser tool named in `verify.mcp`**, for step 2. Where the slot is absent or the tool is
  not connected, run steps 1, 3 and 4, mark the report heading `Needs a call`, and print: "I could
  not check the screens in a browser because the tool isn't connected. Connect it and say 'wrap the
  gate' again." Never report an unverified gate as done.
- **Bundled skills:** `verify-ui` (step 2), `clean-done` (step 5) and `work-report` (step 7).
- **Node**, for the script in step 1. A project with no `package.json` skips step 1 and the report
  says "No automated checks in this project."

Where `$1` names the gate, use it verbatim in the record's heading and in the report. Where it
is empty, ask which gate is being wrapped before running anything.

## 1. Run the checks

1. Run `node <this skill's dir>/scripts/check-baseline.mjs` from anywhere inside the project. It
   walks up for the repo's answers — `checks.typecheck` and its siblings in the host file first,
   then a legacy baseline file, then the package manifest's own scripts — runs every check in
   parallel, and prints one plain-language line per check. Its output is written for the designer;
   paste it, never restate it.
2. Read exit code 1 as "at least one line needs action". A count under its baseline means the check
   did not run fully, and a line naming missing packages means `npm ci`, then rerun.
3. Run it with `--record` only when the designer has agreed a known failure stays.

## 2. Verify what the gate changed

1. Run the `verify-ui` skill against every route the gate touched.
2. Run a negative test per rule the gate added: break it, confirm the failure and its message, restore
   it, confirm silence.
3. Close with two lists headed **Measured** and **Not measured**, one route per item. Whether it looks
   right is the designer's call.

## 3. Keep the review path open

1. Leave the dev server running. The end of a gate is when the designer clicks through.
2. Note the base URL every screen URL hangs off — `dev.url` where the repo declares one, and the
   port the server actually bound wherever that differs.

## 4. Write the gate-state record

1. Write to a file named `gate-state.md` inside the project root's `.context/` folder, creating the
   folder where it is missing. The folder must be gitignored; add the line where it is not.
2. Fill `assets/gate-state.template.md` and append it under the previous gate's entry. Every heading in
   the template appears, in that order, even where its body is "none".
3. List under **Landed** every path in `git diff --name-only <base>...HEAD`, and mark each one the
   plan did not name with its reason.
4. Write the record before the report, never after.

## 5. Finish clean

Run the `clean-done` skill. Steps 1 and 3 of this skill already cover its checks and its record, so
it adds only the processes this gate started and any status the gate moved.

## 6. Offer the handoff

1. Offer a fresh chat whenever a gate closes in a session that has already wrapped one, or whenever the
   designer asks. Ask before opening it.
2. Fill `assets/handoff.template.md` and hand it over in a fenced block. Every line is a name or a
   path; a summary sentence in it competes with the transcript the fresh chat already has.

## 7. Hand back

Run the `work-report` skill with the code shape. It takes the check lines from step 1 and the
Measured and Not measured lists from step 2 as they stand.
