---
name: review-build
description: >-
  Reviews one finished commit against the test plan written before it, through a fresh-context
  reviewer agent that reads the diff cold, and reports each finding tagged important, nit or
  pre-existing with its file and line. It stays read-only on the repo, and on its first run it
  sets up the permission rule that keeps the build from editing the reviewer's files.
when_to_use: >-
  Use when a build has a commit or a pull request ready for review, when a designer asks for a
  code review against the checks, or when a later round of fixes needs reviewing again. Trigger
  phrases "review this", "review the PR", "review the build", "check this commit against the
  plan", "round 2". Not for writing the checks, which `test-plan` does, or for running a build's
  flows, which `qa-run` does.
argument-hint: "[commit, branch or pull request]"
compatibility: >-
  Reads the test plan and the misses checklist from the tests folder inside the plans slot of
  captain.json (references/captain-lookup.md). With plans null or no captain.json, the review asks
  for the test plan's text, keeps no checklist and saves no report, and the permission rule is not
  offered. With plans absent, it asks once where the test plan is. Reads git.trunk, checks.test,
  checks.typecheck and checks.lint from the host file found through captain.json, falling back to
  .agents/host.json. With git.trunk absent the base is the pull request's base, or the remote's
  default branch; with it null the review asks for the base. A null or absent check is not run,
  and the report names it under Didn't test.
metadata:
  suite: captain-phil
  hand: reviewer
  host: [git.trunk, checks.test, checks.typecheck, checks.lint]
  captain: [plans, products]
---

# Review a build

This skill reviews one commit against the checks that were written before it. A fresh reviewer agent reads the diff cold, this session checks every finding it returns, and the designer gets a report they can act on. Nothing in the repo changes.

The short version: pin the commit, make a fresh worktree at it, read the rules from outside the change, hand the diff to the reviewer agent, check each finding, report it, and clean up.

## Hard rules

- **Review a commit, not a branch.** Record the SHA at the top of the report. Where a commit lands while you work, finish on the one you pinned and say so. A pass on an older commit does not count for a newer one.
- **The rules come from outside the change.** The test plan and the checklist come from the brain, and any spec or test used for acceptance comes from the base branch (`git show origin/<base>:<path>`). A change that edits a check judging it is an important finding by itself.
- **Read-only.** Never push, commit, merge, approve, or comment on the pull request. The designer posts what they choose to.
- **Never review in the main checkout.** Use a fresh worktree at the pinned commit, or read through git objects.
- **Every finding has a severity and a place:** `important`, `nit` or `pre-existing`, with file and line, plus the command or the steps that show it. No place, no finding.
- **Three rounds, then the designer.** Where the same check fails a third time, stop and hand it to them. There is no fourth round.
- **Never write "looks good".** A clean review says what it checked.

## Steps

### 1. Find the reviewer's files

Resolve the `plans` slot and the product through `references/captain-lookup.md`. The test plan and the checklist sit in `<plans>/tests/`, which the permission rule protects. Reports go in `<plans>/reviews/`, outside it, because a report judges nothing. Take the test plan the designer names, or the one whose `build` matches the commit. Where none matches, ask once for its path, and offer `test-plan` where there is none.

### 2. Set up the permission rule, on the first run

Fill in `assets/reviewer-permissions.json` as `references/permission-rule.md` says, and read `~/.claude/settings.json`. Where its `permissions.deny` holds all three filled rules, go to step 3. Each product repo installs its own `review-build` folder, so the first run from a second repo finds that one rule missing and adds it alone.

Where any rule is missing, follow `references/permission-rule.md`:

1. Where `~/.claude/agents/reviewer.md` is missing or differs from `assets/reviewer.agent.md` (`cmp -s`), offer to install the agent first, while the copy can still go through.
2. Show the designer the missing rules, and merge them in after a yes. A no is final for the session: say in one line that the build can edit the reviewer's files, and carry on.

### 3. Pin the commit and the round

1. Resolve what the designer named to one SHA (`git rev-parse <ref>`). For a pull request, read its head and its base.
2. Resolve the base: the pull request's base, then `git.trunk`, then the remote's default branch. Run `git fetch` first, and diff against `origin/<base>`, never a local branch that can lag.
3. Count the round from the reports in `<plans>/reviews/` for this test plan. Where there is nowhere to save reports, ask the designer which round this is. A fourth round stops here, under the three-rounds rule.
4. Make a fresh worktree at the SHA: `git worktree add --detach <scratch folder>/review-<short sha> <sha>`, in a scratch folder outside the repo.

### 4. Read the rules from outside the change

1. Where the brain is a git repo, run `git -C <brain> status --short -- <plans>/tests`. A modified file there is a finding against the run, reported first. An untracked one means nobody has committed it yet: say so in one line, and offer to commit it in the brain, so the next round can check it.
2. Read the test plan and the checklist from the brain.
3. List the changed files (`git diff --name-only origin/<base>...<sha>`). Mark each one that judges the change: a test, a check's config, the spec, a baseline.
4. Keep the checklist items whose trigger matches the diff, and only those.

### 5. Hand the diff to the reviewer agent

Dispatch the `reviewer` agent with the SHA, the worktree path, the base, the test plan's path and the triggered checklist items. Where no `reviewer` agent is installed, or the installed one differs from `assets/reviewer.agent.md` after a suite update, offer to install it at `~/.claude/agents/reviewer.md`, never into the product repo. The rule covers that file, so follow `references/permission-rule.md` § The reviewer's own writes: try the copy once, and where it is refused, print it for the designer to run. Until the agent is installed, give a fresh general-purpose subagent that file's body as its brief.

Where the diff spans several areas, such as data, layout and tests, dispatch one reviewer per area in parallel, each told which area is theirs.

### 6. Check every finding

The agent's return is a draft. For each finding:

1. Open the place it names, in the worktree, and run its repro.
2. Keep it as confirmed where the repro shows it. Move it to Only looked at as a hunch where you cannot make it show.
3. Drop it where the place does not exist.
4. Check the severity against `references/review-report.md` § Severity, and move it where it is wrong.

Where the test plan names a tier, run `qa-run` on the pinned SHA, and fold its flow results into the report.

### 7. Report and clean up

1. Write the report in the shape `references/review-report.md` gives, and show it to the designer.
2. Save it as `<plans>/reviews/<test plan name>-r<round>.md`.
3. Remove the worktree (`git worktree remove <path>`), and delete any copy of the source a reviewer made inside the repo.
4. Where a miss turns up, follow `references/review-report.md` § Misses become rules.

## When you need

| You need | Read |
|---|---|
| Where the brain is, the `plans` slot's states, the product's entry and its host file | `references/captain-lookup.md` |
| Filling in the permission rule, merging it, and what it does not cover | `references/permission-rule.md` |
| The report's shape, the severity tags, rounds, and when a miss becomes a checklist item | `references/review-report.md` |
| The reviewer agent's brief | `assets/reviewer.agent.md` |
| The permission rule template | `assets/reviewer-permissions.json` |
| The misses checklist's starting file | `assets/checklist.template.md` |
| Running the test plan's flows on the build | the `qa-run` skill |
