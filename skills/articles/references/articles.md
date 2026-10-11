---
house_style: true
read_when:
  - "Somebody asks what the captain-phil skills are, what one of them does, or where to start"
  - "Somebody asks how gates work, or what the host file is for"
---

# The articles

captain-phil is Captain Phil's working defaults, packaged as agent skills. They plan longer work in gates that stop for review, ask for decisions and report finished work in one fixed shape each, and never call a screen rendered until something has looked at it.

This file is the suite's manual. It installs with the `articles` skill into every repo that has the suite. The suite's README holds the install commands, and this file holds the rest of what a user needs.

## Where to start

1. Invoke `captain-phil-mode` at the start of a session. It turns on checklists that call the matching skill before a question, a commit or a hand-back, so most skills run without being named.
2. Invoke `confirm-scope` with a request written in prose, where the mode is not on. It reads the request back and waits for a go.
3. Invoke a skill by name where the moment is clear, such as `open-pr` to raise the work or `verify-ui` to check a screen rendered.

## The host file

Several skills need to know things only the repo can answer: which command starts the app, which branch a pull request goes to, where the design records live. The repo answers once in `.agents/host.json`, and every skill reads its answers by slot.

- **A slot with a value** is the repo's answer, and the skill uses it.
- **A `null` slot** means the repo has none of that thing, so the skill skips the step and says so in one line.
- **An absent slot, or no host file at all,** means nobody answered. The skill runs the fallback its `compatibility` frontmatter names, and offers once to write the answer into the host file.

You fetch the host file separately from the skills, from one of three templates. [Step 2 of the README's install](https://github.com/phildesignsthings/captain-phil#step-2-the-host-file) holds the commands, and [the host file spec](https://github.com/phildesignsthings/captain-phil/blob/main/host/README.md) gives each slot's meaning and which skills read it.

## Gates

The suite plans anything longer than one session as gates. A gate is one reviewable piece of work, sized to fit a single context window, and the designer reviews it before the next one starts.

- **`wrap-gate` closes a gate.** It runs the checks against their baselines, proves each changed screen rendered, and writes an entry to `gate-state.md` in the project's gitignored scratch folder. Then it stops for review.
- **`gate` opens the next one** in a fresh chat. It reads that record rather than the transcript, and refuses where the previous gate is not closed.

[Nightrun](https://github.com/phildesignsthings/nightrun) is the sister repo. It runs a gated plan unattended overnight, one fresh session per gate, and reads the same gate-state record to pick the next gate. Write each gate as a `## Gate <id>` heading and the plan runs either by hand or overnight.

## Skills

Each group names a moment. The five after Switching on are `captain-phil-mode`'s checklists, in the order a session reaches them, and each holds the skills its checklist calls. The other groups are moments in the project's own work. The heading says when a skill runs, and the row says what it does.

### Switching on

| Skill | What it does |
|:---|:---|
| `captain-phil-mode` | Turns on Phil's working defaults: a checklist for each moment of a session that calls the right skill, and two hooks that keep the checklists running |
| `articles` | Explains the suite: what each skill does and the moment it runs, how gates work, and what the host file answers. Ask it where to start |
| `crewman` | Talks to you as Rodger, a pirate of Captain Phil's crew in 1716, for the rest of the session. Code, commands and files stay plain |

### Opening

| Skill | What it does |
|:---|:---|
| `confirm-scope` | Reads an open-ended request back in a fixed template, asks only the questions that would change the approach, and waits for a go before building |
| `gate` | Opens the next gate in a fresh chat from the record the last one left, refuses if that gate is not closed, says in three lines what it will build, then builds |

### Asking

| Skill | What it does |
|:---|:---|
| `show-me` | Builds options you can see, move or hold so you can explore a visual idea before choosing: Paper boards, an HTML page, sliders for motion, or a build on your phone |
| `decision-request` | Puts a decision to you as a link and numbered steps to reach the thing, never as a description of what you would see |
| `unslop` | Cuts the patterns that mark writing as machine-written, such as padding, hedges and forced groups of three |

### Correcting

| Skill | What it does |
|:---|:---|
| `grill-me` | Interviews you about a plan or a design until every branch is settled. After a correction, it first says back what it thinks you want |

### Finishing

| Skill | What it does |
|:---|:---|
| `wrap-gate` | Closes a gate for review: runs the checks, verifies the changed screens, posts a link to each, updates the gate record, and offers a handoff to a fresh chat |
| `verify-ui` | Proves a UI change rendered by looking at it in the browser or simulator and measuring it with a probe, then reports what it measured and what it did not |
| `clean-done` | Clears up before work is called done: stops the processes the session started for itself, reports each check once, and writes down anything that exists only in the chat |
| `work-report` | Turns finished work into a report you can skim on one screen: a verdict, a section per thing touched, a link to what needs review, and the next action |

### Committing

| Skill | What it does |
|:---|:---|
| `tidy-comments` | Rewrites the code comments a change touched so they read plainly, deletes the ones that restate the code, and lists the other untidy comments in those files |
| `open-pr` | Opens or updates a pull request from the current branch: picks the base, runs the checks, fills the template for its audience with a verification table, and pushes review fixes to the same branch |

### Starting a product

| Skill | What it does |
|:---|:---|
| `start-project` | Sets up a new product in the repo: a branch, the connectors, project notes from the existing material, the product record, the brand, and the first surface |
| `new-surface` | Scaffolds a new prototype or flow: asks the intake questions one at a time, agrees the design intent before any code, writes the folder and its records, and checks it renders |
| `receive-prototype` | Moves a prototype out of a design repo into a real application: keeps the parts with a contract, points the data at a real endpoint, strips the demo-only code, and proves each state still renders |

### Building

| Skill | What it does |
|:---|:---|
| `new-screen` | Builds a screen inside an existing surface: proposes the layout, the density and one hero moment, waits for your nod, then builds all four data states |
| `add-primitive` | Installs a missing component from the component library and adds it to the repo's catalogue with a full spec sheet |
| `ingest-theme` | Turns a designer's theme export or brand colours into the repo's theme, registers it everywhere a theme has to appear, and checks it rendered |

### Designing

| Skill | What it does |
|:---|:---|
| `paper` | Designs in Paper Desktop: reads the components the code already ships, builds boards section by section, screenshots each step, and works through the designer's comments |
| `get-creative` | Rolls dice to set the constraints for off-the-wall design directions, and shows you the directions before anything is built |
| `audit-design` | Scores a Paper page of boards against six criteria from the product record, and splits the findings into ones to fix and ones that need a call |
| `record-design` | Fills or refreshes a surface's design record from the screens it shipped, and files each rule it finds into the lessons file or the record |

### Investigating

| Skill | What it does |
|:---|:---|
| `run-spike` | Answers a gate's questions by measuring before anything is built, and reports each answer as measured or not measured |
| `drift-check` | Lists where a built feature has grown past the scope agreed with the stakeholder: the screens, states and rules that cost more to build than the scope said |
| `workflow-reflection` | Reads someone's session transcripts for a project, then writes a one-pager of their method for the team and a private report on their patterns and gaps |

### Writing

| Skill | What it does |
|:---|:---|
| `write-doc` | Writes or rewrites a doc, a skill or a project note in the right place and to house style, with each fact kept in one home |
| `freeze-memory` | Retires a project note that an external document has replaced, pointing it at the replacement and archiving it. Also reports which notes are ready to retire |

### Tracking status by hand

| Skill | What it does |
|:---|:---|
| `ask-issue-status` | Asks whether any hand-tracked issue changed status, writes the answers back to the repo's list, and adds the changes to the pull-request body |

## Keeping the suite current

Never hand-edit an installed skill, because the next update overwrites the edit without warning. A fix goes into the suite's own repo and reaches every consuming repo on its next update. [The README's Versioning section](https://github.com/phildesignsthings/captain-phil#versioning) holds the update command, and says why an update never adds a skill the suite gained since the install.
