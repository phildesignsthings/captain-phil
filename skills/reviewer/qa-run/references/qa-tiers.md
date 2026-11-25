---
house_style: true
read_when:
  - "`qa-run` is about to run a smoke or an explore tier"
  - "An assertion written for this run has to be proved able to fail"
  - "An explore run found something, and it has to be confirmed"
---

# The tiers

A test plan names one tier. Smoke checks the flows with scripts and can pass. Explore looks for problems inside a budget and can never pass.

## Smoke

Smoke is scripted, repeatable and quick enough to run on every change.

- **Run the repo's own runner first.** Where `checks.test` names a command, run it from its `cwd`, and compare its count with its `baseline`. Fewer passing tests than the baseline is a fail.
- **Script each flow the runner does not cover.** A browser flow is a short script with the repo's end-to-end tool, such as Playwright, and an accessibility pass where the plan asks for one. A terminal flow is the command in its steps, with its exit code and output saved.
- **Assert on text and state, never on a screenshot diff.** Two machines render fonts differently, so a pixel diff fails on a change nobody made.
- **Save a trace for every failure,** and the command that reproduces it.

## Explore

Explore is a person-like walk through the build, looking for what the flows did not think of. It runs only where the plan names it, and it stops at the plan's `budget`.

- **Drive the build the way the designer would,** with the browser tool the repo uses, or the simulator for a native app.
- **Write each finding down as unconfirmed,** with the steps and a screenshot.
- **Confirm a finding by scripting it.** A scripted flow that reproduces it, with a trace, turns it into a fail. One that does not stays under Only looked at.
- **Stop at the budget,** and report what was walked and what was not.

An explore run reports no pass, because not finding a problem is not proof there is none.

## Prove it can fail

An assertion that has never failed can be returning a constant. Before trusting a green result from an assertion written for this run:

1. Pick a state where the pass line must fail: the base commit, the empty state, or a planted break.
2. Plant a break only in a throwaway copy of the worktree, never in the worktree under test, and only after any dev server on that copy is stopped, because a hot reload carries the plant into a running browser.
3. Run the assertion against that state, and confirm it fails.
4. Run it against the build, and confirm it passes.
5. Report both runs under Measured.

A test the repo already had has proved itself on the base. A test written for this run has not.

## When a run is done

A run is done when every flow has a result of pass, fail or did not run, each with its evidence path, and the clean-up in `qa-run` step 6 is finished. A flow with no evidence is did not run, whatever the run looked like.
