---
name: grill-me
description: >-
  Interview the user relentlessly about a plan or design until reaching shared understanding,
  resolving each branch of the decision tree. Where the user has corrected the direction, it first
  says back what the agent thinks they want and offers the interview, rather than carrying on with
  a wrong picture of the goal.
when_to_use: >-
  Use when the user wants to stress-test a plan, get grilled on their design, or mentions "grill
  me". Also use, before any other tool call, when the user corrects the direction rather than a
  detail, corrects the same thing twice, restates the goal, questions the approach, or sounds
  frustrated with the output, and when you are about to rebuild something you already built once
  this session. Trigger phrases "that's not what I meant", "why are you doing that", "I said",
  "step back", "this tells me nothing", "do we need to grill this".
metadata:
  suite: captain-phil
---

# Grill me

## 1. Say it back, where a correction brought you here

Where the user asked for a grilling, skip to step 2.

A correction shows up as one of these:

- The user corrects the direction rather than a detail: "that's not what I meant", "the point is…".
- The user corrects the same thing a second time.
- The user explains the goal again.
- The user questions the approach: "do we need to grill this?", "do we need to step back?".
- The user sounds frustrated with the output.
- You are about to build a second version of a file, a board or a document you already built this
  session.

Stop before any other tool call and send one short message:

1. Say in one sentence what you think the user wants.
2. Say in one sentence what you have been building.
3. Ask whether to run the interview, or whether a one-line correction is enough.

Wait for the answer. A one-line correction ends the skill, so apply it and carry on. Save the
correction nowhere, because a correction to the goal belongs to this task.

## 2. Interview the user

Invoke `unslop`, then:

- Interview the user about every aspect of the plan until you reach a shared understanding.
- Walk down each branch of the design tree, and resolve the dependencies between decisions one at a
  time.
- Ask one question at a time, with your recommended answer.
- Explore the codebase instead of asking, where the codebase answers the question.
