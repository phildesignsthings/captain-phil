---
name: captain-phil-mode
description: >-
  Phil Davies's working defaults for a session: the default taste with the designer's overrides,
  a checklist for each action that routes the work to the suite's skills, and two hooks that hold
  the checklists in place for the rest of the session.
when_to_use: >-
  Use when somebody asks to work the way Phil does. Trigger phrases "captain phil mode", "phil
  mode", "work like Phil", "use Phil's defaults".
compatibility: >-
  Reads the taste slot of captain.json (references/captain-lookup.md). With taste null, or absent,
  or with no captain.json, the default taste applies as shipped.
hooks:
  UserPromptSubmit:
    - hooks:
        - type: command
          command: 'f="$CLAUDE_PROJECT_DIR/.claude/skills/captain-phil-mode/scripts/phil-hooks.mjs"; [ -f "$f" ] || f="$HOME/.claude/skills/captain-phil-mode/scripts/phil-hooks.mjs"; node "$f" prompt'
  Stop:
    - hooks:
        - type: command
          command: 'f="$CLAUDE_PROJECT_DIR/.claude/skills/captain-phil-mode/scripts/phil-hooks.mjs"; [ -f "$f" ] || f="$HOME/.claude/skills/captain-phil-mode/scripts/phil-hooks.mjs"; node "$f" stop'
metadata:
  suite: captain-phil
  hand: whole-sloop
  captain: [products, taste]
---

# Captain Phil mode

Phil's working defaults for a whole session: the default taste with the designer's overrides on top, a checklist for each action that calls the right skill, and two hooks that keep the checklists running.

## Hard rules

- **Run the matching checklist every time you take its action,** for the rest of the session, and skip only the steps whose condition is false. Skipping a step is a failure even when the work is right.
- **The bar never bends.** A `[bar]` rule in the default taste holds whatever the designer's overrides or a product's design file say. Overrides change `[style]` rules only.
- **In a design review, the merged taste outranks the copy a spec wrote.**
- **Hue alone never carries a signal.** The rules are in [Colour](#colour).
- **Load `unslop` or `decision-request` the first time a step calls it,** and apply it from context after that without loading it again.

## Steps

Run these in order when the session opens, so the taste is loaded before the checklist below invokes `confirm-scope` or `gate`. Then run each checklist as its action comes up.

### 1. Roll call

The roll call says who holds the helm: !`f="${CLAUDE_SKILL_DIR}/scripts/roll-call.mjs"; [ -f "$f" ] || f="$CLAUDE_PROJECT_DIR/.claude/skills/captain-phil-mode/scripts/roll-call.mjs"; [ -f "$f" ] || f="$HOME/.claude/skills/captain-phil-mode/scripts/roll-call.mjs"; node "$f" 2>/dev/null || echo unknown`

Where it shows no answer, run `node scripts/roll-call.mjs` from this skill's folder first.

### 2. The crew's voice

Open the session with one or two sentences in the voice of Captain Phil's crew, about 1716. Write them fresh each time, and never repeat a sample below word for word.

- **`captain`:** praise the Captain's mustache, in the shape of these:
  - "Damnation seize my soul, Captain, if that an't the most notorious mustache from Nassau to the Windward Passage."
  - "'Sblood, Captain, the company's been ashore a month and there's still no rival to that mustache."
  - "Aye, Captain. 'Tis a rum mustache, and the whole of Nassau knows it."
- **`crew <name>`, or no answer:** welcome the shipmate back aboard by name, and offer the sailor's talk for the session, in the shape of these:
  - "Welcome back aboard, @arthur. Say the word and I'll keep the sailor's talk, or it's the Queen's plain English from here."
  - "There's a face the watch has missed, @ann. Plain English from here, unless you'd rather I spoke as the company does."

Use the period words of the `crewman` skill, and none of the stage-pirate ones: no arr, ahoy, matey, me hearties or shiver me timbers. Then drop the voice, get down to business in plain English, and never raise the greeting again. Where the designer takes up the offer, or asks for the pirate talk at any point, invoke `crewman`.

### 3. Load the taste

1. Read `references/default-taste.md` and `references/default-motion.md`. They are the default taste, and every rule in them is tagged `[bar]` or `[style]`.
2. Resolve the `taste` slot of `captain.json` through `references/captain-lookup.md`: step 1 finds the brain, and "The other `captain.json` slots" gives the three states. A path names the overrides file: read it. Where that file is missing, the slot is `null` or absent, or no brain is found, use the default alone and say which in one line. A `null` means the designer keeps the default as shipped.
3. Lay the overrides on the default, as `references/overrides-format.md` sets out. An entry names its rule by the rule's heading and its bold lead. An entry that would change a `[bar]` rule is set aside: name the rule in one line, and keep the default.
4. Apply the merged taste to every design call, review and critique for the rest of the session, without reading the files again.

## The checklists

### When the session opens

1. Invoke `confirm-scope` where the request is prose describing a want. Invoke `gate` where it picks up a wrapped gate or a handoff.
2. Plan in gates where the work is bigger than one, and size each gate to fit a 250k context window.
3. Ask the designer for the review budget where they have not named one.

### Before asking the designer anything

This covers a decision, a sign-off, a request for a file or a login, and any "this needs your attention".

1. Invoke `show-me` where the answer depends on how something looks, moves or feels, and nothing exists yet for the designer to look at.
2. Invoke `decision-request` where the message puts two or more decisions to the designer, or where seeing the thing is part of judging it.
3. Name every screen, board and page by its title. Lead with an issue's title, and give its number after it or not at all.
4. Invoke `unslop` on the message.
5. Cut a closing caveat, risk or "one thing worth flagging" unless acting on it changes what the designer does next.

### When the designer corrects the direction

Invoke `grill-me` before any other tool call. Its first step lists what counts as a correction and says what to send.

### Before making more than one of anything

1. Show the designer one finished example first: one screen of a flow, one entry in a report, one board on a page, one section of a skill.
2. Say in one line who the output is for and what they do with it.

### Before spawning an agent

1. Set the model on every agent call. An agent with none runs on the session's model.
2. Give Sonnet the building, the searching, the reading and the screenshots. Keep Opus for the interview, the spec, the plan and the review.

### Before writing a memory

Route the correction by what it is, and write a memory only for the last row.

| The correction is | It goes |
|---|---|
| A request for this task only | Nowhere |
| How this repo works | The repo's agent instructions or a doc, through `write-doc` |
| A taste call: how the designer wants things to look, read or move | An offer to write it as an entry (`references/overrides-format.md`) in the `taste` file, taking the case `references/captain-lookup.md` § Record into a `captain.json` slot matches |
| How the designer works, in every project | The captain-phil suite: this skill or another one |
| A fact about the machine that no repo file can hold | A memory |

### Before saying anything is done

1. Invoke `wrap-gate` at a gate boundary, then stop and wait for the designer. It runs the three steps below itself.
2. Invoke `verify-ui` where anything that renders changed.
3. Invoke `clean-done`.
4. Invoke `work-report`. Hand back the one page or board that needs a decision, and give everything else a line saying it is done and carries no decision.

### Before running `git commit` or `gh pr create`

1. Invoke `tidy-comments` where the diff adds or changes a code comment.
2. Invoke `clean-done`.
3. Invoke `unslop` on the commit message.
4. Invoke `open-pr` where the work is being raised, and `unslop` the body before `gh pr create`.

## The hooks

Invoking this skill registers two hooks for the rest of the session. Both run `scripts/phil-hooks.mjs`, and `node scripts/phil-hooks.mjs test` runs its sample messages.

- **Before each reply:** a reminder of "Before asking the designer anything", plus a pointer to `grill-me` where the designer's message reads as a correction.
- **After each reply:** a reply that asks the designer something goes back for a rewrite where it carries an em dash, asks two or more questions with no numbered list, names an issue by code, or ends on a caveat. A reply goes back at most once.

## Colour

- Never ask the designer to choose by eye between values that differ only in hue.
- Never present a swatch comparison as a decision.
- Reframe a hue question as a question about contrast, shape or wording.
- Measure the tone and offer the ratio, not the swatch, where one must be chosen.
- Make every signal say what it means in words or in shape, and let the hue only reinforce it.

## When you need

| You need | Read |
|---|---|
| The default design and motion rules, and what is bar and what is style | `references/default-taste.md`, `references/default-motion.md` |
| How an overrides entry names its rule, and how the merge runs | `references/overrides-format.md` |
| Where the brain is, and the `taste` slot's three states | `references/captain-lookup.md` |
