---
name: test-plan
description: >-
  Writes the checks a build aims at before the build starts: one measurable pass line per
  behaviour the plan promises, kept in the brain's tests folder where the build cannot edit them,
  so the review after the build judges the work against what was decided.
when_to_use: >-
  Use when a build is decided and about to start, and its checks need writing first, or when a
  designer asks for acceptance checks, a test plan or a test card. Trigger phrases "write the test
  plan", "what are the checks", "acceptance checks for this", "test card", "how will we know it
  works". Not for reviewing a finished commit, which `review-build` does, or running the checks
  on a build, which `qa-run` does.
argument-hint: "[the plan, gate or spec to test]"
compatibility: >-
  Writes the test plan into the tests folder inside the plans slot of captain.json
  (references/captain-lookup.md). With plans null or no captain.json, the test plan is printed
  in the chat and saved nowhere, and the review has to be given its text. With plans absent, the
  first write asks once where plans live and offers to set the slot. Reads dev.start, dev.cwd,
  dev.url, dev.platform and checks.test from the host file found through captain.json, falling
  back to .agents/host.json. With dev.start absent the card's start line asks for a literal
  command and the URL to check; with it null the repo has no app to start, and every flow is a
  terminal command. With dev.cwd absent or null the app starts from the repo root. With dev.url
  absent the start line says to read the URL the server prints; with it null the app has no fixed
  address, so on the web the start line names the URL to check, and on native every screen is
  reached by taps from launch. With dev.platform absent the survey reads it off the repo, a
  browser app or a simulator one, and the card names it; with it null nothing can look at the
  app, so every screen check goes under out_of_scope. With checks.test absent the survey reads the
  repo's own test folders; with it null the repo has no test runner, and the card says so under
  out_of_scope.
metadata:
  suite: captain-phil
  hand: reviewer
  host: [dev.start, dev.cwd, dev.url, dev.platform, checks.test]
  captain: [plans, products]
---

# Test plan

This skill writes the checks before anything is built, so the build aims at them and the review judges against them. It builds nothing and reviews nothing. The checks come from what was decided, the stack comes from the repo, and the file lands where the build cannot change it.

The short version: find the tests folder, read the plan, survey the repo's test stack, write one flow per promised behaviour with a measurable pass line, read it back as the builder, then save it after a yes.

## Hard rules

- **Test what was decided, not what you would have built.** Every flow traces to a line in the plan, the gate or the spec. Where the source is unclear or contradicts itself, ask the designer, and fill no gap with your own view of the feature.
- **Every pass line is measurable:** text visible, a request made, a status code, an exit code, a count, a number under a limit. "Works well" and "feels fast" are not checks.
- **The test plan lives in the brain, never on the build's branch.** A change cannot edit its own checks. A spec file the repo needs lands on the base branch in its own reviewed change, before the build starts.
- **A source missing what a field needs gets bounced, not guessed at.** Name the missing field and ask for it.
- **Write only into the brain,** after a yes, and never into the product repo. Into the tests folder, only the move in step 6.
- **Build nothing and run nothing that changes the repo.** The survey reads.

## Steps

### 1. Find the tests folder

Resolve the `plans` slot through `references/captain-lookup.md`. The reviewer's files sit in its `tests/` subfolder: one test plan per build, and the misses checklist `review-build` keeps.

| What the lookup finds | What to do |
|---|---|
| A path, with `tests/` inside it | List its test plans, so a second plan for the same build is caught early, and go to step 2 |
| A path, with no `tests/` yet | Note it. Step 6 offers to create the folder |
| `null` | Say in one line that the test plan prints in the chat and is saved nowhere |
| Absent | Note it. Step 6 asks where plans live, as the lookup's "Record into a `captain.json` slot" says |
| No brain | Say in one line that the test plan cannot be saved without a `captain.json`, and that it prints in the chat |

None of these stops the skill. A printed test plan still gives the build a target.

### 2. Read what was decided

Read the source the designer names: a plan in the plans folder, one `## Gate <id>` section of it, or a spec. Where they name none, take the most recent plan and say which one in one line. List every behaviour it promises, each with the line that promises it. Where a behaviour has no line, it is not in this test plan.

### 3. Survey the test stack

Resolve the product through steps 2 to 4 of `references/captain-lookup.md`, then read before writing a single step:

- **The test runner:** `checks.test`, then the repo's own test folders, fixtures and config files.
- **The handles the flows can grab:** test ids (`git grep -n data-testid`), routes and labels the plan names.
- **How the app starts:** `dev.start`, `dev.cwd`, `dev.url` and `dev.platform`.

A test plan written without this survey guesses at the stack, and the guesses turn into flows nobody can run.

### 4. Write the flows

Write the card in the shape `references/test-card.md` gives: build, workdir, start, tier, flows, out of scope, and a budget for an explore tier.

1. Write one flow per behaviour from step 2, with its steps in order and one `pass:` line.
2. Add one flow for the obvious way it fails, such as bad input, an empty state or no network, where the source covers that case.
3. List what is out of scope in plain words, so "didn't test" in the report is honest.

### 5. Read it as the builder

Read each `pass:` line alone, as the person building would. Could they tell from that line whether they are done? Rewrite every line where they could not. Then check each flow traces to step 2's list, and cut any that does not.

### 6. Save it

Show the designer the card, and ask once whether to save it.

1. Where step 1 noted a missing folder or an absent slot, make that offer first, once.
2. After a yes, write the card beside the tests folder as `<plans>/<YYYY-MM-DD>-<topic>.md.draft`, with today's date and a short topic from the source.
3. Move it in once with `mv` to `<plans>/tests/<YYYY-MM-DD>-<topic>.md`.
4. Where Claude Code refuses the move, the reviewer's permission rule is on, and it binds this session too. Print the `mv` command with both absolute paths for the designer to run in their own terminal, and wait for them to say it is done.
5. Delete the draft where the designer says no.
6. Read the file back from disk before reporting where it is, and check the draft is gone.

### 7. Close

Tell the designer the file's path, the flow count and the tier, and that the build aims at these checks. Where the move in step 6 went through, say in one line that the build can still edit the test plan, and that `review-build` sets up the permission rule on its first run.

## When you need

| You need | Read |
|---|---|
| Where the brain is, the `plans` slot's states, the product's entry and its host file | `references/captain-lookup.md` |
| The card's fields, what makes a pass line measurable, a flow with no browser, and the bounce message | `references/test-card.md` |
| The review that judges the build against this card | the `review-build` skill |
| The run that tests a build against this card | the `qa-run` skill |
