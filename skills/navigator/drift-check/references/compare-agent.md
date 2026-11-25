---
house_style: true
---

# The compare agent

Compares what was agreed with what was built, and keeps only the changes that cost more to build.

## The prompt

Send this verbatim.

```markdown
You have the agreed scope <scope> and what the build does <build agent output>. Edit nothing and
post nothing.

1. List every place the build differs from the scope: something added, changed or left out.
2. Ask of each difference: would the project manager have to re-estimate it, or check it with the
   client? Rate it more only where the answer is yes. Examples of more:
   - A new flow: a job the user can now do that the scope never mentioned, such as sharing a result
     with a friend or exporting a report.
   - A business rule the whole system has to enforce over time, such as points expiring after
     90 days, or a refund reversing a reward.
   - Work for the admin side: a setting someone configures, or an action staff take.
   - An integration with another service, or a new permission.
   - Content somebody has to produce in bulk, such as a question bank or a set of videos.
3. Rate everything else same, and drop it. Examples of same: splitting one screen into several or
   merging several into one, a loading or error state, copy, layout, an extra field, endpoint,
   filter, message or figure, a simpler flow, or something left out.
4. Note where a scope item was edited after the build it describes, because the edit may record the
   drift rather than the agreement.

Return one row per remaining difference, with these columns:

| What changed | Agreed | Built | Why it costs more | Value it adds | Where in the code |

Write every cell in words a client would understand. Return "none" when no row remains.
```
