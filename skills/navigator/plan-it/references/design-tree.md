---
house_style: true
read_when:
  - "`plan-it` is mapping the decisions an idea needs, or choosing which one to ask next"
  - "A question has to be written in the interview's shape"
  - "The designer's answer is not a plain pick: a reaction, a hedge, a counter or a reversal"
---

# The design tree

The decisions an idea needs, laid out so each question is asked once, in an order where no later answer reopens an earlier one.

## The tree and its frontier

Each decision hangs under the decision it depends on. Where to store a setting depends on whether there is a setting at all, so the second hangs under the first. The frontier is every decision whose parents are settled, and only a frontier decision gets asked.

Show the tree as a small code block, and redraw it when an answer changes its shape:

```
Dark mode
├── What it is for: night reading, or matching the system
│   ├── Who switches it: the user, the system, or both
│   │   └── Where the toggle lives
│   └── Which screens it covers
└── Default theme on first open (builder's call)
```

## The order

1. **Purpose first.** What the idea is for, the line it must not cross, and the smallest version worth building. A purpose answer often reshapes the whole tree, so a mechanics question asked before it gets asked again.
2. **Who and what next.** Who it serves and owns it, and what it covers. Settle who owns a thing before asking where its files go.
3. **How last.** Structure, tools, files and names.

A topic-level why from the gate does not count as the purpose. "For dark mode" is a topic, and "so a night reader stops squinting" is a purpose.

Where an answer about purpose is personal, record only the rule it produces, and keep the private reason out of the plan.

## What gets a question

- **A decision that is costly or hard to undo** gets a question.
- **A cheap, reversible detail,** such as a label, an icon or a file name, gets a written default marked as the builder's call, and no question.
- **A decision that only bites in a later gate** can stay open. Mark it `[OPEN]` in the plan, with what it waits on.
- **A question a short measurement would settle** gets `run-spike` as one of its options.

## Writing a question

```markdown
**Q3. Who switches the theme?**

A) The user, from a toggle in settings.
B) The system setting, with no toggle.
C) Both: it follows the system until the user picks one.
D) Talk it through.

C, because the purpose is night reading, and a reader whose phone is already dark wants no extra step.
```

- **Ask one question per message,** and end the message on it.
- **Keep the question short,** in one sentence a phone screen shows whole.
- **Give up to four lettered options,** with the last one open, such as "Talk it through".
- **Say the pick and its reason in one line after the options,** rather than writing the picked option out at more length.

## Reading an answer

| The answer | What to do |
|---|---|
| A letter, or letters run together | Map the letters to the options in the last question before reading them as anything else |
| A reaction without a pick, such as a laugh | Ask in one line whether that means your pick, and record nothing yet |
| A clarification of the question | Confirm your reading in one line, and ask the same question again with its options and pick alone |
| Cut off, or readable two ways | Read back your guess as short bullets, and record nothing until the designer confirms |
| A pick with a hedge, such as "A, maybe some B later" | Record the pick, say your reading of the hedge in one line, and park the hedge as `[OPEN]`, the builder's call |
| A short, strong preference, such as "no more settings" | Ask in one line what it covers before treating it as a rule, because it usually targets one kind of thing |
| A word with several meanings | List the meanings, and ask about one |
| Free text that answers the question | Record it in the designer's words |

## Counters and reversals

- **The designer counters your pick with their own.** Weigh it plainly: what it gains, what it costs, and which earlier decisions it replaces. Where it fits their purpose better, say so and make it the pick.
- **Your pick would reverse an earlier decision.** Search the plan's Decided list for the topic before you pitch it. Where it reverses one, say so before the designer answers: give the old reasons, say which no longer hold, and offer a small guard for the ones that do.
- **An answer overlaps an earlier decision.** Name the earlier decision it undercuts, and ask which one stands. Never let both stay in the plan.
- **An answer contradicts something the designer said earlier.** Name both statements, and ask one question about the conflict.
- **A decision is reversed.** `references/plan-format.md` § Superseded decisions says how to mark it.

## Traps

- **A suggestion saved as a decision.** Where one slipped in, say so in the same message as the next question, and take it out.
- **A test gap written as a scope cut.** "We can't test on that platform here" is a fact about testing. Write a platform or a feature out of scope only when the designer cut it.
- **A fix turned into the default.** A fallback the designer names applies after the plain path fails. Write the plain path as step 1, then each fallback in order.
- **A file changed by someone else mid-interview.** Re-read the plan from disk before reporting what it says.

## Done

The interview is done when the frontier is empty: every branch visited, nothing silently assumed, and the rest marked `[OPEN]`.
