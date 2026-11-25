---
house_style: true
read_when:
  - "`plan-it` is about to create the plan file, or add a decision to it"
  - "A decision has been reversed, and the plan has to say so"
  - "The interview is over, and the work has to be split into gates"
  - "The plan is finished, and needs its cold read"
---

# The plan file

The plan is the record of what was decided and why, written so the designer, a week later, can read it without the chat. It holds decisions and links. Facts and how-tos stay in the files that own them, and the plan cites them by path.

## Where it goes

One file per plan, in the folder the `plans` slot names: `<plans>/<YYYY-MM-DD>-<topic>.md`, dated the day the plan starts, with the topic in a few lowercase words joined by hyphens. Where the plans folder carries its own rules, such as a README that sets a different shape, its rules win.

With `plans` set to `null`, or no brain, the plan uses the same format, kept in the chat and printed whole at the close.

Leave committing the plan to the designer. Where they ask for a commit, stage the plan file by its path alone, because a brain often holds other uncommitted edits.

## The sections

```markdown
---
title: <what the plan delivers, in one line>
status: <planning, ready to build, building or done>
created: <YYYY-MM-DD>
updated: <YYYY-MM-DD>
---

# <title>

## Goal and why

<The outcome and why it matters, in two or three sentences. Then what done looks like, and what is already fixed, each with the file that states it.>

## Decided

**D1. <the decision>.** Why: <one line>. Rejected: <option>, because <reason>.

## Open

- [OPEN] <the question>, waiting on <what>.

## Gate 1: <the deliverable>

<What it builds, in one or two sentences, and the decisions it rests on.>

- **Done when:** <a check someone can run, with its command and what it prints>.

## Next

<The next step and who takes it.>
```

The file starts once the gate is answered and the survey is done, with its frontmatter and Goal and why. Decided, Open, the gates and Next fill in as the interview runs.

## Decision entries

- **Number every decision** `D<n>`, in the order the designer made them, and never reuse a number.
- **Give each one its why and the options it beat,** each with its reason. A decision without the rejected options gets reopened by the next reader.
- **Use the designer's words** for anything they said in free text, rather than an elaboration of them.
- **Mark a default you wrote** as `Builder's call: cheap to change.` in place of the why, so a reader can tell it from a decision the designer made. Write it in the turn the tree marks the detail as cheap, without waiting for an answer.
- **Copy a shape the designer adopted verbatim,** such as a tree or a flow, into the decision, rather than summarising it.

Ideas from a link or from another person go under a `## Proposals (not decided)` heading, with where each came from. A proposal moves into Decided only when the designer adopts it.

## Superseded decisions

A reversed decision stays in the plan, so its reasons stay readable.

```markdown
~~**D3. The toggle lives in settings.**~~ Superseded by D7.

**D7. The toggle lives in the header.** Replaces D3. Why: night readers switch mid-article.
```

Then search the brain and the product repo for every file that still states the old decision: notes, docs and any skill that routes work by it. List each under a `## To update` heading, with its path and the line to change, so whoever builds the plan fixes them all.

## Gates

A gate is one deliverable, sized so a single session can build it and someone can review it before the next one starts. `gate` and `wrap-gate` name a gate by its heading in the plan, and the same headings let a gated plan run one session per gate.

- **Write each gate as a `## Gate <id>: <the deliverable>` heading,** numbered in build order.
- **Give each gate one deliverable.** Two deliverables means two gates.
- **Name the decisions each gate rests on,** by number.
- **Write each done check as something someone can run:** the command, where it runs, and what its output must contain.
- **Name any step that waits on the designer** at the top of the gate, such as a login or a first look at a screen.

## Writing it

- **Write plainly, with no voice.** The plan is read cold, by someone who was not in the chat.
- **Record a decision right after the answer,** and bump `updated:` in the same edit.
- **Print the section after each edit,** and check the headings with `grep -n '^## ' <plan>`, because a scripted edit can drop a line or leave half a heading.
- **Re-read Open and Next from disk** before telling the designer what is outstanding.

## The cold read

Before the close, give the plan to a fresh subagent whose only context is the plan's path, or the plan's text where there is no file to point at. Tell it to stay read-only: no file edits and no command that changes anything. Ask it:

> Without doing the work: what would you do first, what does done look like, and what is unclear or missing?

Each question it asks, or wrong guess it makes, is a gap in the plan. Fix the plan and run a fresh reader again, two rounds at most. Where something is still unclear after two rounds, list it for the designer at the close.

The cold read is the planner's own check. Report it in one or two lines, such as "a fresh reader read the plan cold, and I tightened two steps it would have guessed at", and name only a gap that changes what the designer will see.

The cold read passes when the reader's first step and its done checks match yours.
