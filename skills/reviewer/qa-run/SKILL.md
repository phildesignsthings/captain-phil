---
name: qa-run
description: >-
  Runs a test plan's flows against a running build and reports pass or fail for each, with the
  evidence behind every result. It starts the app from the host file, runs the smoke or explore
  tier the plan names, hands the proof that a screen rendered to verify-ui, and stops every
  server it started, pass or fail.
when_to_use: >-
  Use when a build needs its test plan run, when a review's test plan names a tier, or when a
  designer asks for a smoke run or an exploratory pass on a branch. Trigger phrases "run QA",
  "run the test plan", "smoke test this", "explore this build", "does it pass the checks". Not for
  writing the checks, which `test-plan` does, reading the diff, which `review-build` does, or
  proving one screen rendered, which `verify-ui` does on its own.
argument-hint: "[test plan path, or the build to run]"
compatibility: >-
  Reads the test plan from the tests folder inside the plans slot of captain.json
  (references/captain-lookup.md), and saves the evidence beside it. With plans null or no
  captain.json, it asks for the test plan's text and saves the evidence in a scratch folder
  outside the repo, named in the report. With plans absent, it asks once where the test plan is.
  Reads dev.start, dev.cwd, dev.url, dev.platform and checks.test from the host file found
  through captain.json, falling back to .agents/host.json. With dev.start absent the plan's
  literal start command is used, and asked for where the plan has none; with it null the repo has
  no app to start, and only terminal flows run. With dev.cwd absent or null the app starts from the
  worktree's root. With dev.url absent the URL the server prints is used; with it null the app has
  no fixed address, so on the web the plan's URL is used, and on native every screen is reached by
  taps from launch. With dev.platform absent it is read off the plan's start line and the repo, a
  browser app or a simulator one, and the report names it; with it null nothing can look at the
  app, so every screen flow is reported under Didn't test. With checks.test absent or null, every
  scripted flow is run from the plan's own steps.
metadata:
  suite: captain-phil
  hand: reviewer
  host: [dev.start, dev.cwd, dev.url, dev.platform, checks.test]
  captain: [plans, products]
---

# QA run

This skill runs a test plan's flows against a running build and says which passed, with the evidence for each. It changes no code and no test. What it starts, it stops.

The short version: read the test plan, make a worktree at the build, start the app, run the tier, prove each assertion written for this run can fail, hand rendering proof to `verify-ui`, report each flow, and clean up.

## Hard rules

- **Never edit a test to make it pass,** never filter out a rule, and never loosen an assertion. Report the failure, and propose the fix to the designer.
- **Prove each assertion you wrote can fail** before trusting it: run it once against a state where it must fail.
- **Explore never returns a pass.** Every explore finding is unconfirmed until a scripted flow reproduces it.
- **Run in a worktree at the build, never the main checkout,** and change nothing in it. Use no credentials the plan does not name.
- **Clean up every time, pass or fail:** stop every server you started, check its port is free, and remove the worktree. Leave the evidence.
- **Report what was measured, and nothing more.** A flow that did not run is not a pass.

## Steps

### 1. Read the test plan

Resolve the `plans` slot and the product through `references/captain-lookup.md`, and read the test plan the designer names, or the one whose `build` matches. Check its fields against the table. A field missing or unfillable bounces the plan: name it, and stop.

| Field | What the run uses it for |
|---|---|
| `build` | The commit the worktree checks out. Record its SHA |
| `workdir` | Where the worktree goes, outside the main checkout |
| `start` | How the app starts: the host file's `dev.*` slots, or a literal command and its URL |
| `tier` | `smoke` or `explore`, from `references/qa-tiers.md` |
| `flows` | What to run, each with a `pass:` line |
| `out_of_scope` | What the report lists under Didn't test |
| `budget` | Where an explore run stops |

### 2. Make the worktree

Run `git fetch`, then `git worktree add --detach <workdir> <sha>`. Install the dependencies the repo's lockfile names, in the worktree. Keep the evidence folder outside the worktree, in `<plans>/runs/<test plan name>/<short sha>/`, written by the commands that produce it.

### 3. Start the app

1. Resolve `dev.start`, `dev.cwd`, `dev.url` and `dev.platform` through the lookup, or take the plan's literal command.
2. Start it in the background from the worktree, with its output going to a log in the evidence folder, and record the process id.
3. Read the URL the server prints, rather than trusting `dev.url`, and check it answers before the first flow.
4. Where `dev.start` is `null`, the repo has no app: say so in one line, and run only the terminal flows.

### 4. Run the tier

Run every flow, in the plan's order, as `references/qa-tiers.md` sets out for the tier. For each flow:

1. Run its steps, and check its `pass:` line.
2. Save the evidence: the command's output and exit code, a screenshot, or a trace for a failure.
3. Where the flow is an assertion written for this run, prove it can fail, as `references/qa-tiers.md` § Prove it can fail says.

Where a pass line asks whether a screen rendered or a value measures right, run `verify-ui` for that route and keep its report as the flow's evidence. Do not restate its rules here.

### 5. Report

Report on each flow and close with the three lines:

```
QA run of <sha> against <test plan path>, tier <tier>.

- <flow name>: pass | fail | did not run. <evidence path>. <repro, for a fail>.

Measured: <what ran, with exit codes, counts and numbers>.
Only looked at: <what was seen without a measurement, and every unconfirmed explore finding>.
Didn't test: <out_of_scope, plus anything skipped, and why>.
```

### 6. Clean up

1. Stop each server you started, by the process id you recorded, never by name or by port.
2. Check its port is free (`lsof -iTCP:<port> -sTCP:LISTEN` prints nothing).
3. Remove the worktree (`git worktree remove <workdir>`).
4. Say in one line what was stopped and that the port is free, and name the evidence folder.

## When you need

| You need | Read |
|---|---|
| Where the brain is, the `plans` slot's states, the product's entry and its host file | `references/captain-lookup.md` |
| What each tier runs, how to prove an assertion can fail, and when an explore stops | `references/qa-tiers.md` |
| The traps that make a run lie: paths, temp folders, stale bundles, caches, hit targets | `references/run-pitfalls.md` |
| Proving a screen rendered, or measuring a value on it | the `verify-ui` skill |
| The test plan's fields in full | the `test-plan` skill |
