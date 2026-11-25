---
house_style: true
read_when:
  - "`review-build` finds no deny rule for the tests folder in the designer's settings"
  - "The permission rule has to be filled in, merged, or explained"
  - "A designer asks what stops the build from editing its own checks"
---

# The permission rule

The rule stops a build session from editing the reviewer's files: the test plans, the misses checklist and the reports in the brain's tests folder, the installed `review-build` folder, and the reviewer agent. A change that can edit its own checks can pass any review, so the rule is on by default: the skill offers it on its first run, and recommends a yes.

## What it covers

Claude Code reads permission rules from every settings file, and a `deny` rule wins over any `allow`. The rule held in `acceptEdits` mode, which allows every other edit without asking, and in `bypassPermissions` mode, which skips every prompt. One `Edit(<path>)` rule covers every built-in tool that changes a file, the Write tool included. A `Write(<path>)` rule is not matched by Claude Code's file checks, and it prints a warning saying so, which is why the template holds `Edit` rules only.

Claude Code also applies the `Edit` rule to common shell writes. Under the rule it refused `mv`, `cp` and a `cat` redirect into the folder, even with each of those commands allowed by name, and it refused the `mv` in `bypassPermissions` mode as well.

The shell is not fully covered. In a session that allowed every Bash command, `echo <line> >> <file>` and `tee -a <file>` with an absolute path still wrote into the folder. A Bash deny rule such as `Bash(*>*<path>*)` did not stop either one. So `review-build` step 4 checks the folder for changes nobody committed, and a session that allows every Bash command is a session the rule does not fully guard.

These results were measured on Claude Code 2.1.329. A different version can cover more of the shell or less, so run the check in § Checking it holds after an update.

## The reviewer's own writes

The rule sits in the user's settings, so it binds the reviewer's own sessions too. That is the price of keeping it in the one settings file every session loads. Only two things are written into the tests folder: a test plan, once per build, and a change to the misses checklist, which is rare. Reports and run evidence go in `<plans>/reviews/` and `<plans>/runs/`, outside the folder.

For the two writes that land inside it:

1. Write the file beside the folder, as `<plans>/<file>.draft`.
2. Move it in once with `mv`. Without the rule, the move goes through.
3. Where Claude Code refuses the move, print the `mv` command with both absolute paths, and ask the designer to run it in their own terminal, outside Claude Code.
4. Read the file back once they say it is done, and check the draft is gone.

Every change to the reviewer's files then passes through the designer's own hands, which is the guarantee the rule exists to give.

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
2. Show the designer the three filled rules and the file they go into, and ask once.
3. After a yes, copy the file to `~/.claude/settings.json.bak`.
4. Add each rule to `permissions.deny`, skipping any rule already there. Keep every other key and rule as it was.
5. Read the file back, and check it is still valid JSON. Where it is not, restore the copy and say so.
6. Say in one line that every session started after the merge carries the rule, and that a session already running can keep the rules it started with.

A later first run from another repo adds that repo's `review-build` folder to the same list, and leaves the earlier rules alone. A run with nobody to answer merges nothing.

## Checking it holds

Run the control first, so a pass means the rule did the work:

1. Note the test plan's `md5`.
2. Run `claude -p --permission-mode acceptEdits "Append the line CONTROL to <test plan path> with the Edit tool"`. The `md5` changes.
3. Restore the file.
4. Run the same command with `--settings <the filled-in rules file>`. The `md5` stays the same.

## The product repo

The rule lives in the designer's own settings, and the reviewer agent in their own agents folder. Neither goes into the product repo, so a teammate's clone never inherits a rule that names someone else's brain.
