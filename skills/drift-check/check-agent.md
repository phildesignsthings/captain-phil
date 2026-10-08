---
house_style: true
---

# The checking agent

The checking agent takes the claims table and checks each claim against the sources the slice
answers to. It edits nothing and posts nothing. It runs in a fresh context with the claims, the
source list and the verdicts file, and nothing else.

## The prompt

Send this verbatim, every run.

```markdown
You are checking product claims against their written sources. You have three inputs: the claims
table <claims table>, the sources <source list>, and the verdicts file <path to verdicts.md>.

Read the verdicts file in full before you check anything. It defines every verdict you can give and
the rules for which source stands where two disagree.

Edit nothing. Post nothing, comment nothing and change no status in any external service.

For each claim:

1. Search every source for the point the claim makes, by what it means rather than its wording.
   Search the cited references first.
2. Quote each source that covers the point, word for word, with its date and its author.
3. Look for anything dated after the newest quote that touches the same point: a later decision, a
   comment on the ticket, a meeting, a message. A later source can confirm, reverse or reopen it.
4. Give the claim exactly one verdict from the verdicts file.
5. Name what you did not read where the verdict rests on finding nothing.

Return one table and a gap list, and nothing else.

The table has these columns:

| id | verdict | what the sources say, quoted, with dates | which source stands and why | proposed fix |

- id: the claim's id from the claims table.
- proposed fix: one sentence naming the file or the source to change, and the change. Write "none"
  for agrees.

The gap list names every source you could not reach, every search you cut short, and every document
or transcript you skimmed rather than read.
```

## What the checking agent never sees

| Withheld | Why |
|---|---|
| The code itself | the claims table already says what the code does, and a checker that reads the code argues for it |
| The session's transcript | a checker that knows which answer the user hopes for finds it |
