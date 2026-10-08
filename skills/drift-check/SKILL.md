---
name: drift-check
description: >-
  Find where a feature of a built product disagrees with itself or with its written sources: a
  comment against the code beside it, the code against a spec, a spec against a later decision in the
  tracker. The user names the feature in their own words, the run splits it into gates a person can
  review in one sitting, and each gate hands back one table where every row names which side is
  wrong and where its fix goes.
when_to_use: >-
  Use when a codebase is about to go to another developer or their agents, when a feature was built
  a while ago and later decisions may have overtaken it, when a comment and the tracker seem to
  disagree, or when somebody asks what the code knows that no doc says. Do not run it to improve how
  a comment reads, which is `tidy-comments`, or to check that a screen renders, which is
  `verify-ui`. Trigger phrases "check this for drift", "is this comment still true", "does the code
  match the tracker", "what's only in the code", "drift check the billing epic", "shore this up
  before the handoff".
argument-hint: "[what to check: an epic, a feature, a flow, some screens, a decision or a ticket]"
compatibility: >-
  Reads docs.root, memory.connectors, issues.tracker, surfaces.root and surfaces.harnessMarkers from
  .agents/host.json. With docs.root null the repo keeps no specs, so claims are checked against the
  connectors alone, and the record of checked gates goes in the scratch folder, where it reaches no
  other session. With memory.connectors and issues.tracker both null, the check reads the repo's
  own docs only and the plan says no external source will be read. With a slot absent, look for a
  docs folder, a connectors or sources note at the repo root, and a src or app folder, and name what
  was used. With surfaces.harnessMarkers absent or empty, no code is skipped as demo-only.
metadata:
  suite: captain-phil
  host: [docs.root, memory.connectors, issues.tracker, surfaces.root, surfaces.harnessMarkers]
---

# Drift check

The short version: the user names what to check in their own words, and the run finds its screens
and splits them into gates. It shows the gates, says what the user reviews in each one, and asks
their review budget. Then each gate pulls the claims, checks them against the sources, and puts one table
to the user. Fix only the rows the user rules on.

`claims-agent.md` and `check-agent.md` are the two sub-agent prompts. `references/verdicts.md`
defines each verdict, which source stands where two disagree, and the order rows go to the user.
`references/record.md` is the record of which gates have been checked, so a run can pick up where
the last session stopped.

## 1. Find what the user named

1. Take what to check from `$1`: an epic, a feature, a flow, some screens, a decision or a ticket,
   in the user's words.
2. Ask what to check where `$1` is empty. Offer the epics and features by the names the tracker and
   the specs use, and never by folder.
3. Look for the feature's record, as `references/record.md` § Where it lives says. Where one exists,
   show which gates are checked and when, and offer to carry on from the first unchecked gate.
4. Find the screens behind the name. Read the tracker project or ticket it names, the spec in
   `docs.root` that covers it, the routes under `surfaces.root`, and any file that cites a decision
   or ticket ID the user gave.
5. Start from the spec's own list of the feature's files where it keeps one, and check that list
   against the routes.
6. Read each parent issue in the tracker project in full. Open a sub-issue only where its title names
   a product rule rather than a stage of work, such as a wireframe or a placeholder task.
7. Name the tracker items the repo does not build, such as another app's screens or work the tracker
   marks for a later release, and leave them out of the gates.
8. Name each screen the way the product names it, by its title or the flow it belongs to, rather
   than by its file.

## 2. Split it into gates

A gate is one segment the user can rule on in one sitting: one flow, or two to four screens that
share their rules.

1. Group the screens by what a user does with them, such as "scan a card and see it land", rather
   than by folder.
2. Add every file a segment's screens import from inside the repo, one level deep: helpers,
   constants, state and the request layer.
3. Add a shared component where it carries the feature's copy or rules, such as a finish screen that
   prints what a run paid. Leave out primitives and generated files.
4. Split a segment again where its files pass about 1,500 lines. Keep the count to yourself; the
   user plans by screens and flows.
5. Order the gates so a gate whose rules others depend on runs first.
6. Run the plan as one gate where the whole request fits in one.

## 3. Show the plan and ask the budget

1. List the sources every gate is checked against once, before the gates.
2. Show one line per gate: its name, the screens in it by their product names, and the sources only
   that gate adds.
3. Say what the user reviews at the end of each gate: one table of rulings, and a range for how many
   rows it will hold.
4. List the tracker items left out in step 1, so the user can pull one back in.
5. Name every source no tool can reach, so the user knows before the run what it cannot see.
6. Say in one line which sources the check leaves out where a source slot is `null`.
7. Ask the review budget. Offer to put every row to the user, only the rows that change what a user
   sees or does, or only the rows the sources disagree on. Where the budget leaves a class of rows
   out, ask whether that class gets fixed without asking or listed without action.
8. Wait for a go on the plan and the budget together.
9. Write the feature's record once the go arrives, with every gate unchecked.
10. Stop at the end of every gate and wait. Follow `gate` and `wrap-gate` where the plan runs past
   one session.

## 4. Check one gate

1. List the sources the gate answers to. Read the specs under `docs.root`, and the note
   `memory.connectors` names for the tracker, its decision records, meeting notes and chat
   channels, with the IDs to query each. Read `issues.tracker` where the connectors note leaves the
   tracker out.
2. Load the tools for each source before the checking agent needs them.
3. Launch one sub-agent in the foreground with `claims-agent.md`'s prompt verbatim. Fill in the
   gate's file list and the strings in `surfaces.harnessMarkers`. Pick a fast model where the
   harness offers one, because this step reads a great deal and judges little.
4. Launch one sub-agent in the foreground with `check-agent.md`'s prompt verbatim. Fill in the
   claims table, the source list, and the absolute path to `references/verdicts.md`.
5. Split the claims across two or three checking agents where there are more than about 40.
6. Keep every gap an agent reports: a source it could not reach, a search it cut short, a transcript
   it skimmed.

## 5. Put the table to the user

1. Drop every claim marked `agrees`, and give their count in one line.
2. Apply the budget. Fix the classes the user waved through, list the classes they set aside, and
   keep the rest for the table.
3. Order the table by `references/verdicts.md` § Order.
4. Build one table: the claim in the product's words, the screen it shows on, what the sources say
   with their dates, the verdict and the proposed fix.
5. Run `unslop` on the table and the message around it before sending.
6. Ask for one ruling per row: fix the code, fix the comment, fix the source, record a decision, or
   leave it. Follow `decision-request` where seeing a screen is part of the ruling.
7. Build nothing before the rulings arrive.

## 6. Apply the rulings

1. Fix the code and its comment together, in the gate's files only.
2. Invoke `tidy-comments` on the diff once the facts are right.
3. Draft each source fix or decision for whoever owns it. Run `write-doc` and then `unslop` on every
   draft.
4. Post nothing to an external service without the user's go on that post.
5. Add the gate to the feature's record, as `references/record.md` says.
6. Hand back through `work-report`: the rows fixed, the rows left and why, the drafts waiting, the
   gaps, and the next gate.

## What this skill never does

| Never | Why |
|---|---|
| Rule a row itself | the connectors note names who owns each decision, and a guessed ruling is one more source of drift |
| Run a gate past its segment | a gate that grows returns a table too long to rule on in one sitting |
| Count a draft as a source | `references/verdicts.md` § Which source stands, rule 4 |
