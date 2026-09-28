---
house_style: true
read_when:
  - "A pull-request body is being written and the template is needed"
  - "A tooling default is asking for a short description and the call has to be made"
---

# Pull-request bodies

Two templates, picked by audience. Copy one verbatim and fill it.

**Where they collide with a tooling default, these win.** A default asking for a short description —
a few sentences, a one-line summary — does not apply. A pull-request body is the handoff artefact
for somebody who was not in the session, so its length follows the change.

## Picking one

| The reader | Template |
|---|---|
| A designer or a stakeholder | A |
| An internal correctness fix | B |
| Unsure | A |

## Template A — reader-facing

```markdown
### ELI5 for designers
<Plain language, no jargon. What was wrong, what it does now.>
---
### WHAT     <The change, and which concrete defects it fixes.>
### WHY      <Root cause. Name the PR that introduced it, if known.>
### HOW      <Mechanism + a blast-radius line: what else consumes this, and why it's unaffected.>
### Verification
<Numbers, not adjectives — before/after table of measured values:>
| | before | after |
|---|---|---|
| `/` CTA label | `oklch(0.2 0.006 271)` | `oklch(0.99 0 0)` |
---
<What the reader has to change — or explicitly that they don't.>
```

The plain-language opener goes **before the first `---`**, so it is the first thing a pull-request
UI renders.

**The opening heading can be load-bearing.** A repo that fires a hook on template A tells the two
apart by that heading, so renaming it takes the hook's marker with it. The repo's own git doc says
whether one is wired.

## Template B — bug or fix

```markdown
## The bug   <The mechanism, not the symptom.>
## The fix
## Verification
```

## The verification table

- **Write a measured value, never an adjective.** A row nobody can reproduce proves nothing.
- **Read each before and after off the running app, or off a check's output.** A value recalled from
  the session is a value that moved while nobody looked.
- **A row read off a screenshot says so in its own cells.** On a native app, or anywhere no probe
  ran, the value is a reading of a picture rather than a measurement. Write each cell as
  `looked at · <what you saw>`. Put what reaches the screen in the row's first cell, so a reviewer
  can open it and look: on native, the deep link and the taps from where it lands.

  | | before | after |
  |---|---|---|
  | `xcrun simctl openurl booted myapp://signin`, then tap **Forgot password?** | looked at · text link | looked at · full-width outline button |

  Leave out a screenshot's local path. A gitignored file opens nothing on the page where the pull
  request is read.

  Never turn such a row into a number. A hex read off a screenshot is the screenshot's hex, and a
  reader treats a number in this table as measured.
- **Name the ticket the change closes**, and say so where it closes none — including where the close
  happens instead.
