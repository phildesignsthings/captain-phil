---
name: drift-check
description: >-
  Find where a built feature has grown past what was agreed with the client. It reports the
  screens, states and rules that cost more to build than the scope said. Changes that kept the
  effort the same are the designer's calls and never come back to the user. The run writes one short list into
  the repo's docs, and that list is usually empty.
when_to_use: >-
  Use when a designer or developer has been building for a while and wants to know whether the work
  has drifted past the agreed scope, before a demo, before a handoff to developers or their agents,
  or before the project manager plans the next phase. Do not run it to tidy comments, which is
  `tidy-comments`, or to check that a screen renders, which is `verify-ui`. Trigger phrases "check
  for drift", "have I drifted from scope", "is this still in budget", "did we add scope", "drift
  check the billing epic".
argument-hint: "[the feature or epic to check, in your words]"
compatibility: >-
  Reads records.scope, memory.connectors, docs.root, surfaces.root and surfaces.harnessMarkers from
  .agents/host.json. With records.scope null, the scope is the tracker's description of the feature,
  read through memory.connectors, and the report says the baseline may have been edited since it was
  agreed. With records.scope absent, ask once where the agreed scope lives and offer to record the
  answer. With docs.root null, the report goes in a docs folder at the repo root. With
  surfaces.harnessMarkers absent or empty, no code is skipped as demo-only.
metadata:
  suite: captain-phil
  host: [records.scope, memory.connectors, docs.root, surfaces.root, surfaces.harnessMarkers]
---

# Drift check

Scope drift is a change that makes the product cost more to build than what was agreed. A change that kept the effort the same, or cut it, is a design decision, and it stays out of the report.

## Steps

1. Take the feature from `$1`, in the user's words. Ask for it where `$1` is empty.
2. Find what was agreed for it in `records.scope`.
3. Find the code that builds it under `surfaces.root`. Split it into slices of about 1,500 lines where it is larger.
4. Run `references/build-agent.md` once per slice, in parallel.
5. Run `references/compare-agent.md` once, with the agreed scope and every build agent's output.
6. Write its rows into `<docs.root>/drift/<feature>.md` from `references/report-template.md`.
7. Tell the user how many rows there are and where the file is. Show the rows only where there are any.

## Never

| Never | Why |
|---|---|
| Show a change that kept the effort the same | it is the designer's call, and asking about it costs a decision for nothing |
| Rule on a row | the project manager weighs value against effort, not the run |
| Post the report anywhere | the user forwards it |
