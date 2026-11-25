---
house_style: true
read_when:
  - "A phase's findings files are in and its evidence file is being written"
---

# Evidence file shape

One evidence file per phase, written by the main session from that phase's findings files. It is the only thing the report steps read, so it carries every point they need, each one traceable to a findings file and through it to a session.

Keep it under 4,000 words. Write each section as prose or a short list, never as a copy of the findings. Merge what the agents found, count it, and keep the strongest quote.

## Sections, in order

| Section | What goes in it |
|---|---|
| Title | `# Evidence <phase>: <what the phase was>, <first date> to <last date>` |
| Source line | Sessions read, agents used, findings paths, the tally file, and the sweep's token cost |
| How the process changed | Dated stretches, each opening with a bold date range and what defined it |
| The process as it stood at the end | The loop as the last sessions ran it, as a numbered list with who drove each step |
| Where the person took the reins | The overrides, grouped by kind (taste, scope, domain, copy), each with a quote |
| Where time went | The rework, most costly first, each with its cost in sessions or messages and its fix |
| Model use | The tally table's story: which model built, which planned, what sub-agents ran on |
| What a better plan would have contained | A numbered checklist, one item per fix the rework pointed to |
| Reusable assets | The skills, docs and scripts the phase created |
| The phase question | The answer to the question the person asked, where they asked one, with its evidence |
| Quotes for the docs | Up to 10 quotes, each with its session stem |
| Timeline | One row per first: date, what appeared, session stem |

## Rules

- Correct an earlier phase's file in this one where the findings contradict it, and say which claim changed.
- Count the checklist items, and carry the running total into the state file.
- Name any session left out and why: another client, another project, this study's own kickoff.
