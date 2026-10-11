---
name: start-project
description: >-
  Set up a new product in this repo: branch from the trunk, wire the connectors, digest
  the material that already exists into the project notes, write the product record, ingest the
  brand or record it as pending, scaffold the first surface, and seed its issue ladder.
when_to_use: >-
  Use when a new product or project starts in the repo, when the repo carries no product record,
  when the first brief, deck or research arrives, when work has to start unbranded because no
  identity exists yet, or when somebody asks where a new project's work is meant to live. Trigger
  phrases "start a new project", "set up a new product", "kick off the project", "here is the
  brief", "stakeholders sent us their deck", "we have no brand yet", "where does this work go".
compatibility: >-
  Reads git.trunk, git.release, git.doc, memory.root, memory.connectors, memory.doc,
  records.product, records.productTemplate, theme.registry, issues.tracker,
  issues.ladder, issues.doc, issues.retired and checks.guard from .agents/host.json. With
  memory.root null there are no project notes, so steps 2 and 3 do not run and the product record
  comes from the interview alone. With records.product null the repo has no product record yet,
  which is the absence step 4 exists to end: the path is agreed in one question and written back
  into the host file. With records.productTemplate absent the record is filled from
  assets/product-record.template.md. With theme.registry null the repo lists no themes and step 5
  asks only whether an identity exists. With issues.ladder null, or issues.retired true, step 7
  does not run.
metadata:
  suite: captain-phil
  host: [git.trunk, git.release, git.doc, memory.root, memory.connectors, memory.doc, records.product, records.productTemplate, theme.registry, issues.tracker, issues.ladder, issues.doc, issues.retired, checks.guard]
---

# Start a project

Run the seven steps in order. Steps 2 and 3 fill the project notes under `memory.root`, and every later step reads what those two wrote.

**Three steps have a route for when their input does not exist yet, and each route is a normal path.** Step 3 handles a project with nothing to ingest, step 5 one with no identity, and step 7 one with no tracker project. A project running unbranded against half-empty notes is early, not abandoned.

## 1. Branch from the trunk

1. Confirm the trunk is current: `git fetch origin && git log -1 --format=%cr origin/<git.trunk>`.
2. Branch from `git.trunk`, and never from `git.release` where the repo separates the two. Read `git.doc` for which branch owns what before cutting anything.
3. Name the branch the way the branch list already does, and agree the name with the designer in one question where no convention shows.
4. Push it: `git push -u origin <branch>`. The setup lands through `open-pr` like any other work.

## 2. Wire the connectors

The connectors come before anything that reads them. Every later step queries the tracker, the meeting recorder or the chat tool, and none of them can run against a placeholder.

1. Replace every placeholder in `memory.connectors` with a real id.
2. Record the tracker's team, project name and project id, plus the ids of the documents the project reads from.
3. Copy a project link in the form the tool hands out rather than assembling one. A link whose slug ends in a hash nothing derives is a link step 7 can only paste.
4. Record the meeting folder and the chat channels.
5. Delete a connector block the project does not use, rather than leaving its placeholders.

Query each connector for its own ids rather than asking the designer to paste them. Where one is not authorized, say which one and carry on: an unwired connector narrows what step 3 can reach, and it blocks nothing else.

**Where `memory.connectors` is `null`**, say in one line that the repo records no connector ids, and carry the ones this project uses into the product record's evidence section instead.

## 3. Digest the existing material into the project notes

**The notes under `memory.root` ship blank.** Every file is a template carrying its question rather than an answer, so an agent reading one on the first day learns nothing. Nothing downstream works until this step runs.

1. Ask what exists and where: a brief, a deck, a brand book, prior research, a tracker project, recorded calls.
2. Digest each artifact into the inputs note, one heading per artifact, keeping its source line.
3. Pull the decisions out of the recordings into the decisions note, and the product's domain terms into the project glossary, which is a different file from the repo's own.
4. Synthesize across the sources into the research note and the requirements note, which are the two the rest of the repo reads.
5. Record every question the material did not answer in the open-questions note.
6. Leave a file at its template where the project has nothing for it. A blank file reads as nobody having done this yet, and generic prose reads as an answer.

Match each note by its own `read_when` header rather than by a filename this skill guesses, and read `memory.doc` for what each status means before editing one.

**A brand-new project often has nothing to ingest, and that is a legal state.** Where nothing has been written down yet, say so rather than inventing a digest. Step 4's record then comes from the intake conversation alone, every fact in it is labelled as inferred, and the open-questions note carries the gaps. Re-run this step when the first material arrives, which is why it is a step rather than a one-time chore.

## 4. Write the product record

`records.product` must exist and must describe the product. Ask the designer which route produces it, then take that route once.

**Where `records.product` is `null`, this step is what ends that.** Everywhere else in this suite a null slot is an answer and the step is skipped, and this is the one exception: the repo is saying it has no product record, and writing one is what the step is for. Agree the path in one question, write the file there, and write the path back into the host file so every later skill finds it. Write it in the shape the host file's own schema states, and validate the result against that schema: no guard runs in a consuming repo, so a slot written in the wrong shape is read as absent for months.

**Offer the Impeccable route only where the plugin is installed**, and treat its absence as ordinary: `ls ~/.claude/plugins/*/impeccable* 2>/dev/null` answers it in one call. Nothing mechanical depends on Impeccable, so the manual route is a first-class answer rather than a fallback.

- **Impeccable route** — hand off to `/impeccable init`. It runs its own interview and writes the file at its resolved path. Check the result against the ten headings below, move it to `records.product` where it landed elsewhere, and return. Ask nothing it already asked.
- **Manual route** — copy the stub and fill it. `records.productTemplate` is the stub where the repo ships one; where that slot is absent, copy `assets/product-record.template.md` out of this skill. The template carries a prompt per section, so this is an interview too, just a shorter one. Read what step 3 wrote, plus the tracker project, before asking the designer anything those already answer.

Both routes produce one file, and three rules bind both:

1. Keep the ten headings — Platform, Users, Product Purpose, Positioning, Operating Context, Capabilities and Constraints, Brand Commitments, Evidence on Hand, Product Principles, Accessibility & Inclusion — and the schema marker at the top of the file verbatim.
2. Delete the stub marker, which is what a guard reads to tell a filled record from a copied one.
3. Omit a section that does not apply rather than filling it with generic prose, and label an inferred fact as inferred.

The shared schema is what lets an Impeccable session adopt a hand-written file, and lets the designer hand-edit one Impeccable wrote.

## 5. Ingest the brand, or record that it is pending

**An identity often does not exist yet, and starting unbranded is a route rather than a delay.** Plenty of projects start before anybody has run a brand exploration, and shaping journeys at low fidelity first is working in the right order. Ask which case this is, and take one branch.

- **The identity exists** — run the `ingest-theme` skill, which fills the repo's unfilled theme slot and renames it to the product's id in `theme.registry`. Run `checks.guard` immediately afterwards. A rename with no product record fails there, which is the moment to catch it rather than three sessions later.
- **The identity is pending** — change no theme file, and write the state into the product record's brand section: that it is pending, what it waits on, and who owns it. Skip to step 6.

**The brand section is the only place that state gets recorded**, because everything else already tells the truth on its own. An unfilled slot reads as unfilled in every picker, and its own file says so at the top. What none of them can say is **why** it is unfilled and **when** it lands, which is a product fact and belongs with the other product facts. A second flag elsewhere goes stale against this one.

**An unfilled slot nags nobody.** A branch that never runs `ingest-theme` stays silent for as long as the project needs it to. Come back to this step when the identity arrives.

## 6. Scaffold the first surface

Run the `new-surface` skill.

- **Where step 5 ingested an identity**, pin it on the surface. A project's first surface is the reason the theme exists.
- **Where the identity is pending**, pin nothing. The repo's default look is the correct look for work nobody has branded yet. Never pin the placeholder id as a stand-in: a screenshot captioned with a placeholder word tells a stakeholder nothing about their own product.

Re-pin the surfaces when the identity lands. A pin is one field, so starting unbranded costs a line per surface rather than a rebuild.

## 7. Seed the issue ladder

The first surface declares which issues its screens answer, so the question "where is this tracked" has an answer from the first session. `issues.doc` owns the rung shape and the status words, and this step fills the declaration once from the tracker.

1. List the tracker project's **parent stories** through `issues.tracker`, against the project step 2 recorded. Declare a parent only, and never the design sub-task hanging off it.
2. Pick the stories the first surface's screens answer, and leave the rest undeclared.
3. Write the declaration in the shape `issues.ladder` types, with one shared project constant carrying the project's name and the link step 2 copied. A rung reaches its work through a declared screen slug or through an element selector where the work is chrome, so declare the screens the rungs cite first, even as shells.
4. Derive each rung's status from the state of the story's design sub-task, by the table in `issues.doc`.
5. Record in the surface's own README that the statuses are a seed derived from the tracker rather than a reading anybody confirmed. A tracker read is a proposal, and the first pull request the designer reads is where it gets confirmed or corrected.
6. Run `checks.guard`, which enforces the rules on the declaration.
7. Open the app's issue listing and check the rows appear grouped under the project's heading.

**Skip this step where `issues.retired` is `true`.** The repo dropped the ladder on purpose, and a seed here puts back what `ask-issue-status` deleted. Skip it too where `issues.ladder` is `null`: the repo tracks status somewhere no skill writes.

**No tracker project yet is a legal state.** Declare no issues, and record in the open-questions note that the ladder waits on the project. Come back to this step when the project exists.

## Report back

Name six things: the branch, which notes step 3 filled and which stayed at their template, which route wrote the product record, what the theme slot was renamed to, which connector ids are still placeholders, and how many rungs step 7 seeded, or that it seeded none and why. The last three go stale in silence.
