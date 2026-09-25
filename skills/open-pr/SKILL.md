---
name: open-pr
description: >-
  Open or update a pull request from the branch you are on — pick the base, run the checks
  against their baselines, fill a reader-facing or a fix template with a measured verification
  table, and push review fixes to the same branch.
when_to_use: >-
  Use when work is finished and ready to raise, when a review comes back, when syncing shared
  work out to another branch, or when catching a release branch up from the trunk. Trigger
  phrases "open a PR", "raise a PR", "ship this", "push this up", "sync this out", "catch main
  up".
compatibility: >-
  Reads git.trunk, git.release, git.engagementBranch, git.doc, checks.typecheck, checks.lint,
  checks.test, issues.ladder, issues.doc, verify.doc and dev.platform from .agents/host.json.
  With dev.platform native, the verification table's rows are looked at off simulator screenshots
  and written in the looked-at row format. Without
  git.trunk, read the repo's default branch from `gh repo view` and say which base you picked.
  With git.release null, the trunk is also the release branch and the § Variants catch-up does
  not run. With issues.ladder null, no rung changes and the status ask is skipped in one line.
metadata:
  suite: captain-phil
  host: [git.trunk, git.release, git.engagementBranch, git.doc, checks.typecheck, checks.lint, checks.test, issues.ladder, issues.doc, verify.doc, dev.platform]
---

# Open a PR

The short version: pick the base from `git.trunk` and the work's kind, run the checks against their
baselines, write the body from `references/pr-templates.md`, and open it with
`gh pr create --base <branch>`.

`references/pr-templates.md` holds both body templates and the rule for picking one. The repo's own
branch table, where it keeps one, is at `git.doc` — read it rather than inferring the convention
from the branch names.

## 1. Pick the base

1. Read `git.doc` where the slot is set, and match the work to one row of its branch table.
2. Take `git.trunk` as the base for anything shared — the design system, the docs, the
   infrastructure, a dependency bump. Where the slot is `null` or absent, read the default branch
   from `gh repo view --json defaultBranchRef` and name the base you picked.
3. Take the engagement's own branch as the base where the work belongs to one engagement and
   `git.engagementBranch` names the convention. That branch is a base in its own right: nothing
   merges it back into the trunk.
4. Confirm the base is live before opening against it: `git log -1 --format=%cr origin/<branch>`.
5. Name a feature branch with a personal prefix or ticket-first, following whatever names the repo
   already carries.

**A PR aimed at `git.release` is the one case to stop and ask about.** Where the slot is set, the
repo separates its trunk from its release branch on purpose, and the catch-up in § Variants is the
only PR that legitimately targets the release branch. Where the slot is `null`, the trunk is the
release branch and this paragraph does not apply.

Where `git.doc` is `null` or absent, the repo writes its branch convention down nowhere: say which
base you picked and why in one line. Offer to record `git.trunk` in `.agents/host.json` where the
slot is absent rather than `null`.

## 2. Run the checks

Run every command in the repo's `checks` block — `checks.typecheck`, `checks.lint`, `checks.test`
and any other leaf it answers. Two rules decide whether a run counts:

- Compare each result against the baseline recorded beside the command. A count matching a
  known-failing baseline is a pass, and a count under it is a check that failed to run.
- Typecheck with a build, rather than an emit-suppressing flag. A flag that skips emit skips the
  cross-project work too, and reports a false pass.

Where the repo answers no `checks` block, run whatever its package manifest defines and say in the
body that the baseline was zero because nobody recorded one.

## 3. Commit and push

1. Confirm you are off the base branch with `git branch --show-current`, and branch first where you
   are on it.
2. Commit the work, and stage nothing the change did not touch.
3. Push the branch with `git push -u origin <branch>`.

## 4. Pick the template and fill it

1. Pick by audience from `references/pr-templates.md` § Picking one, and take the reader-facing
   template wherever the call is close.
2. Run `ask-issue-status` before drafting a reader-facing body, where `issues.ladder` names a file
   and the branch touches a surface declaring issues. It opens with one question, so a PR where
   nothing changed status costs a single click.
3. Skip that ask for a fix body. An internal fix moves no rung.
4. Say so in one line and move on where `issues.ladder` is `null` or absent. The repo tracks status
   somewhere this skill does not write, and `issues.doc` says where.
5. Read every before and after value off the running app or off a check's output, per the repo's
   measuring rules at `verify.doc`. Where that slot is `null` or absent, the `verify-ui` skill's own
   bundled rules apply.
6. Where `dev.platform` is `native`, or no probe ran, write each screen row in the looked-at format
   from `references/pr-templates.md` § The verification table, with the deep link and the taps that
   reach the screen. A check's output is still a measured row.

## 5. Open it, and keep it true

1. Write the body to a file and open the PR:
   `gh pr create --base <base> --title "<title>" --body-file <path>`.
2. Request review, and follow whatever `git.doc` says about who merges. Where it says nothing, ask
   once rather than merging your own.
3. Push review fixes to the **existing PR branch**, never to the base.
4. Update the body wherever the scope moved. A stale body reads as an accurate one.

## Variants

### A sync — shared work out to an engagement branch

Runs where `git.engagementBranch` names a convention. Shared work reaches each such branch through
its own PR, one per branch.

1. Wait for the catch-up where the repo has one, so the work arrives in one reviewed batch rather
   than one PR at a time.
2. Measure divergence both ways: `git rev-list --count origin/<base>..origin/<branch>`, and the
   reverse.
3. Branch off the engagement branch, and base the PR on that same branch.
4. Apply the change without clobbering whatever that branch has deliberately forked — its own
   readme heading, its local docs, its theme.
5. Drive every ported widget through a full open-and-close round trip. A port breaks what a
   typecheck and a screenshot both miss: dead handlers, primitives that throw only on open, a
   trigger rendering a raw value.
6. Write the body from the fix template.

### A catch-up — the trunk out to the release branch

Runs where `git.release` names a branch, and it is the one PR that targets it.

1. Confirm who is allowed to run it. A repo that separates the two branches usually restricts this
   one.
2. Open the PR from `git.trunk` with `--base <git.release>`.
3. Merge it with a **merge commit, never a squash**. A squash rewrites the history the next step
   depends on.
4. Fast-forward the trunk immediately afterwards:
   `git push origin <git.release>:<git.trunk>`. A catch-up is two steps, and this is the one people
   skip — a squash makes the fast-forward impossible, so the branches diverge again the moment the
   catch-up lands.

## Before handing back

Report the PR number and its base branch, and say which checks ran green against their baseline. A
lesson learned on the way belongs wherever the repo files its gotchas, and it reaches other branches
only from the trunk.
