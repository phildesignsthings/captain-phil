---
house_style: true
read_when:
  - "`plan-it` has passed the gate and is about to survey before its first design question"
  - "A plan's `[OPEN]` item might already be settled somewhere else"
  - "A search came up empty, and the report has to say where it looked"
---

# The survey

Looking up facts is the planner's job, and decisions are the designer's. The survey reads what exists before the first design question, so the interview spends its questions on calls only the designer can make.

## Where to look

Read the sources in this order, and skip one only where the idea plainly cannot touch it. Each skipped source still gets a line in the report.

| Source | Where it is | What to take from it |
|---|---|---|
| Earlier plans | The folder the `plans` slot names | A plan for the same idea, decisions that constrain this one, and `[OPEN]` items this idea might answer |
| The brain's notes on the product | The `notes` path in the product's `captain.json` entry | What the designer already knows about the repo |
| The product record | The host file's `records.product` | Who the product serves and its copy standard |
| The agreed scope | The host file's `records.scope` | Whether the idea is inside what was agreed, and what it would add |
| The project notes | The host file's `memory.root` | Lessons and calls already made on this product |
| The agent index | The host file's `docs.index`, or the agent index at the repo root where the slot is absent | The repo's rules and where its docs live |
| The code and its history | The product repo: its folders, recent commits and branch names | What is built, what is half-built, and work in flight on another branch |
| The tracker | The host file's `issues.tracker` | Epics and stories that already cover the idea |

A `null` slot means the product has none of that thing, so its line in the report says so. An absent slot means nobody answered, so look for that kind of file by name at the repo root, and say what you found.

Where the local checkout of a repo may lag, run `git fetch` first and read files from the remote branch with `git show origin/<branch>:<path>`.

## Reading the tracker

Read the tracker and change nothing in it: no comment, no status change, no new issue.

- **The tracker already holds stories for the idea.** The product scope is settled there, so the interview is about how to run the work: the order, what gets prototyped first, and who owns each part. Asking a scope question the tracker answers costs the designer a round.
- **The tracker marks a priority, such as labels for this cycle, the next and later.** Plan from the stories marked for this cycle, and say in one line what the cut left out, so no pick reaches for a later story.
- **The tracker is out of reach,** through a missing login or a missing tool. Say so in the report, and ask the designer for the stories' scope rather than guessing it.

## Settled in practice

An `[OPEN]` item in an earlier plan may already be settled where nobody wrote it back. Search the idea's key words across the brain and the product repo: notes, docs, skills, branch names and commit messages. Where a working arrangement turns up, bring it to the designer as "this looks settled, confirm?" rather than as a blank question.

Where a source turns up mid-interview that contradicts a decision already made, say which decision it contradicts before asking the next question.

## Before asking about what you found

- **Name each thing in one plain line** before a question mentions it: what a script, a scheduled job or a folder does, and whether it still runs. A question about a name the designer doesn't recognise costs a round.
- **Name a conflict between two sources first.** Where one file says one rule and another says the opposite, give both, and ask about the conflict before any question that rests on either rule.
- **Check what already covers a risk** before proposing a guard for it. A rule the setup already enforces needs no second copy in the plan.

## The report

Open the survey's message with short bullets, one per source:

```markdown
- Earlier plans: none for this idea. Looked in `<plans folder>`.
- Product record: the product serves people booking travel on a phone, and copy is plain.
- Agreed scope: theming is out of scope. A dark mode adds to it.
- Tracker: one story covers a dark theme, marked later.
- Project notes: none. `memory.root` is null.
```

The survey is done when every source the idea touches has a line.
