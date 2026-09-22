---
house_style: true
read_when:
  - "A consuming repo is being wired to the suite for the first time"
  - "A skill reports a slot as unanswered and offers to write the answer"
  - "A slot has to be added, renamed or retired"
  - "A skill's `compatibility` line has to be written"
---

# The host file

A portable skill never names a host repo's paths. The consuming repo answers a fixed questionnaire
once in `.agents/host.json`, and every skill reads its answers by slot.

## Where it lives

The file sits at `.agents/host.json` in the repo root. A script finds it by walking up from the
working directory, so a skill invoked from a subfolder reads the same answers as one invoked from the
root. A monorepo carries one file at its root and answers `dev.cwd` and `checks.cwd` with the package
that runs.

Fill it by fetching a template and editing it. The templates live beside the skills in captain-phil
rather than inside them, so an install does not put them in the consuming repo:

```bash
mkdir -p .agents && gh api repos/phildesignsthings/captain-phil/contents/host/templates/minimal.json \
  --jq .content | base64 -d > .agents/host.json
```

`host/templates/` carries four filled starting points: `minimal`, `react-web`,
`react-native-expo` and `ideation-sandbox`. Each one declares the template it came from in its
`template` field, so a suite update can tell what a repo started from.

## The three-state rule

Every slot has three states, and the difference between the second and the third is the whole point
of the file.

| State | What it means | What the skill does |
|---|---|---|
| Present, carrying a value | The repo answered | Use it. Never guess over an answer. |
| Present, set to `null` | The repo has none of that thing | Skip the step, say so in one line, and never ask. |
| Absent, or no host file at all | Nobody answered | Run the skill's `compatibility` fallback, then offer to write the answer into `.agents/host.json`. |

A `null` is an answer. A skill that asks about a `null` slot is broken, because the repo already said
it has none — and being asked the same question every session is how a suite gets uninstalled.

## The schema

`host/host.schema.json` is JSON Schema draft-07, and every slot's meaning is its `description`
field. Read the schema for the definition of a slot; read the table under *The groups* for who
consumes it.

Three rules the schema enforces:

- Every group sets `additionalProperties: false`, so a misspelled slot fails validation rather than
  reading as absent.
- Every leaf accepts `null` alongside its type, so a repo can answer "we have none".
- Every group is optional, so a repo answers what it knows and leaves the rest absent.

**The schema does not travel with the host file, and a skill that writes a slot back has to carry
the shape itself.** A template's `$schema` is a relative path valid inside this repo and nowhere
else: a consuming repo copies the template to `.agents/host.json`, the path resolves to nothing, and
nothing tells an editor or an agent what a value has to look like. Two slots hold structured values rather
than strings — `records.design` and every entry under `checks` — so a skill that appends to one
prints the shape in its own body. Driven without that, an agent wrote `records.design` as a list of
paths, which the schema types as objects, and nothing in the consuming repo said otherwise.

The file is JSON rather than YAML or markdown for two reasons. Scripts parse it with the standard
library and no dependency — `wrap-gate/scripts/check-baseline.mjs` reads `checks` and writes
baselines back under `--record`. A guard validates it against a schema.

## The groups

Every slot below names the skills that read it. A slot no skill reads is a slot to delete.

| Slot | Read by |
|---|---|
| `dev.cwd`, `dev.start`, `dev.url` | `verify-ui`, `decision-request`, `wrap-gate`, `add-primitive` |
| `dev.platform` | `verify-ui`, `new-screen` |
| `checks.cwd`, `checks.typecheck`, `checks.lint`, `checks.test`, `checks.format` | `wrap-gate`, `clean-done`, `open-pr` |
| `checks.guard` | `wrap-gate`, `write-doc`, `freeze-memory`, `ingest-theme` |
| `git.trunk`, `git.release`, `git.engagementBranch` | `open-pr`, `start-engagement` |
| `git.doc` | `open-pr`, `ask-issue-status` |
| `docs.root`, `docs.index` | `write-doc` |
| `docs.glossary` | `write-doc` |
| `docs.gotchas` | `new-screen`, `record-design`, `audit-design` |
| `docs.local` | `ask-issue-status`, `paper`, `start-engagement` |
| `docs.retired` | `write-doc`, `freeze-memory` |
| `records.product` | `audit-design`, `ingest-theme`, `start-engagement` |
| `records.productTemplate` | `start-engagement` |
| `records.design` | `record-design`, `paper`, `receive-prototype` |
| `records.designDoc` | `record-design` |
| `records.driftWatch` | `record-design` |
| `memory.root`, `memory.archive`, `memory.doc` | `write-doc`, `freeze-memory` |
| `memory.gloss` | `write-doc` |
| `memory.connectors` | `new-surface`, `start-engagement` |
| `issues.tracker`, `issues.ladder`, `issues.ask`, `issues.retired` | `ask-issue-status`, `new-surface`, `start-engagement` |
| `issues.doc` | `ask-issue-status`, `open-pr` |
| `verify.mcp` | `verify-ui`, `wrap-gate`, `decision-request`, `add-primitive` |
| `verify.probes`, `verify.agent` | `verify-ui`, `record-design` |
| `verify.doc` | `verify-ui`, `open-pr` |
| `theme.dir`, `theme.registry`, `theme.contract`, `theme.generator` | `ingest-theme`, `new-surface` |
| `theme.doc` | `ingest-theme`, `record-design`, `paper` |
| `components.dir`, `components.install` | `add-primitive`, `new-screen` |
| `components.registry`, `components.showcase` | `add-primitive` |
| `components.doc` | `add-primitive`, `paper` |
| `surfaces.root`, `surfaces.unit`, `surfaces.route` | `new-surface`, `new-screen`, `record-design` |
| `surfaces.doc` | `new-surface`, `record-design` |
| `surfaces.compositionDoc` | `new-screen` |
| `surfaces.limits` | `new-screen`, `new-surface` |
| `surfaces.seam`, `surfaces.harnessMarkers`, `surfaces.receiveDoc` | `receive-prototype`, `new-surface` |

## How a skill declares what it reads

A skill that reads any slot carries two frontmatter fields. `compatibility` states the fallback in
prose a human reads; `metadata.host` lists the slots a machine can check.

```yaml
compatibility: >-
  Reads dev.start, dev.url, verify.mcp and verify.probes from .agents/host.json. Without
  verify.probes, every number is reported as looked at rather than measured.
metadata:
  suite: captain-phil
  host: [dev.start, dev.url, verify.mcp, verify.probes]
```

The guard ties the three together: every `` `group.slot` `` written in a skill's body must exist in
the schema and appear in that skill's `metadata.host`, and a skill declaring any slot must carry a
`compatibility` line. A skill whose body reads a slot its frontmatter does not declare is a skill
whose fallback nobody wrote.

## Adding a slot

1. Add the leaf to `host/host.schema.json` under its group, accepting `null` alongside its type.
2. Write its `description` as the definition a reader arrives wanting, rather than a restatement of
   its name.
3. Add its row to *The groups*, naming every skill that reads it.
4. Add the slot to each of those skills' `metadata.host`, and state the fallback in
   `compatibility`.
5. Fill the slot in all four templates, using `null` where the template's repo kind has none.
6. Run `npm run guard`, which fails on a slot the schema does not know and on a template that does
   not validate.

Adding a group follows the same six steps and one more: set `additionalProperties: false` on it, so
the next misspelling fails loudly.

## The generic-versus-host test

Apply this to every sentence in a portable skill: would the rule hold in a repo that shares none of
this one's files?

- **Yes** — bundle it in the skill's own `references/` folder, and the skill reads it off disk.
- **No** — cite the host file by slot, and state what happens when the slot is `null` or absent.

The test decides where a rule lives, and the guard enforces the consequence: a skill body outside
`references/` that names a specific repo's path fails `checkNoHostPaths`.
