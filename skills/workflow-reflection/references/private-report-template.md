---
house_style: true
read_when:
  - "The evidence files are written and the private report is next"
---

# Private report shape

The private report is written to the person, in the second person, and nobody else reads it. It stays in the gitignored study folder and is never committed.

Keep it under 2,500 words. Be direct about the gaps, because the person ran the study to hear them.

## Sections, in order

| Section | What goes in it |
|---|---|
| Title | `# How you work with AI: a private read` |
| Scope paragraph | The dates covered, the sessions read and by what, the evidence files, the /insights report and its dates, and the path of the one-pager |
| The short version | One paragraph: whether the process works, how it changed, the two problems that lasted, the largest avoidable cost, and the model saving |
| Your patterns | Four to six patterns, each a paragraph opening with a bold sentence and carrying one quote |
| Your gaps | Numbered, most costly first, each with its cost in sessions and the fix |
| Cross-check against /insights | What both agree on, what the person took in a different form, what /insights got wrong, and what it could not see |
| The better-plan checklist | Every phase's checklist items, merged and grouped under Before the project, Before a feature's plan, In the plan, and At the end |
| For the next project | Five numbered imperatives |
| The numbers | A table of sessions, dates, output tokens and which model built, per repo or per phase, then the study's own reading cost |

## The /insights cross-check

`/insights` writes its report to `~/.claude/usage-data/report.html`, and it covers every project on the machine rather than this one.

1. Read the report's date range before anything else, and state it in the scope paragraph.
2. Skip the section where the file is absent, and say in the scope paragraph that no report was found.
3. Compare only the claims that touch the dates and the kind of work the study covers.
4. Count how many of its friction items the person had fixed by the study's end, and name the fix.
