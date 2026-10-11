# The scorer

The scorer tags severity on a finished list of findings and never learns what number its tags produce. It runs in a fresh context, once per run, with the findings file and `references/criteria.md` and nothing else. The auditor gathers and measures; the scorer weighs; the script counts.

## Turn order

1. Finish the sweep and the withdrawals before summoning it. A list that grows after tagging is tagged twice.
2. Launch one general-purpose agent in the foreground with the prompt below verbatim, the absolute path of `findings.json`, and the absolute path of `references/criteria.md`.
3. Accept its severities as written. Argue one only by naming the row in the severity table the finding fits better, and send that one finding back.
4. Run `scripts/score.mjs` on the file it returns.

## The prompt — send this verbatim, every run

```markdown
You are scoring the severity of design findings. You have two files and nothing else: a findings
file at <findings path> and the criteria file at <criteria path>. You have not seen the surface,
any earlier score, or any target the run is aiming at, and you must not ask for them.

Read the criteria file's § The six criteria and § Severity in full before touching a finding.

Then, for every finding whose status is "open":

1. Read the finding and its evidence. Where the evidence does not support the finding as written,
   set "severity" to null and write why in "scorer_note"; the auditor decides whether to withdraw.
2. Confirm the criterion. Where the finding sits under the wrong criterion, correct the number and
   write the reason in "scorer_note".
3. Tag "severity" with one of "P0", "P1", "P2", "P3", using the severity table and its two
   questions: would a developer build the wrong thing from this board, and would the user be
   stranded. Where the product record leaves the threshold the finding relies on unset, the finding
   belongs to criterion 1 as a gap; move it there and tag it as the gap deserves.
4. Leave every withdrawn finding untouched.

Write the file back in place. Return a table of id, criterion, severity, and one line of reasoning
per finding, and nothing else. Do not total, average, or comment on how the surface scores.
```

## What the scorer never sees

| Withheld | Why |
|---|---|
| Earlier scores and run records | a scorer told the last run scored 2 on a criterion weighs the change rather than the finding |
| The bar | a scorer told the bar is Good tags to reach it |
| The auditor's account of the fix round | "the sweep fixed almost everything" pulls a number up |
| The screenshots and the boards | a scorer that re-reads the surface re-audits it, and the list it tags stops being the list the auditor measured |
| The mapping table's effect on this list | a scorer that knows three P2 drop a criterion to 2 tags the third one P3 |

## Stop conditions

| Condition | What you do |
|---|---|
| The scorer returns a severity on a withdrawn finding | discard that tag; the finding is closed |
| The scorer returns null on a finding you believe | measure again; a finding the evidence does not carry is a suspicion |
| The scorer re-assigns a criterion and you disagree | re-read the criterion's standard; the criteria file wins over both of you |
| The list changes after tagging | run the scorer again on the whole list |
