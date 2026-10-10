---
name: tidy-comments
description: >-
  Rewrite the code comments a change touched so they read plainly. A sub-agent applies `unslop` and
  the house style, deletes comments that restate the code, runs Prettier on the files it edited, and
  lists the other untidy comments in those files so the user can opt in to them.
when_to_use: >-
  Use before a commit or a pull request whose diff adds or changes a code comment, or when somebody
  asks for comments to be cleaned up. Do not run it on a diff that touches no comment, and never
  point it at files the diff did not touch. Trigger phrases "tidy the comments", "clean up these
  comments", "the comments read like AI wrote them", "unslop the comments".
compatibility: >-
  Reads checks.format from .agents/host.json. With checks.format null the repo has no formatter, so
  the Prettier step is skipped in one line. With the slot absent, look for a Prettier config or a
  `prettier` entry in the package manifest, and skip the step in one line where neither exists.
metadata:
  suite: captain-phil
  host: [checks.format]
---

# Tidy comments

The short version: collect the files the diff touched, resolve the format command, hand both to one sub-agent with `agent.md`'s prompt, then ask the user once about the other untidy comments it found.

`agent.md` is the sub-agent prompt. It rewrites comments and nothing else.

## 1. Collect the scope

1. Take the diff the work is about to carry: `git diff HEAD` before a commit, and `git diff <base>...HEAD` before a pull request.
2. Give each tracked file whose hunks add or change a comment the scope `diff: <command> -- <file>`.
3. Give each untracked file that holds a comment the scope `whole file`. The diff leaves untracked files out.
4. Stop and say so in one line where no file has a scope.

## 2. Resolve the format command

1. Read `checks.format`. Where its command runs Prettier, the format command is `npx prettier --write <file>...` over the listed files.
2. Where `checks.format` is `null`, the format command is `none`, and the report says the repo has no formatter.
3. Where the slot is absent, look for a Prettier config file or a `prettier` entry in the package manifest. Use the Prettier command where either exists, and `none` otherwise.
4. Where the slot names a formatter other than Prettier, the format command is `none`, and the report names the formatter this skill did not run.

## 3. Dispatch the sub-agent

1. Launch one general-purpose agent in the foreground with `agent.md`'s prompt verbatim.
2. Fill in the file scopes from step 1 and the format command from step 2.
3. Hand it nothing else. It reads the files and runs the diffs itself.

## 4. Ask about the rest

The sub-agent returns what it changed and a per-file list of comments outside the scope that it left alone.

1. Report the changes in one line per file.
2. Ask once, for every file together, where the list is not empty: "`<file>` has 3 other comments that haven't been cleaned, and `<file>` has 1. Clean these too?"
3. Where the user says yes, dispatch the sub-agent again with the same format command. Give each file the scope `lines: <numbers>`, using the line numbers it returned.
4. Where the user says no, leave them. Never widen the scope past the files the diff touched.
