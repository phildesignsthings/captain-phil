---
house_style: true
read_when:
  - "A drift check is starting, and an earlier session may have checked part of the feature"
  - "A drift-check gate has had its rulings applied and has to be recorded"
---

# The drift record

One file per feature records which gates have been checked, when, and against which commit. The
next session reads it and carries on from the first unchecked gate, rather than planning the feature
again.

## Where it lives

| `docs.root` is | The record goes in | Who reads it |
|---|---|---|
| A path | `<docs.root>/drift/<feature>.md`, committed | Every session and every developer on the repo |
| `null` | The project's gitignored scratch folder | This worktree only, and the plan says so |
| Absent | The repo's docs folder where one exists, otherwise the scratch folder | As the row it lands in |

Name the file after the feature in the user's words, lower-case and hyphenated, such as
`saved-payment-cards.md`.

## What it holds

Copy this shape. Leave a gate's row blank in the last four columns until its rulings are applied.

```markdown
# Drift check: <feature, in the user's words>

**Planned:** <date>, with <who gave the go>
**Budget:** <the budget the user set, in their words>
**Sources:** <the shared source list from the plan>
**Left out:** <the tracker items the plan left out, or "none">

| Gate | Screens | Checked | Commit | Rows ruled | Waiting |
|---|---|---|---|---|---|
| <gate name> | <screens, by product name> | <date> | <short SHA the claims were read at> | <count> | <drafts sent to an owner and not yet answered, or "none"> |
```

## Why each column is there

| Column | Why |
|---|---|
| Commit | the claims were read at that commit, so a later change to the gate's files means the gate is due again |
| Rows ruled | a gate with no rows ruled was planned and not checked |
| Waiting | a draft sent to an owner is the one thing a later session cannot learn from the code or the sources |
