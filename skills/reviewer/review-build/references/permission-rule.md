---
house_style: true
read_when:
  - "`review-build` finds one of the three deny rules missing from the designer's settings"
  - "The reviewer agent has to be installed or updated while the rule is on"
  - "The permission rule has to be filled in, merged, or explained"
  - "A designer asks what stops the build from editing its own checks"
---

# The permission rule

The rule stops a build session from editing the reviewer's files: the test plans and the misses checklist in the brain's tests folder, the installed `review-build` folder, and the reviewer agent. A change that can edit its own checks can pass any review, so the rule is on by default: the skill offers it on its first run, and recommends a yes.

## What it covers

Claude Code reads permission rules from every settings file, and a `deny` rule wins over any `allow`. The rule held in `acceptEdits` mode, which allows every other edit without asking, and in `bypassPermissions` mode, which skips every prompt. One `Edit(<path>)` rule covers every built-in tool that changes a file, the Write tool included. A `Write(<path>)` rule is not matched by Claude Code's file checks, and it prints a warning saying so, which is why the template holds `Edit` rules only.

Claude Code also applies the `Edit` rule to the shell writes it can read a path from. Under the rule it refused `mv`, `cp` and a `cat` redirect into the folder with each command allowed by name, and `echo >>` and `tee -a` with every Bash command allowed, by absolute path or relative. It refused `mv`, `echo >>` and `tee -a` in `bypassPermissions` mode as well. A Bash deny rule such as `Bash(*>*<path>*)` adds nothing: on its own it did not stop `echo >>` or `tee -a`, and beside the `Edit` rule it blocked nothing more.

The shell is not fully covered. A command whose target the check cannot see still writes: a script file that appends to a test plan wrote into the folder under the rule, with every Bash command allowed and in `bypassPermissions` mode. So `review-build` step 4 checks the folder for changes nobody committed, and a session that allows every Bash command is a session the rule does not fully guard.

These results were measured on Claude Code 2.1.329. A different version can cover more of the shell or less, so run the check in § Checking it holds after an update.

## The reviewer's own writes

The rule sits in the user's settings, so it binds the reviewer's own sessions too. That is the price of keeping it in the one settings file every session loads. Only three things are written under the rule: a test plan, once per build, a change to the misses checklist, which is rare, and the reviewer agent, installed once and replaced after a suite update. Reports and run evidence go in `<plans>/reviews/` and `<plans>/runs/`, outside it.

For those three writes:

1. Have the new file ready outside the rule. A test plan is written beside the tests folder as `<plans>/<YYYY-MM-DD>-<topic>.md.draft`, and a checklist change as `<plans>/checklist.md.draft`. The agent's source is the installed `assets/reviewer.agent.md`, which needs no draft.
2. Put it in place once: `mv` for a draft, and for the agent `mkdir -p` on `~/.claude/agents`, then `cp`. Without the rule, the command goes through.
3. Where Claude Code refuses it, print the commands with absolute paths, and ask the designer to run them in their own terminal, outside Claude Code.
4. Read the file back once they say it is done. Check a draft is gone, or that the agent matches its source (`cmp -s`).

On a first run, `review-build` offers the agent before it merges the rule, so the copy goes through on its own. Every later change to the reviewer's files passes through the designer's own hands, which is the guarantee the rule exists to give.

## Filling it in

`assets/reviewer-permissions.json` holds three placeholders. Each one becomes an absolute path that starts with `/`, so each finished rule starts with `Edit(//`, Claude Code's syntax for a path from the filesystem root.

| Placeholder | Fill with |
|---|---|
| `<tests folder>` | The `plans` slot's folder plus `/tests`, resolved to its real path with `cd <folder> && pwd -P` |
| `<review-build folder>` | The folder this skill was loaded from, resolved the same way. Through a `.claude/skills` link it resolves to the `.agents/skills` folder, and a rule on the real path covers both |
| `<reviewer agent file>` | `~/.claude/agents/reviewer.md`, with `~` expanded (`echo "$HOME"`) |

A finished rule reads like `Edit(//Users/sam/brain/plans/tests/**)`. A bracket left unfilled is a rule that matches nothing.

## Merging it

1. Read `~/.claude/settings.json`. Where it does not exist, the merge creates it holding only the rule.
2. Compare the three filled rules with its `permissions.deny`, and keep the ones missing from it.
3. Show the designer the missing rules and the file they go into, and ask once.
4. After a yes, copy the file to `~/.claude/settings.json.bak`.
5. Add each missing rule to `permissions.deny`. Keep every other key and rule as it was.
6. Read the file back, and check it is still valid JSON. Where it is not, restore the copy and say so.
7. Say in one line that every session started after the merge carries the rule, and that a session already running can keep the rules it started with.

The tests folder and the agent are the same for every product in one brain, but each product repo installs its own `review-build` folder. So the first review from a second repo finds only that folder's rule missing, shows that one rule, and leaves the earlier rules alone. A run with nobody to answer merges nothing.

## Checking it holds

Run the control first, so a pass means the rule did the work:

1. Note the test plan's `md5`.
2. Run `claude -p --permission-mode acceptEdits "Append the line CONTROL to <test plan path> with the Edit tool"`. The `md5` changes.
3. Restore the file.
4. Run the same command with `--settings <the filled-in rules file>`. The `md5` stays the same.

## The product repo

The rule lives in the designer's own settings, and the reviewer agent in their own agents folder. Neither goes into the product repo, so a teammate's clone never inherits a rule that names someone else's brain.
