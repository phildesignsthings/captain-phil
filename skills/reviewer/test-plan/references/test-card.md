---
house_style: true
read_when:
  - "`test-plan` is about to write a test card"
  - "A pass line has to be made measurable"
  - "The build has no browser, and its flows are terminal commands"
  - "A source is missing what a field needs, and the card has to bounce"
---

# The test card

The test card is the file a build aims at and a review judges against. It is written before the build, read by someone who was not there when it was written, and never edited by the change it judges.

## The fields

Every field is required unless it is marked optional. A field nobody can fill is a question for the designer, never a guess.

```yaml
product: <the products entry's name in captain.json>
source: <path to the plan, gate or spec the flows trace to>
build: <branch, commit or deployed URL>   # never the main checkout
workdir: <worktree path>                  # where the run happens, never the main checkout
start: host file                          # the host file's dev.start, dev.cwd and dev.url,
                                          # or a literal command plus the URL to health-check
tier: smoke                               # smoke | explore
flows:
  - name: <short name>
    traces_to: <the line in the source that promises this>
    steps: <what to do, in order>
    pass: <what must be true, measurable>
out_of_scope: <what is not tested, in plain words>
budget: <explore only: minutes or turns, then stop and report>
```

- **`build`** names what the review will pin to one commit. A branch is fine at plan time, because the review records the SHA it read.
- **`start: host file`** means `qa-run` resolves `dev.start`, `dev.cwd` and `dev.url` through the lookup. Where the host file has no `dev.start`, write the literal command and the URL it serves.
- **`tier`** is `smoke` for scripted checks that run on every change, and `explore` for a budgeted look that can find problems but never return a pass.
- **`traces_to`** is what lets the review tell a missing behaviour from an extra one.

## A measurable pass line

A pass line names a thing a script or a reader can check, and the value it must have.

| Instead of | Write |
|---|---|
| The page works | `GET /settings` returns 200, and the heading reads `Settings` |
| The toggle saves | After a reload, the toggle's `aria-checked` is `true` |
| It is fast | The list of 500 rows renders in under 1 second, timed from navigation start |
| No errors | The console logs 0 errors on the route, and the axe run reports 0 violations |
| The tests pass | `checks.test` exits 0, and its count is at or above the baseline |

Each pass line holds one check. Two conditions joined by "and" are fine when they describe one state; two states are two flows.

## A build with no browser

A package, a script or a server with no UI still gets flows. Each step is a terminal command, and each pass line is an exit code, an output line, a count or a number with the tool that measured it.

```yaml
flows:
  - name: parser rejects an empty file
    traces_to: "Gate 2: an empty input fails with a clear message"
    steps: run `node bin/parse.mjs fixtures/empty.txt`
    pass: exits 1, and stderr contains `empty input`
  - name: change stays inside the package
    traces_to: "Gate 2: only the parser changes"
    steps: run `git diff --name-only <base>...<build>`
    pass: every path starts with `packages/parser/`
```

## The obvious failure

Add one flow for the way the feature most plainly fails, where the source covers that case: bad input, an empty state, no network, a list longer than the screen. Where the source says nothing about it, list it under `out_of_scope` instead, so the review does not hold the build to a promise nobody made.

## The bounce

Where the source leaves a field unfillable, ask in one message naming each field and what it needs, and write nothing:

> The test plan needs two things the plan does not say: `start` (how the app runs, since the host file has no `dev.start`) and what done looks like for the export flow. What are they?

## What the card is not

- **Not a copy of the plan.** It holds checks and the line each one traces to, never the decisions themselves.
- **Not on the build's branch.** A file the change can edit cannot judge it.
- **Not a place for opinion.** A behaviour the source does not promise has no flow, however much it would help.
