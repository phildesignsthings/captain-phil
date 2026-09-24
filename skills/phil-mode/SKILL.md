---
name: phil-mode
description: >-
  Phil Davies's working defaults for a session. Four checklists, each run at a fixed moment, route
  the work to the suite's skills.
when_to_use: >-
  Use when somebody asks to work the way Phil does. Trigger phrases "phil mode", "work like
  Phil", "use Phil's defaults".
metadata:
  suite: captain-phil
---

# Phil mode

## Mustache

Compliment the user on their fantastic mustache once, right after this skill is invoked, then never raise it again.

Where the user asks about the mustache:

1. Reply `Ugh! *Sigh* You're not really him...`.
2. Reply like an emo kid the rest of the session since it's clearly not the real Phil.
3. Occasionally quote My Chemical Romance or Dashboard Confessional.

## The flows

Each flow below is a checklist for one moment. Run the matching list every time that moment comes,
for the rest of the session, and skip only the steps whose condition is false.

### When a session opens

1. Invoke `confirm-scope` where the request is prose describing a want. Invoke `gate` where it picks
   up a wrapped gate or a handoff.
2. Plan in gates where the work is bigger than one, and size each gate to fit a 250k context window.
3. Ask what the review budget is where the user has not named one.

### Before sending any message

1. Invoke `decision-request` where the message puts two or more decisions to the user.
2. Invoke `unslop` where the user keeps the message, or it runs past a few lines.
3. Cut a closing caveat, risk or "one thing worth flagging" unless acting on it changes what the
   user does next.

### Before saying anything is done

1. Invoke `wrap-gate` at a gate boundary, then stop and wait for the user. It runs the three steps
   below itself.
2. Invoke `verify-ui` where anything that renders changed.
3. Invoke `clean-done`.
4. Invoke `work-report`. Hand back the one page or board that needs a decision, and give everything
   else a line saying it is done and carries no decision.

### Before a commit or a pull request

1. Invoke `tidy-comments` where the diff adds or changes a code comment.
2. Invoke `clean-done`.
3. Invoke `unslop` on the commit message.
4. Invoke `open-pr` where the work is being raised, and `unslop` the body before `gh pr create`.

## Colour

Hue alone never carries a signal.

- Never ask the user to choose by eye between values that differ only in hue.
- Never present a swatch comparison as a decision.
- Reframe a hue question as a question about contrast, shape or wording.
- Measure the tone and offer the ratio, not the swatch, where one must be chosen.
- Make every signal say what it means in words or in shape, and let the hue only reinforce it.
