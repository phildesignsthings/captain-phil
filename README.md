---
house_style: true
---

# captain-phil

Phil Davies's working defaults, packaged as agent skills that install into any repo. They plan longer work in gates that stop for review, ask for decisions and report finished work in one fixed shape each, and never call a screen rendered until something has looked at it.

## Install

Installing captain-phil takes two commands, not one. `npx skills add` installs skills and nothing else, and the host file is not a skill, so step 2 is a separate fetch. Skip it and every skill runs its own degraded fallback instead of reading the repo's answers.

### Step 1. The skills

Into one project:

```bash
npx skills add phildesignsthings/captain-phil --skill '*' --agent universal --agent claude-code -y
```

Globally, for every session on the machine:

```bash
npx skills add phildesignsthings/captain-phil -g --skill '*' --agent universal --agent claude-code -y
```

List what the repo publishes without installing any of it:

```bash
npx skills add phildesignsthings/captain-phil -l
```

Refresh every installed skill from `main`:

```bash
npx skills update -p -y
```

The installer writes `.agents/skills/<name>/` with a symlink from `.claude/skills/<name>/`, and records each skill's content hash in `skills-lock.json`.

**Name both `universal` and `claude-code`, and do not use `--all`.** The installer picks its layout from how many distinct directories it is writing to. Name one agent and it sees a single destination, skips the shared folder, and writes a real copy of every skill into `.claude/skills/` instead. Naming `universal` as well gives it the second directory it needs, so it writes each skill once and links to it. `--all` is shorthand for `--skill '*' --agent '*' -y`. That second wildcard installs into every agent the tool knows, not only the ones the repo uses, so it drops an unprefixed `agent/` folder for Eve into repos that do not use Eve.

### Step 2. The host file

Several skills need to know things only the repo can answer: which command starts the app, which branch a pull request goes to, where the design records live. The repo answers once in `.agents/host.json`, and every skill reads its answers by slot.

Three templates ship in `host/templates/`. Pick the one that matches the repo and paste its block. Each writes `.agents/host.json` and prints the name of the template it wrote, so you see a wrong pick straight away. Each refuses to overwrite an existing host file, because that file holds answers the template lacks. Move it aside first to start again.

**Expo, React Native.** Starts with `npx expo start --ios`, checks with `tsc --build` and `npx expo lint`, screens under `src/app/`, primitives under `src/components/ui/`.

```bash
(set -C; mkdir -p .agents && gh api repos/phildesignsthings/captain-phil/contents/host/templates/react-native-expo.json \
  --jq .content | base64 -d > .agents/host.json) && grep '"template"' .agents/host.json
```

**React on the web.** Starts with `npm run dev` on port 5173, adds a Prettier check, routes under `src/routes/`, shadcn components under `src/components/ui/`.

```bash
(set -C; mkdir -p .agents && gh api repos/phildesignsthings/captain-phil/contents/host/templates/react-web.json \
  --jq .content | base64 -d > .agents/host.json) && grep '"template"' .agents/host.json
```

**Anything else.** Sets the trunk to `main` and leaves every other slot empty, the checks included, rather than guessing them. Start here when no other template is close, then fill the slots the repo can answer.

```bash
(set -C; mkdir -p .agents && gh api repos/phildesignsthings/captain-phil/contents/host/templates/minimal.json \
  --jq .content | base64 -d > .agents/host.json) && grep '"template"' .agents/host.json
```

Open the file afterwards and correct the paths the repo does not match, most often `surfaces.root`, `components.dir` and `theme.dir`. Point the `checks` commands at scripts the repo really has. [The host file spec](host/README.md) gives each slot's meaning, the three states a slot can be in, and which skills read it.

A repo with no host file still works. Each skill names its fallback in its `compatibility` frontmatter, runs that degraded path, and offers once to write the answer into `.agents/host.json`.

## Gates

The suite assumes that anything longer than one session is planned as gates. A gate is one reviewable piece of work, sized to fit a single context window, and the designer reviews it before the next one starts.

- **`wrap-gate` closes a gate.** It runs the checks against their baselines, proves each changed screen rendered, and writes an entry to `gate-state.md` in the project's gitignored scratch folder. Then it stops for review.
- **`gate` opens the next one** in a fresh chat. It reads that record rather than the transcript, and refuses where the previous gate is not closed.

Each session works from that record, so none needs another session's transcript.

[Nightrun](https://github.com/phildesignsthings/nightrun) is the sister repo. It runs a gated plan unattended overnight, one fresh session per gate, and reads the same gate-state record to pick the next gate. Write each gate as a `## Gate <id>` heading and the plan runs either by hand or overnight.

## Skills

Each group names a moment. The five after Switching on are `captain-phil-mode`'s checklists, in the order a session reaches them, and each holds the skills its checklist calls. The other groups are moments in the project's own work. The heading says when a skill runs, and the row says what it does.

### Switching on

| Skill&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; | What it does |
|:---|:---|
| `captain-phil-mode` | Turns on Phil's working defaults: a checklist for each moment of a session that calls the right skill, and two hooks that keep the checklists running |
| `crewman` | Talks to you as Rodger, a pirate of Captain Phil's crew in 1716, for the rest of the session. Code, commands and files stay plain |

### Opening

| Skill&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; | What it does |
|:---|:---|
| `confirm-scope` | Reads an open-ended request back in a fixed template, asks only the questions that would change the approach, and waits for a go before building |
| `gate` | Opens the next gate in a fresh chat from the record the last one left, refuses if that gate is not closed, says in three lines what it will build, then builds |

### Asking

| Skill&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; | What it does |
|:---|:---|
| `show-me` | Builds options you can see, move or hold so you can explore a visual idea before choosing: Paper boards, an HTML page, sliders for motion, or a build on your phone |
| `decision-request` | Puts a decision to you as a link and numbered steps to reach the thing, never as a description of what you would see |
| `unslop` | Cuts the patterns that mark writing as machine-written, such as padding, hedges and forced groups of three |

### Correcting

| Skill&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; | What it does |
|:---|:---|
| `grill-me` | Interviews you about a plan or a design until every branch is settled. After a correction, it first says back what it thinks you want |

### Finishing

| Skill&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; | What it does |
|:---|:---|
| `wrap-gate` | Closes a gate for review: runs the checks, verifies the changed screens, posts a link to each, updates the gate record, and offers a handoff to a fresh chat |
| `verify-ui` | Proves a UI change rendered by looking at it in the browser or simulator and measuring it with a probe, then reports what it measured and what it did not |
| `clean-done` | Clears up before work is called done: stops the processes the session started for itself, reports each check once, and writes down anything that exists only in the chat |
| `work-report` | Turns finished work into a report you can skim on one screen: a verdict, a section per thing touched, a link to what needs review, and the next action |

### Committing

| Skill&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; | What it does |
|:---|:---|
| `tidy-comments` | Rewrites the code comments a change touched so they read plainly, deletes the ones that restate the code, and lists the other untidy comments in those files |
| `open-pr` | Opens or updates a pull request from the current branch: picks the base, runs the checks, fills the template for its audience with a verification table, and pushes review fixes to the same branch |

### Starting a product

| Skill&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; | What it does |
|:---|:---|
| `start-project` | Sets up a new product in the repo: a branch, the connectors, project notes from the existing material, the product record, the brand, and the first surface |
| `new-surface` | Scaffolds a new prototype or flow: asks the intake questions one at a time, agrees the design intent before any code, writes the folder and its records, and checks it renders |
| `receive-prototype` | Moves a prototype out of a design repo into a real application: keeps the parts with a contract, points the data at a real endpoint, strips the demo-only code, and proves each state still renders |

### Building

| Skill&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; | What it does |
|:---|:---|
| `new-screen` | Builds a screen inside an existing surface: proposes the layout, the density and one hero moment, waits for your nod, then builds all four data states |
| `add-primitive` | Installs a missing component from the component library and adds it to the repo's catalogue with a full spec sheet |
| `ingest-theme` | Turns a designer's theme export or brand colours into the repo's theme, registers it everywhere a theme has to appear, and checks it rendered |

### Designing

| Skill&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; | What it does |
|:---|:---|
| `paper` | Designs in Paper Desktop: reads the components the code already ships, builds boards section by section, screenshots each step, and works through the designer's comments |
| `get-creative` | Rolls dice to set the constraints for off-the-wall design directions, and shows you the directions before anything is built |
| `audit-design` | Scores a Paper page of boards against six criteria from the product record, and splits the findings into ones to fix and ones that need a call |
| `record-design` | Fills or refreshes a surface's design record from the screens it shipped, and files each rule it finds into the lessons file or the record |

### Investigating

| Skill&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; | What it does |
|:---|:---|
| `run-spike` | Answers a gate's questions by measuring before anything is built, and reports each answer as measured or not measured |
| `drift-check` | Lists where a built feature has grown past the scope agreed with the stakeholder: the screens, states and rules that cost more to build than the scope said |
| `workflow-reflection` | Reads someone's session transcripts for a project, then writes a one-pager of their method for the team and a private report on their patterns and gaps |

### Writing

| Skill&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; | What it does |
|:---|:---|
| `write-doc` | Writes or rewrites a doc, a skill or a project note in the right place and to house style, with each fact kept in one home |
| `freeze-memory` | Retires a project note that an external document has replaced, pointing it at the replacement and archiving it. Also reports which notes are ready to retire |

### Tracking status by hand

| Skill&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; | What it does |
|:---|:---|
| `ask-issue-status` | Asks whether any hand-tracked issue changed status, writes the answers back to the repo's list, and adds the changes to the pull-request body |

## Versioning

`main` means released. Develop on a branch, merge when a skill is finished, and every consumer's next `npx skills update -p -y` pulls the change.

**`update` refreshes the skills a repo installed. It does not add skills the suite gained since.** It walks the lock file, so it never sees a skill merged to `main` after the repo's install. A consumer picks up a new skill by running the install command again, which adds the missing folders and leaves the rest alone. Each release says which of the two its consumers need.

- **Version history** is the consuming repo's own git log. Commit `.agents/skills/` and `skills-lock.json`, and `git log -- .agents/skills` is the record of what changed when.
- **Rollback** is `git revert` in the consuming repo, not a flag on the installer.
- **Pinning** is not running `update`. The lock file records the hash a repo installed.
- **Never hand-edit an installed skill.** `update` reinstalls from source and overwrites the edit without warning. Fix it in this repo, merge to `main`, then `npx skills update -p -y`.

## Contributing

Run `npm run guard` before every commit. CI runs it again on every push and every pull request, but a failing run does not block a merge, because a private repo on a free personal account cannot protect a branch. Somebody has to read a red run.

The guard checks the skills index against the filesystem both ways, validates the three host templates against `host/host.schema.json`, ties each skill's `metadata.host` to the slots its body reads, fails any skill body outside `references/` that names a particular repo's paths, and runs the house style over every markdown file.

`AGENTS.md` holds the rules for an agent editing this repo. `CLAUDE.md` symlinks to it.

## Access

The repo is private under `phildesignsthings`. Coworkers who want the suite get read-only collaborator access, which lets `npx skills add` resolve the repo. This repo stays the only source, because `update` reinstalls every installed copy and a local edit does not survive it.
