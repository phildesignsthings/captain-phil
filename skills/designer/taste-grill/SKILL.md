---
name: taste-grill
description: >-
  Interviews the designer about the default taste one numbered question at a time, and writes each
  place their taste differs into the overrides file the captain.json taste slot names, in their own
  words, as each answer lands.
when_to_use: >-
  Use when a designer sets up their taste, wants the suite to design their way rather than the
  default way, or keeps correcting the same taste call across sessions. Trigger phrases "grill my
  taste", "taste grill", "set up my taste", "record my taste", "that's not my taste", "change the
  default taste". Not for a single taste correction in passing, which captain-phil-mode's "Before
  writing a memory" checklist offers to record as one entry.
compatibility: >-
  Reads the taste slot of captain.json (references/captain-lookup.md). With taste null, the
  designer keeps the default taste as shipped, so the skill says so in one line and stops. With it
  absent, it asks once where the overrides file lives and offers to create it and set the slot.
  With no captain.json, it says the answers cannot be recorded and stops.
metadata:
  suite: captain-phil
  hand: designer
  captain: [products, taste]
---

# Taste grill

The suite ships a default taste. This skill finds where the designer's taste differs from it, one question at a time, and writes each difference into their overrides file the moment they answer. It never writes a taste file from scratch, and it never asks about the bar.

The short version: find the overrides file, read the default and the file, say in one line what is settled, then ask one numbered question per message and write each answer before asking the next.

## Hard rules

- **Ask one question per message,** numbered `Q<n> of ~<total>`, and end the message there. Ask the next one only after the designer answers.
- **Never ask about the bar.** Ask only about `[style]` rules. Where the designer pushes on a `[bar]` rule, name the rule in one line, say it holds whatever the taste, and record nothing.
- **Write each answer into the overrides file before asking the next question,** in the designer's words and never an elaboration of them. A grill that stops halfway keeps every answer given.
- **Never ask what a file already answers.** Skip a question once every heading it covers holds an entry in the overrides file, unless the designer names one to revisit. Where only some do, ask it about the rest alone.
- **Keep one live version of each rule.** A later answer about a rule edits that rule's entry, rather than adding a second entry beside it.
- **Write only into the brain,** at the path the `taste` slot names, and never into a product repo.
- **Use no em dashes in a question.** Cut any closing caveat that doesn't change what the designer does next.

## Steps

### 1. Find the overrides file

Resolve the `taste` slot through `references/captain-lookup.md`. Its step 1 finds the brain, and "The other `captain.json` slots" gives the three states. Taste belongs to the designer rather than to one product, so skip the lookup's product and host-file steps.

| What the lookup finds | What to do |
|---|---|
| A path to a file that exists | Read it, and go to step 2 |
| A path to a file that is missing | Offer to create it at that path, holding the title line in `references/overrides-format.md`. Make the offer the message's only question, and go to step 2 after a yes |
| `null` | Say in one line that the designer keeps the default taste as shipped, and that pointing `taste` at a file lets this skill record overrides. Stop |
| Absent | Ask once where the overrides file lives, and offer to create it and set the slot, as the lookup's "Record into a `captain.json` slot" says. Go to step 2 after a yes |
| No brain | Say in one line that the answers cannot be recorded without a `captain.json`, and point at https://github.com/phildesignsthings/captain-phil/blob/main/captain/README.md. Stop |

After a no to either offer, stop, because an answer with nowhere to go is lost.

### 2. Survey before Q1

1. Read `references/default-taste.md` and `references/default-motion.md`. Every rule in them is tagged `[bar]` or `[style]`.
2. Read the overrides file, and any file it links to.
3. Read `references/question-bank.md` for the planned questions. Drop each one whose headings all hold an entry, and count the rest for `~<total>`. A question with some of its headings answered stays in, covering only the unanswered ones: its title names those alone, and the default it states and its options speak only for them. The answered headings keep what the file holds.
4. Open the message with one line saying what is settled: the bar, which is never asked, the headings the overrides file has answered, and anything the designer said this session. Then ask Q1 in the same message.

Numbering starts at Q1 on every run.

### 3. Ask one question

Write the question in the shape `references/question-bank.md` § Writing a question gives:

1. Title it `**Q<n> of ~<total>: <the headings it covers>**`.
2. State the default on that one axis in two or three plain sentences.
3. Offer A) Keep, B) Change and C) Drop, each on the same slots: what it means for the rules under the heading, what the designer would see in the work, and one example.
4. Close the list with D) Talk it through.
5. Mark one option recommended. Recommend Keep unless the overrides file or this session points elsewhere, and then say what it came from.

A taste question (products the designer admires, what makes them twitch) opens as a prompt for names, with a short optional guess list, as the bank marks.

### 4. Write the answer

1. Turn the answer into entries, in the format `references/overrides-format.md` sets out, under the heading the rule sits under.
2. Write them to the overrides file before replying.
3. Say in one line what landed and where: the heading and the entry.
4. Ask the next question in the same reply.

`references/question-bank.md` § Reading an answer covers combined letters, free text, a handed-back pick, a Change with no new rule, and a requirement added beside an answer. Banter stays in the chat and never reaches the file.

### 5. Close

1. Ask the closing question from the bank: which of the designer's changes join the pre-flight list.
2. Write the answer under `Before showing anyone anything` or `Before calling motion done`.
3. Report in a few lines: the overrides file's path, one line per heading that changed, and that `captain-phil-mode` lays the overrides on the default when the next session opens.

## When you need

| You need | Read |
|---|---|
| The default rules, and which are bar and which are style | `references/default-taste.md`, `references/default-motion.md` |
| How an entry names its rule, the four entries, and the merge | `references/overrides-format.md` |
| The planned questions, the question shape, and how to read an answer | `references/question-bank.md` |
| Where the brain is, the `taste` slot's states, and the offer to set it | `references/captain-lookup.md` |
