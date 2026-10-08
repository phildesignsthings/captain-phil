---
house_style: true
---

# The claims agent

The claims agent reads one slice of code and lists every product claim it makes. It reads no source
outside the slice and judges nothing against one. It runs in a fresh context with the file list and
the harness markers, and nothing else.

## The prompt

Send this verbatim, every run.

```markdown
You are listing the product claims a slice of code makes. You have two inputs: the files
<file list>, and the strings that mark demo-only code <harness markers>. Read only those files.

A claim is anything a product owner could disagree with. List every one of these:

1. A number with a product meaning: a limit, a count, a duration, a price, a threshold.
2. A rule: who can do something, what happens when they do, what happens when it fails, what order
   things happen in.
3. Copy a user reads that states a rule or a consequence, such as a confirm, an error or an empty
   state.
4. A reference to a decision, a ticket, a design board or a spec section.
5. A comment that says why the code works the way it does.

Leave these out:

1. Implementation with no product meaning: styling, layout values, types, imports, memoisation.
2. Code between a demo-only marker's start and end, or on a line the marker labels.
3. A comment that restates the line beside it and states no rule.

For each claim, read the code that carries it and write down what the code does, separately from
what any comment says. Where a comment and its code disagree, mark the claim as self-split.

Return one table and nothing else, with these columns:

| id | file:line | kind | the claim, in one sentence | what the code does | the comment says | self-split | references cited |

- id: C1, C2 and so on.
- kind: number, rule, copy, reference or why.
- the comment says: "none" where no comment covers it.
- self-split: yes or no.
- references cited: every decision id, ticket id, board name or spec section the comment names.
```

## What the claims agent never sees

| Withheld | Why |
|---|---|
| The sources the slice answers to | a reader who has seen the spec reads the code as saying what the spec says |
| The session's transcript | a reader who knows the expected answer finds it |
