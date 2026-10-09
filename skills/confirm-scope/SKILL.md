---
name: confirm-scope
description: >-
  Read an open-ended request back in a fixed template, ask only the two questions that would
  change the approach, and wait for a go before building anything.
when_to_use: >-
  Invoke at the start of a session when the request arrives as prose describing a want, in the
  user's own words, rather than as a pasted handoff, a gate number, a named plan or a slash
  command. The signal is tone, not size: an opening ramble that names an outcome without naming
  the steps. Example requests "I want to build a thing that lets people...", "can we make the
  index nicer", "I've been thinking about how onboarding works", "have a look at this and tell me
  what you'd do". Do not invoke in plan mode, or on a request that continues work already agreed
  in this session.
user-invocable: false
compatibility: >-
  Runs standalone in any repo. Step 3 escalates to a skill that interviews a design brief; without
  one, ask a second round instead.
metadata:
  suite: captain-phil
---

# Confirm the scope

A guessed scope built at full size costs a rebuild. A scope read back in four lines costs one
exchange.

## When it does not run

Skip this skill and start work where any of these is true:

- Plan mode is on. It already proposes and waits, so this skill adds a second gate to the same wait.
- The request is a pasted handoff, a state record, or a message carrying file paths and a status.
- The work itself arrived as a slash command, for example `/gate 4b`. A session-setup skill
  such as `captain-phil-mode` is not the work and does not suppress this skill.
- The request names a gate, a step number, or a plan that already exists in the repo.
- The work continues something already agreed in this session.
- The request is a question, a lookup, or an edit to one file.

Run it otherwise, for prose describing a want.

## 1. Read the request back

Extract what the request already answers, rather than asking for it a second time. Fill this
template and send nothing beside it.

```markdown
**What I think you want:** <one sentence, the deliverable and what it is for>

**What I'd do:** <three to five bullets, one step each>

**Two things that would change that:**

1. <question> — I'd assume <the answer you would proceed on>
2. <question> — I'd assume <the answer you would proceed on>

Say go, or correct me.
```

- Write one sentence on the first line. A second sentence means the deliverable is not pinned yet.
- Raise a question only where a different answer produces different work.
- State an assumption under every question, so saying nothing is an answer.
- Ask two questions, or one. A third means the request needs shaping rather than confirming.

## 2. Wait

- Build nothing until the answer arrives. A draft sent alongside the read-back makes it decorative.
- Send the template again where the correction lands on the first line, because the rest was built
  on a wrong reading.
- Hold the confirmed scope in the conversation. Write it to a file only where the user asks.

## 3. Escalate where it stays unclear

- Hand a UI surface whose purpose is still open to the `impeccable` skill, and say it needs the
  Shape phase.
- Ask one more round for anything else, capped at two questions again.
- Say the request needs a conversation, and stop, where a second round leaves the deliverable
  unpinned.

## Adapt on install

- Replace `impeccable` in step 3 with whatever this repo uses to interview a design brief, or cut
  the line.
- Add this repo's plan or ticket naming convention to the list in **When it does not run**, so a
  named plan stops the skill.
