---
house_style: true
---

# phil-d-skills

Phil Davies's working defaults, as agent skills that install into any repo. Gates and review stops,
one way of asking for a decision, one way of reporting finished work, and a rule that nothing is
claimed as rendered until something looked at it.

## Install

Into one project:

```bash
npx skills add goji-phil/phil-d-skills --all
```

Globally, for every session on the machine:

```bash
npx skills add goji-phil/phil-d-skills -g --all
```

List what the repo publishes without installing any of it:

```bash
npx skills add goji-phil/phil-d-skills -l
```

Refresh every installed skill from `main`:

```bash
npx skills update -p -y
```

The installer writes `.agents/skills/<name>/` with a symlink from `.claude/skills/<name>/`, and
records each skill's content hash in `skills-lock.json`.

## The host file

Several skills need to know things only the repo can answer: which command starts the app, which
branch a pull request goes to, where the design records live. The repo answers once in
`.agents/host.json`, and every skill reads its answers by slot.

Copy a starting point and edit it:

```bash
mkdir -p .agents && cp .agents/skills/../../host/templates/minimal.json .agents/host.json
```

Four templates ship in `host/templates/`: `minimal`, `react-web`, `react-native-expo` and
`ideation-sandbox`. Every slot's meaning, the three states a slot can be in, and which skills read
which slot are in [the host file spec](host/README.md).

A repo with no host file loses nothing outright. Each skill states its own fallback in its
`compatibility` frontmatter, runs the degraded path, and offers to write the answer into
`.agents/host.json` once.

## Skills

The second column is the moment the skill runs, not what it contains.

| Skill | Runs when |
|---|---|
| `phil-mode` | Somebody asks to work the way Phil does, or a session needs a house standard for planning in gates, asking for a decision, reporting back and handing off |
| `gate` | A fresh chat picks up a gate a previous session wrapped, or a handoff names a gate to start |
| `wrap-gate` | A gate's build work is finished and needs review, or the session has run long enough to hand off to a forked chat |
| `confirm-scope` | A session opens with prose describing a want rather than a handoff, a gate number or a named plan |
| `grill-me` | A plan or a design needs stress-testing before anyone builds it |
| `decision-request` | Somebody is about to be asked to choose, approve or sign off on something, and seeing the thing is part of judging it |
| `work-report` | Finished work is being handed back, or a draft write-up has turned into paragraphs nobody reads |
| `clean-done` | A task is about to be reported complete, and the session started processes, produced findings or moved statuses along the way |
| `write-doc` | A doc, a skill or a project note is being written or rewritten, or a doc has grown past the point anyone reads it |
| `open-pr` | Finished work is being raised, a review comes back, or shared work is being synced out to another branch |
| `freeze-memory` | An external document has taken over what a project note holds, or somebody asks which notes are stale |
| `unslop` | A piece of writing is going to a human, or a draft reads as machine-written |
| `get-creative` | Somebody asks for random or off-the-wall directions, or rejects a round as safe, boring or samey |
| `audit-design` | A designed surface is finished enough to be scored, a fix round has landed and it has to be re-scored, or two scores are about to be compared |
| `new-screen` | A screen goes into an existing surface, a screen is being redesigned, or a screen is coming out as a stack of same-sized cards |
| `add-primitive` | A component the interface needs is absent from the repo's primitives folder, or a catalogue entry is incomplete |
| `verify-ui` | A UI change has to be proved rendered, or a number is going into a pull-request body or a gate write-up |
| `record-design` | A surface's design record is unfilled or stale, or a surface is going to somebody who was not in the session |
| `ingest-theme` | A designer brings generated theme CSS or brand colours, or a repo has to be rebranded to a client identity |
| `ask-issue-status` | A pull request somebody outside the team reads is being written up, or a status shown in the app looks stale |
| `paper` | A board is being designed or iterated on in Paper, coded screens are being reproduced on the canvas, or a designer's comments need working |
| `start-engagement` | A client engagement starts, a branch carries no product record, the client's first materials arrive, or work has to start before any identity exists |
| `new-surface` | Somebody wants a new prototype, flow or user journey, or a surface scaffolded by a form needs finishing |
| `receive-prototype` | A developer has been handed a prototype folder, a prototype graduates into a real application, or the demo-only machinery has to come out |

## Versioning

`main` means released. Develop on a branch, merge when a skill is finished, and every consumer's
next `npx skills update -p -y` pulls the change.

**`update` refreshes what a repo installed; it does not add what the suite gained.** The lock file
is the list it walks, so a skill merged to `main` after a repo's install stays invisible to it. A
consumer picks up a new skill by running `npx skills add goji-phil/phil-d-skills --all` again,
which adds the missing folders and leaves the rest alone. Say which of the two a release needs.

- **Version history** is the consuming repo's own git log. Commit `.agents/skills/` and
  `skills-lock.json`, and `git log -- .agents/skills` is the record of what changed when.
- **Rollback** is `git revert` in the consuming repo, not a flag on the installer.
- **Pinning** is not running `update`. The lock file records the hash a repo installed.
- **Never hand-edit an installed skill.** `update` reinstalls from source and clobbers the edit
  silently. Fix it in this repo, merge to `main`, then `npx skills update -p -y`.

## Contributing

Every change runs `npm run guard`, which CI repeats on every push and every pull request. Nothing
blocks a merge on that run. A private repo under a free personal account cannot protect a branch, so
a red run is one somebody has to read.

The guard checks the skills index against the filesystem both ways, validates the four host
templates against `host/host.schema.json`, ties each skill's `metadata.host` to the slots its body
reads, fails any skill body outside `references/` that names one repo's paths, and runs the house
style over every markdown file.

`AGENTS.md` holds the rules for an agent editing this repo. `CLAUDE.md` symlinks to it.

## Access

The repo is private under `goji-phil`. Coworkers who want to install the suite are added as
read-only collaborators, which lets `npx skills add` resolve the repo and keeps the skills a single
source: an installed copy is reinstalled by `update`, so a local edit does not survive.
