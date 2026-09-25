---
name: decision-request
description: >-
  How to put a decision to the designer when the answer depends on them LOOKING at something — a
  rendered screen, a diff, two candidate layouts, a chart. Produces a link plus numbered repro
  steps per decision, never a prose description of what they would see.
when_to_use: >-
  Use this whenever you are about to ask the designer to choose, approve, rule on, sign off,
  pick between options, or confirm a direction, and seeing the thing is part of judging it —
  including mid-gate questions, not just gate wraps. Also use it when you catch yourself writing
  "the X looks like Y" or "you'll see that…" in a question, because that sentence is the thing
  this skill replaces.
compatibility: >-
  Reads dev.start, dev.url, dev.platform and verify.mcp from .agents/host.json. Without them, start
  the server the way the repo's readme says and drive every path in a browser before quoting it.
  With dev.platform native, a deep link off dev.url plus the taps and a screenshot path stands in
  for the URL. With dev.url absent on native, the scheme comes from the app's config as in
  verify-ui's step 1; with it null, every screen is reached by taps from launch.
metadata:
  suite: captain-phil
  host: [dev.start, dev.url, dev.platform, verify.mcp]
---

# Asking for a decision

A decision you describe in prose is a decision the designer has to take on trust. A decision they
can reproduce in ten seconds is one they can actually make. This skill is the format that
difference produces.

It applies when **seeing the thing is part of judging it** — a screen, a layout, a diff, a
measured value on a rendered page.

**It applies to any ask carrying more than one call**, whether or not each one needs looking at.
The numbered blocks are what let the designer answer by number rather than write prose back, and
an ask that buries three decisions in paragraphs gets one of them answered. A single question
settled by reasoning alone ("Postgres or MySQL?") is a plain question and needs no ceremony.

## The rule underneath everything else

**Drive the path yourself before you quote it.** Open the app, follow your own instructions, and
confirm the thing is where you say it is. A drifted click path is worse than no instruction: the
designer follows it, sees nothing, and reasonably concludes the finding was wrong. Then you have
spent their trust and still not got a decision.

Drive it against the running dev server with whichever harness the repo declares in
`verify.mcp`, started by `dev.start` and reached at `dev.url`. Where the repo answers none of the
three, start the server the way its readme says and drive the path in a browser. Quote the port the
server **actually bound**, never the one the config asks for: a dev server walks up from its default
whenever another one holds the port, and a link to the wrong port looks like a broken app.

**Where `dev.platform` is `native`, there is no URL to click.** Drive the path on the simulator
instead, and give the designer three things in the place of a link:

- The deep link, built from `dev.url` and the route, as the command that opens it:
  `xcrun simctl openurl booted myapp://settings`.
- The taps from where that link lands, written the same way as the clicks below.
- The path of the screenshot you took at the end of the taps, so the designer can judge the decision
  before booting anything. The screenshot goes beside the steps, never in their place.

## The second rule — the record may already answer it

**Read the record the question belongs to before you write a decision block.** A ruling already
made costs the designer the same decision twice, and reopening one is worse than not asking, because
the designer cannot tell whether the record was read or ignored.

1. Read the surface's `DESIGN.md` § Named Rules, and `docs/local/` where the branch keeps its open
   decisions, for anything the question touches.
2. Read every note frame on the Paper page the work came from. `get_basic_info` lists them by name,
   so finding them is one call — a `CHANGED` or `Note ·` frame carries a decision, and a `GAP ·`
   frame carries what nobody has decided plus, often, the way the boards drew it anyway.
3. Report what a record already settles as a **finding**, and drop the decision block. A ruling read
   off a record is not a call to make.
4. Put only what no record covers to the designer.

## The shape

Lead with one line stating the server is up and that you drove the paths. Then:

### Setup, once

Only if two or more decisions share a starting state. One URL, then the clicks to reach it.

```markdown
## Setup (once, for all three)

1. Open **http://localhost:3000/teams/northside/settings**
2. Click **Edit** (top right, the only `Edit` on the screen)
```

Disambiguate the control the way that parenthetical does. "Click Edit" is useless on a screen with
six of them.

### One block per decision

Number them so they can be answered by number. Each block is three parts, in this order:

```markdown
## Decision 1 · Where a validation error goes

**See the defect:**

- In `Twilight starts`, type `half four` → press Tab
- Nothing happens. The words stay. No message, no mark.
- Same in `Cart fee` — type `free`, Tab

**What's actually going on:** the parser silently returns null. The section just never
ticks, and nothing tells you why.

**The choice:**

- **A — message under the field** *(my rec)*
- **B — one message in the aside footer**, like the pass builder does
- **Talk it through** — park it, and I'll open the thread rather than build either
- B is the only precedent we have. It works there because the builder is one step
  with the footer 100px away.
- This document is ~25 fields over ~3000px. A footer naming a field you can't see
  isn't recovery.
```

- **See it** — numbered or bulleted actions, and *what they will see*. Stating the expected
  observation is what makes a mismatch legible as a mismatch rather than as their mistake.
- **What's actually going on** — one or two sentences of mechanism. Skip it when the repro is
  self-evident.
- **The choice** — the options, then the reasoning. Mark your recommendation `*(my rec)*` and
  commit to one. A survey of equally-weighted options pushes the work back onto them.
- **Talk it through** — the last option on every block, worded the same way every time, and never
  the recommendation. It exists so a designer who does not accept the framing can say so in one
  word instead of writing prose back at you.

Where they pick **Talk it through**, build nothing and open the thread. Where the thread does not
settle in that sitting, write the decision into the branch's open-decisions file in `docs/local/`
with what each option costs, and say you have done it. A parked decision nobody recorded returns as
the same question a fortnight later.

Drop **See it** where the decision needs no looking — a scoping call, a route between two
procedures, a question about what a record holds. The numbered block, the mechanism and the
recommendation all stay: they are what makes the call answerable in one word.

### The trailer

Things they need to know that are **not** decisions go last, under their own heading, so the
decisions above stay clean. Give them repro steps too — the standard does not relax because
you are not asking for a ruling.

Close with the file path where the full reasoning lives, if there is one.

## Writing it

- **Scannable bullets, short sentences.** One idea per bullet. Prose paragraphs are for a genuine
  argument that needs connective tissue; nothing above qualifies.
- **No internal IDs in the ask.** Do the tracker or project-notes lookup yourself and state the
  finding plainly, then put the citation wherever the repo keeps its own notes.
- **Say what a result means**, not only what it was. "All four measure 32px" earns "every text
  field beside them is 44px — the two boxes don't match."

## Reaching state that has no URL

Session state, a record switcher, a popover: say plainly that there is no direct link, then give
the clicks. Do not imply a deep link exists.

```markdown
There's no direct link — the selected team is session state, not a URL param.

1. Open **http://localhost:3000/teams/northside/settings**
2. Click the team switcher top-left (`Northside`) → **Willow Bend**
3. Scroll to `Billing and ownership`
```

If a screenshot genuinely is the only way — a transient state, a hover, an animation frame — give
the file path **as well as** the steps, never instead of them.

## Before you send

- Every note frame on the page was read, and nothing being asked is a question a sticky answers.
- Every link opens, on the port the server actually bound. On native, every deep link was opened
  on the simulator, and every screenshot path exists.
- Every click path was driven, not remembered.
- Every decision has a recommendation, and a **Talk it through** option under it.
- Nothing in the ask is a description of something they could have looked at instead.
