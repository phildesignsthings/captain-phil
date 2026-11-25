---
name: plan-it
description: >-
  Turns an idea into a written plan, one decision at a time, before anything is built. It checks
  the idea has a purpose and a done state, surveys what the brain and the product repo already
  say, interviews the designer through grill-me, and writes each decision into the plans folder
  as it lands, with the work split into gates.
when_to_use: >-
  Use when a designer brings an idea to think through, a feature to plan before building, or work
  too big for one session that needs splitting into gates. Trigger phrases "plan it", "help me
  plan", "let's think this through", "I have an idea", "I want a", "turn this into a plan". Not
  for a request that already names a plan or a gate, which `gate` opens, a one-line question, or
  stress-testing a plan already written, which `grill-me` does.
argument-hint: "[the idea]"
compatibility: >-
  Writes the plan into the plans slot of captain.json (references/captain-lookup.md). With plans
  null, the plan is kept in the chat and printed whole at the close. With plans absent, the first
  write asks once where plans live and offers to set the slot. With no captain.json, it says in
  one line that the plan cannot be saved, and prints it at the close. Reads issues.tracker,
  records.product, records.scope, memory.root and docs.index from the host file found through
  captain.json, falling back to .agents/host.json. A null or absent slot means the survey skips
  that source and names it in its report, and docs.index absent means reading the agent index at
  the repo root.
metadata:
  suite: captain-phil
  hand: navigator
  host: [issues.tracker, records.product, records.scope, memory.root, docs.index]
  captain: [plans, products]
---

# Plan it

This skill turns an idea into a plan the designer can hand to anyone, one decision at a time. It builds nothing. The facts come from the files, the decisions come from the designer, and each one goes into the plan the moment it is made.

The short version: find the plans folder, check the idea has a why and a done, read what exists, map the decisions, ask them one at a time through `grill-me`, and write each answer down before the next question.

## Hard rules

- **Build nothing.** Write only the plan file, plus a `captain.json` slot after a yes. A question that measuring would settle faster goes to `run-spike` as an offer.
- **Never invent the why, the done state or what is fixed.** Ask for the first one missing, and ask nothing else in that message.
- **Write nothing before the designer has answered the gate.** The plan file starts once the idea has a why and a done state, and the survey is done.
- **Never ask what a file answers.** Survey first, and say where you looked when a search comes up empty.
- **Ask one question per message,** with the recommended option and one line of why. Ask what the idea is for before how it is built.
- **Record a decision only after the designer answers it,** with its why and the options it beat. A pick you suggested is not a decision until they choose it.
- **Write cheap, reversible details as defaults,** marked as the builder's call, rather than spending a question on them.
- **Supersede a reversed decision, never delete it,** and list every file that still states the old version.
- **Write only into the brain,** never into the product repo.

## Steps

### 1. Find the plans folder

Resolve the `plans` slot through `references/captain-lookup.md`. Its step 1 finds the brain, and "The other `captain.json` slots" gives the three states. Leave the product until step 3, because the gate can name it.

| What the lookup finds | What to do |
|---|---|
| A path to a folder that exists | List its plans, and go to step 2 |
| A path to a folder that is missing | Note it. The first write in step 6 offers to create it |
| `null` | Say in one line that the plan stays in the chat and prints whole at the close |
| Absent | Note it. The first write in step 6 asks where plans live, as the lookup's "Record into a `captain.json` slot" says |
| No brain | Say in one line that the plan cannot be saved without a `captain.json`, and that it prints at the close |

None of these stops the skill. A plan with nowhere to go is still worth thinking through.

### 2. Gate the idea

The idea is what the designer wrote after the skill's name, or their last message. Check that three things have an answer, from what they said or from a plan in the plans folder:

1. **What it is and why.** An outcome, not a topic. "A dark mode toggle" is a topic, and "people reading at night stop turning the brightness down" is an outcome.
2. **What done looks like,** even roughly.
3. **What is already fixed:** constraints and earlier decisions. The survey in step 3 fills most of this, so ask for it only after the survey, and only where the survey found nothing that bears on the idea.

Where the idea arrives as loose prose, read it back first in a few lines, as `confirm-scope` does. Then ask for the first item missing, why before done, and end the message there. Ask it as one short question with no options, in words that name the item, so the designer can see which part of the gate it is:

| Item missing | Ask |
|---|---|
| What and why | "Why do you want this? What changes for the people using it?" |
| Done | "What does done look like? What would you check to know it worked?" |
| Fixed | "What is already fixed that I didn't find, such as a constraint or a decision made somewhere else?" |

The gate is passed when items 1 and 2 have an answer the designer gave or a file states.

### 3. Survey before asking

Resolve the product the idea is for, through steps 2 to 4 of `references/captain-lookup.md`. Where several entries match and the gate named none, this is the one place to ask which.

Then read every source the idea touches, as `references/survey.md` sets out: earlier plans, the brain's notes on the product, the product record (`records.product`), the agreed scope (`records.scope`), the project notes (`memory.root`), the agent index (`docs.index`), and the tracker (`issues.tracker`), read-only. Report it as short bullets, one per source, naming the empty ones. Where two sources state opposite rules, say so before any question that rests on either.

### 4. Map the decisions

Lay the decisions out as a tree, each one under the decision it depends on, and show it as a small tree in a code block. The frontier is every decision whose parents are settled. Mark which decisions are cheap to change, because those become defaults rather than questions. `references/design-tree.md` gives the order: purpose, then who and what, then how.

### 5. Interview through grill-me

Invoke `grill-me` at its step 2, with the frontier as the tree to walk. On top of its rules:

1. Ask the frontier question that the most other decisions hang off.
2. Number it `Q<n>`, give up to four lettered options, and mark one recommended with one line of why.
3. Read the answer as `references/design-tree.md` § Reading an answer says. A laugh, a hedge or a clarification is not a pick.
4. Write the decision into the plan, as step 6 says, before asking the next question.
5. Update the frontier, and ask the next one.

The interview is done when the frontier is empty: every branch visited, nothing silently assumed, and the rest marked `[OPEN]`. Then confirm in one line that you and the designer share the picture.

### 6. Write the plan as you go

Write the plan in the shape `references/plan-format.md` gives: Goal and why, Decided, Open, one `## Gate <id>` heading per gate, and Next.

1. Once the gate in step 2 is answered and the survey in step 3 is done, create the file with its Goal and why, naming what the survey found fixed. Where step 1 noted a missing folder or an absent slot, make that offer first, once.
2. After each answer, add the decision to Decided and bump `updated:`.
3. After a reversal, mark the old decision superseded and list the files that still state it under `## To update`.
4. Once the interview ends, split the build into gates, each one deliverable sized for one session, with its own done checks.
5. Read the file back from disk before reporting what it holds.

### 7. Cold-read and close

1. Give the plan to a fresh subagent with no context beyond its path, read-only, as `references/plan-format.md` § The cold read says. Fix each gap it finds, two rounds at most.
2. Tell the designer in a few lines what was decided, what is open, and where the plan lives. With nowhere to save it, print the whole plan.
3. Point at `gate` to start the first gate in a fresh session. Start no building here.

## When you need

| You need | Read |
|---|---|
| Where the brain is, the `plans` slot's states, the product's entry and its host file | `references/captain-lookup.md` |
| Which sources to read, in what order, and how to report them | `references/survey.md` |
| How to order the decisions, shape a question, read an answer, and handle a counter or a reversal | `references/design-tree.md` |
| The plan's sections, the gate headings, decision and superseded entries, and the cold read | `references/plan-format.md` |
| The interview rules this skill builds on | the `grill-me` skill |
