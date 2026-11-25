---
house_style: true
read_when:
  - "`review-build` is about to write its report"
  - "A finding needs a severity tag, or its tag looks wrong"
  - "A round has to be counted, or a third round has failed"
  - "Something the review missed has turned up, and might become a checklist item"
---

# The review report

The report is the only part of a review the designer reads, so it carries the commit, the findings and an honest account of what was and was not checked. It is plain and flat, and it never says "looks good".

## The shape

```
Reviewed <sha> (<repo>#<pull request>), round <n> of 3.

important
- <what is wrong, and who it hits>. <file>:<line>. Repro: <command or steps>.
nit
- <what is wrong>. <file>:<line>.
pre-existing
- <what is wrong>. <file>:<line>. On <base> already.

Measured: <what ran, with its numbers and exit codes>.
Only looked at: <what was read or eyeballed without a measurement, and every hunch>.
Didn't test: <what was out of scope or skipped, and why>.

VERDICT: PASS
```

- **Leave out an empty severity group.** The three closing lines are always there.
- **The verdict is `PASS` where there is no important finding,** and `FAIL` where there is at least one.
- **Where a commit landed during the review,** add one line after the first: "Reviewed the commit pinned at the start. `<sha>` landed after it, and needs its own review."
- **Name the flow** a finding breaks, from the test plan, where it breaks one.

## Severity

| Tag | It means | Examples |
|---|---|---|
| `important` | The change does something wrong, or fails a check | A flow's pass line fails. Data is lost or exposed. A secret is committed. The change edits a test, a check or a baseline that judges it. A behaviour the test plan promises is missing. A file outside the plan's scope changed |
| `nit` | The change works, and could read better | A name, a small duplication, a comment that restates the code. Never blocking |
| `pre-existing` | The problem is on the base already | Reported so it is not lost, and never held against the change |

A tag is about the change, not about how strongly you feel. Where you cannot say which flow or rule an important finding breaks, it is a nit.

## A place and a repro

Every finding names a file and a line in the pinned commit, and either a command that shows it or the steps to see it. A finding the reviewer agent returned without one is checked by this session; where no place turns up, it is dropped. A finding with a place and no repro you can make show is a hunch, and goes under Only looked at, not in a severity group.

Commit messages and trailers are outside `git diff`. Where a checklist item is about names, secrets or wording, read `git log --format=%B origin/<base>..<sha>` as well.

## Rounds

- **A round is one review of one pinned commit.** Its report is saved as `<plans>/reviews/<test plan name>-r<n>.md`, so the next round counts from disk. Where there is nowhere to save it, ask the designer which round this is.
- **A later round starts from the last one.** Read the previous report, check each of its findings against this round's commit first, and say which are fixed. Then read the part of the diff that changed since the previous round's commit (`git diff <previous sha> <sha>`).
- **Three rounds, then the designer.** Where the same check fails a third time, the report ends with that check, its three results, and one line handing it to the designer. There is no fourth round.

## Misses become rules

A miss is a problem the review did not find, which turned up later in a revert, a bug report or the designer's own read.

1. Add a miss to the checklist only where it showed up in two or more reviews, and where a diff can show it. A miss no diff can show belongs in the test plan, as a flow.
2. Give each item a trigger, a path or a pattern in the diff, so the review runs it only where it applies.
3. Write the checklist from `assets/checklist.template.md` where none exists yet. Save every change to it as a draft beside the tests folder, `<plans>/checklist.md.draft`, and move it in once with `mv`. Where Claude Code refuses the move, print the `mv` command with both absolute paths for the designer to run in their own terminal, as `references/permission-rule.md` § The reviewer's own writes says.
4. List the checklist items that fired in each report, under Measured, so the reports in `<plans>/reviews/` hold each item's history and the checklist changes only when an item is added or dropped.
5. Prune the list when you add an item: drop each item no report in the last two months names, and say which items went in the report.
