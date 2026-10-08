---
name: drift-check
description: >-
  Find where one slice of a built product disagrees with itself or with its written sources: a
  comment against the code beside it, the code against a spec, a spec against a later decision in the
  tracker. Two sub-agents pull the slice's claims and check each one, and the run hands back one
  table where every row names which side is wrong and where its fix goes.
when_to_use: >-
  Use when a codebase is about to go to another developer or their agents, when a feature was built
  a while ago and later decisions may have overtaken it, when a comment and the tracker seem to
  disagree, or when somebody asks what the code knows that no doc says. Take a slice of a few screens
  and the helpers they import, never a whole repo in one run. Do not run it to improve how a comment
  reads, which is `tidy-comments`, or to check that a screen renders, which is `verify-ui`. Trigger
  phrases "check this for drift", "is this comment still true", "does the code match the tracker",
  "what's only in the code", "drift check this feature", "shore this up before the handoff".
argument-hint: "[slice: a folder, a route or a few files]"
compatibility: >-
  Reads docs.root, memory.connectors, issues.tracker, surfaces.root and surfaces.harnessMarkers from
  .agents/host.json. With docs.root null the repo keeps no specs, so claims are checked against the
  connectors alone. With memory.connectors and issues.tracker both null, the check reads the repo's
  own docs only and the report says no external source was read. With a slot absent, look for a
  docs folder, a connectors or sources note at the repo root, and a src or app folder, and name what
  was used. With surfaces.harnessMarkers absent or empty, no code is skipped as demo-only.
metadata:
  suite: captain-phil
  host: [docs.root, memory.connectors, issues.tracker, surfaces.root, surfaces.harnessMarkers]
---

# Drift check

The short version: pick a slice of a few screens, list the sources it answers to, send the slice to
the claims agent, send its claims to the checking agent, sort the results by
`references/verdicts.md`, and put one table to the user. Fix only the rows the user rules on.

`claims-agent.md` and `check-agent.md` are the two sub-agent prompts. `references/verdicts.md`
defines each verdict, the test that assigns it and where its fix goes.

## 1. Pick the slice

1. Take the slice from `$1` where it names a folder, a route or files.
2. Where `$1` is empty, list the folders under `surfaces.root` with the date each was last changed in
   git, propose the three changed longest ago, and ask which one to check.
3. Add every file the slice's screens import from inside the repo, one level deep: helpers,
   constants, state and the request layer. Leave out shared UI components and generated files.
4. Split the slice where it passes about 1,500 lines, and say which half runs first.

## 2. List the sources

1. Read `docs.root` for the specs and design records that cover the slice.
2. Read the note `memory.connectors` names for the external sources: the tracker, its decision
   records, meeting notes and chat channels, with the IDs to query each.
3. Read `issues.tracker` for the tracker to search where the connectors note leaves it out.
4. Load the tools for each source before the checking agent needs them. Name every source whose tool
   is missing or unauthorised in the report, rather than dropping it in silence.

## 3. Pull the claims

1. Launch one sub-agent in the foreground with `claims-agent.md`'s prompt verbatim. Pick a fast
   model where the harness offers one, because this step reads a great deal and judges little.
2. Fill in the slice's file list and the strings in `surfaces.harnessMarkers`.
3. Keep the claims table it returns. A claim it marks as disagreeing with its own code is already a
   finding, whatever the sources say.

## 4. Check the claims

1. Launch one sub-agent in the foreground with `check-agent.md`'s prompt verbatim, filled in with
   the claims table, the source list from step 2 and the absolute path to `references/verdicts.md`.
2. Split the claims across two or three agents where there are more than about 40, grouped by the
   file they came from.
3. Keep every gap an agent reports: a source it could not reach, a search it cut short, a transcript
   it skimmed. The report carries them.

## 5. Put the table to the user

1. Drop every claim the checking agent marked `agrees`, and give their count in one line.
2. Order the rest by `references/verdicts.md` § Order.
3. Show one table: the claim, where the code says it, what the sources say with their dates, the
   verdict and the proposed fix.
4. Ask for one ruling per row: fix the code, fix the comment, fix the source, record a decision, or
   leave it. Follow `decision-request` where seeing a screen is part of the ruling.
5. Build nothing before the rulings arrive.

## 6. Apply the rulings

1. Fix the code and its comment together, in the slice's files only.
2. Invoke `tidy-comments` on the diff once the facts are right, so the corrected comments read
   plainly.
3. Draft each source fix or decision for whoever owns it, and post nothing to an external service
   without the user's go on that post.
4. Hand back through `work-report`: the rows fixed, the rows left and why, the drafts waiting, and
   the gaps from step 4.

## What this skill never does

| Never | Why |
|---|---|
| Treat a draft as a source | a note marked unposted, or a branch-only doc, records what somebody meant to say, not what was decided |
| Rule a row itself | the person who owns a decision is named in the connectors note, and a guessed ruling is the drift this skill exists to catch |
| Widen past the slice | a repo-wide sweep returns a table nobody finishes reading |
