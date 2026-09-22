---
name: start-engagement
description: >-
  Open one client engagement's home in this repo — cut its branch, wire the connectors, digest
  what the client has sent into the project notes, write the product record, seed the
  branch-local notes, ingest the brand or record it as pending, scaffold the first surface, and
  seed its issue ladder.
when_to_use: >-
  Use when a new client or engagement starts, when a branch exists but carries no product
  record, when the client sends their first materials, when work has to start unbranded because
  no identity exists yet, or when somebody asks where a client's work is meant to live. Trigger
  phrases "start a client branch", "set up a new engagement", "new client", "we won the
  project", "the client sent us their deck", "we have no brand yet", "where does this client's
  work go".
compatibility: >-
  Reads git.trunk, git.release, git.engagementBranch, git.doc, memory.root, memory.connectors, memory.doc,
  records.product, records.productTemplate, docs.local, theme.registry, issues.tracker,
  issues.ladder, issues.doc, issues.retired and checks.guard from .agents/host.json. With
  git.engagementBranch null the repo carries no per-engagement branch, so step 1 names the
  branch with the designer and the rest runs unchanged. With memory.root null there are no
  project notes, so steps 2 and 3 do not run and the product record comes from the interview
  alone. With records.product null the repo has no product record yet, which is the
  absence step 4 exists to end: the path is agreed in one question and written back into the host
  file. With records.productTemplate absent the record is filled from
  assets/product-record.template.md. With docs.local null every note is repo-wide and step 5
  does not run. With theme.registry null the repo lists no themes and step 6 asks only whether
  an identity exists. With issues.ladder null, or issues.retired true, step 8 does not run.
metadata:
  suite: phil-d-skills
  host: [git.trunk, git.release, git.engagementBranch, git.doc, memory.root, memory.connectors, memory.doc, records.product, records.productTemplate, docs.local, theme.registry, issues.tracker, issues.ladder, issues.doc, issues.retired, checks.guard]
---

# Start an engagement

An engagement's branch is its home, and it is a base branch in its own right. Nothing merges it
back. Read `git.doc` for which branch owns what before cutting anything.

Run the eight steps in order, and the order is the substance. Steps 2 and 3 fill the project notes
under `memory.root`, and every step after them reads what those two put there.

**Three steps fork, and every fork is legitimate.** Step 3 handles an engagement with nothing to
ingest yet, step 6 handles one with no identity yet, and step 8 handles one with no issue tracker
project yet. None of the three is a degraded path. The phase before a client has decided anything is
a real phase, and a branch running unbranded against half-empty notes is the work in its right
order rather than a setup somebody abandoned.

## 1. Cut the branch

1. Confirm the trunk is current: `git fetch origin && git log -1 --format=%cr origin/<git.trunk>`.
2. Branch from `git.trunk`, and never from `git.release` where the repo separates the two.
3. Name it by the pattern in `git.engagementBranch`, substituting the client or the product. Where
   that slot is `null` the repo carries no per-engagement convention, so agree the name with the
   designer in one question and match whatever the branch list already does.
4. Push it, and stop treating it as a feature branch: `git push -u origin <branch>`.

## 2. Wire the connectors

The connectors come before anything that reads them. Every later step queries the tracker, the
meeting recorder or the chat tool, and none of them can run against a placeholder.

1. Replace every placeholder in `memory.connectors` with a real id.
2. Record the tracker's team, project name and project id, plus the ids of the documents the
   engagement reads from.
3. Copy a project link in the form the tool hands out rather than assembling one. A link whose slug
   ends in a hash nothing derives is a link step 8 can only paste.
4. Record the meeting folder and the chat channels.
5. Delete a connector block the engagement does not use, rather than leaving its placeholders.

Query each connector for its own ids rather than asking the designer to paste them. Where one is not
authorized, say which one and carry on: an unwired connector narrows what step 3 can reach, and it
blocks nothing else.

**Where `memory.connectors` is `null`**, say in one line that the repo records no connector ids,
and carry the ones this engagement uses into the product record's evidence section instead.

## 3. Digest what the client has sent into the project notes

**The notes under `memory.root` ship blank.** Every file is a template carrying its question rather
than an answer, so an agent reading one on the first day learns nothing. Nothing downstream works
until this step runs.

1. Ask what exists and where: a brief, a deck, a brand book, prior research, a tracker project,
   recorded calls.
2. Digest each artifact into the client-inputs note, one heading per artifact, keeping its source
   line.
3. Pull the decisions out of the recordings into the decisions note, and the client's domain terms
   into the project glossary, which is a different file from the repo's own.
4. Synthesize across the sources into the research note and the requirements note, which are the two
   the rest of the repo reads.
5. Record every question the material did not answer in the open-questions note.
6. Leave a file at its template where the engagement has nothing for it. A blank file reads as
   nobody having done this yet, and generic prose reads as an answer.

Match each note by its own `read_when` header rather than by a filename this skill guesses, and read
`memory.doc` for what each status means before editing one.

**A brand-new engagement often has nothing to ingest, and that is a legal state.** Where the client
has sent nothing, say so rather than inventing a digest. Step 4's record then comes from the intake
conversation alone, every fact in it is labelled as inferred, and the open-questions note carries the
gaps. Re-run this step when the first material arrives, which is why it is a step rather than a
one-time chore.

## 4. Write the product record

`records.product` must exist and must describe the client. Ask the designer which route produces it,
then take that route once.

**Where `records.product` is `null`, this step is what ends that.** Everywhere else in this suite a
null slot is an answer and the step is skipped, and this is the one exception: the repo is saying it
has no product record, and writing one is what the step is for. Agree the path in one question, write
the file there, and write the path back into the host file so every later skill finds it. Write it in
the shape the host file's own schema states, and validate the result against that schema: no guard
runs in a consuming repo, so a slot written in the wrong shape is read as absent for months.

**Offer the Impeccable route only where the plugin is installed**, and treat its absence as
ordinary: `ls ~/.claude/plugins/*/impeccable* 2>/dev/null` answers it in one call. Nothing mechanical
depends on Impeccable, so the manual route is a first-class answer rather than a fallback.

- **Impeccable route** — hand off to `/impeccable init`. It runs its own interview and writes the
  file at its resolved path. Check the result against the ten headings below, move it to
  `records.product` where it landed elsewhere, and return. Ask nothing it already asked.
- **Manual route** — copy the stub and fill it. `records.productTemplate` is the stub where the repo
  ships one; where that slot is absent, copy `assets/product-record.template.md` out of this skill.
  The template carries a prompt per section, so this is an interview too, just a shorter one. Read
  what step 3 wrote, plus the tracker project, before asking the designer anything those already
  answer.

Both routes produce one file, and three rules bind both:

1. Keep the ten headings — Platform, Users, Product Purpose, Positioning, Operating Context,
   Capabilities and Constraints, Brand Commitments, Evidence on Hand, Product Principles,
   Accessibility & Inclusion — and the schema marker at the top of the file verbatim.
2. Delete the stub marker, which is what a guard reads to tell a filled record from a copied one.
3. Omit a section that does not apply rather than filling it with generic prose, and label an
   inferred fact as inferred.

The shared schema is what lets an Impeccable session adopt a hand-written file, and lets a designer
hand-edit one Impeccable wrote.

## 5. Seed the branch-local notes

1. Read the README inside `docs.local`, which states what belongs in the overlay and what does not.
2. Write one file per topic the engagement already has an answer for: the client's vocabulary, their
   approval loop, links to their boards.
3. Give each file the same `read_when` header the rest of the docs use.
4. Leave the folder holding only its README where the engagement has nothing branch-local yet. An
   empty overlay is the honest state.

## 6. Ingest the brand, or record that it is pending

**An identity often does not exist yet, and starting unbranded is a route rather than a delay.**
Plenty of engagements start before anybody has run a brand exploration, and a designer shaping
journeys at low fidelity is working in the right order. Ask which case this is, and take one branch.

- **The identity exists** — run the `ingest-theme` skill, which fills the repo's unfilled theme slot
  and renames it to the client's id in `theme.registry`. Run `checks.guard` immediately afterwards.
  A rename with no product record fails there, which is the moment to catch it rather than three
  sessions later.
- **The identity is pending** — change no theme file, and write the state into the product record's
  brand section: that it is pending, what it waits on, and who owns it. Skip to step 7.

**The brand section is the only place that state gets recorded**, because everything else already
tells the truth on its own. An unfilled slot reads as unfilled in every picker, and its own file
says so at the top. What none of them can say is **why** it is unfilled and **when** it lands, which
is a product fact and belongs with the other product facts. A second flag elsewhere goes stale
against this one.

**An unfilled slot nags nobody.** A branch that never runs `ingest-theme` stays silent for as long
as the engagement needs it to. Come back to this step when the identity arrives.

## 7. Scaffold the first surface

Run the `new-surface` skill.

- **Where step 6 ingested an identity**, pin it on the surface. An engagement's first surface is the
  reason the theme exists.
- **Where the identity is pending**, pin nothing. The repo's default look is the correct look for
  work the client has not branded yet. Never pin the placeholder id as a stand-in: a screenshot
  captioned with a placeholder word tells a client nothing about their own product.

Re-pin the surfaces when the identity lands. A pin is one field, so starting unbranded costs a line
per surface rather than a rebuild.

## 8. Seed the issue ladder

The first surface declares which issues its screens answer, so the question "where is this tracked"
has an answer from the first session. `issues.doc` owns the rung shape and the status words, and this
step fills the declaration once from the tracker.

1. List the tracker project's **parent stories** through `issues.tracker`, against the project step 2
   recorded. Declare a parent only, and never the design sub-task hanging off it.
2. Pick the stories the first surface's screens answer, and leave the rest undeclared.
3. Write the declaration in the shape `issues.ladder` types, with one shared project constant
   carrying the project's name and the link step 2 copied. A rung reaches its work through a
   declared screen slug or through an element selector where the work is chrome, so declare the
   screens the rungs cite first, even as shells.
4. Derive each rung's status from the state of the story's design sub-task, by the table in
   `issues.doc`.
5. Record in the surface's own README that the statuses are a seed derived from the tracker rather
   than a reading confirmed with the client. A tracker read is a proposal, and the first pull request
   the designer reads is where it gets confirmed or corrected.
6. Run `checks.guard`, which enforces the rules on the declaration.
7. Open the app's issue listing and check the rows appear grouped under the project's heading.

**Skip this step where `issues.retired` is `true`.** The branch dropped the ladder on purpose, and a
seed here puts back what `ask-issue-status` deleted. Skip it too where `issues.ladder` is `null`:
the repo tracks status somewhere no skill writes.

**No tracker project yet is a legal state.** Declare no issues, and record in the open-questions note
that the ladder waits on the project. Come back to this step when the project exists.

## Report back

Name six things: the branch, which notes step 3 filled and which stayed at their template, which
route wrote the product record, what the theme slot was renamed to, which connector ids are still
placeholders, and how many rungs step 8 seeded — or that it seeded none, and why. The last three go
stale in silence.
