---
house_style: true
read_when:
  - "A skill is being written, and its frontmatter has to make it trigger"
  - "A skill takes an argument, or has to run in a subagent"
  - "A skill's tool access or its permissions are being decided"
---

# Writing a skill

A skill is a procedure with a trigger. This file holds the shape; the writing rules are in
`references/house-style.md`.

## A description that triggers

A skill runs when its `description` and `when_to_use` match what the agent is about to do. A
description that describes the skill instead of its trigger produces a skill nobody invokes.

Split the trigger across two frontmatter fields. The harness joins them before matching, so the
split costs nothing at match time and keeps the skill listing readable.

- **`description` states what the skill produces**, in one or two sentences, and stops there.
- **`when_to_use` states when it fires**: the situations, opening with "Use when", then the phrases
  a user types, opening with "Trigger phrases".
- **`when_to_use` holds the negative conditions too** — the cases where the skill must not run.

Write all three as folded block scalars (`>-`). A colon followed by a space breaks an unquoted YAML
scalar, and these fields are long enough to contain one.

## The body

- **Open with the shortest version of the procedure, then the depth.** An agent that stops reading
  after the first screen still runs the skill correctly.
- **Cite the file that owns each fact, and stop.** The moment a skill quotes a table, the table has
  two homes.
- **Number the steps a reader takes in order**, and write one instruction per item.

## How a skill gets reached

The default is both routes: the agent invokes the skill on a match, and the user types `/name`.

- **Leave the invocation flags unset where the skill has trigger phrases.** A phrase list exists to
  be matched, and `disable-model-invocation: true` takes the skill out of the agent's listing, so
  the phrases stop reaching it.
- **Set `user-invocable: false` where the skill fires on the shape of a prompt**, which the user
  cannot type at themselves.

A skill taking an identifier declares `argument-hint` and reads the value positionally, as `$1` for
the first argument and `$2` for the second. The harness substitutes those and `$ARGUMENTS`, and
nothing else: an `arguments` frontmatter key does not exist, and a named `$surface` in the body
arrives at the agent as the literal text. State what happens when the argument is empty, otherwise
the procedure runs on a placeholder it never mentions.

Record an environment prerequisite in `compatibility` rather than in the body. It is an Agent Skills
spec field, so it survives outside any one harness, and it says what to do when the prerequisite is
absent.

## A skill that runs somewhere else

`context: fork` runs a skill in a subagent with an empty context, so a heavy read never lands in the
session that invoked it. It suits a skill that reads a great deal and returns a little.

Three rules bind a forked skill, and breaking any one strands the run:

- **Never fork a run the user cannot see progress on.** A fork shows no tool calls while it works,
  so a skill running for minutes is indistinguishable from one that has stuck, and the step that
  stuck cannot be skipped or interrupted. A run that finishes correctly but gives no sign it is
  alive still fails, because the user spends the wait deciding whether to kill it.
- **A forked skill cannot reach the user.** Move every question to the arguments, and end the run
  where an argument is missing rather than pausing for an answer.
- **The return is the only thing anyone sees.** Name the paths written, the check results and the
  failures in it. Set `background: false` where that return is the point.

## What a skill restricts

`allowed-tools` narrows a skill to the tools it names. It does not pre-approve a command, and it
does not remove a permission prompt.

- **Leave `allowed-tools` unset.** A skill that reads a file, writes a file and calls a server would
  have to name `Read`, `Write`, `Edit`, `Glob`, `Grep` and each server tool before it named a
  script. A list missing one of those stops the skill at the step that needs it, and the failure
  reads as the agent refusing rather than as a frontmatter gap.
- **Pre-approve a command in the repo's own settings instead**, under `permissions.allow`, where it
  is reviewed once and binds every session. `Bash(node:*)` is the documented pattern shape — a
  command prefix, then a colon, then a star.
- **Name the exact script rather than the interpreter.** `Bash(git:*)` pre-approves
  `git reset --hard`, which has cost a fix round.
