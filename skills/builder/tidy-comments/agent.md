---
house_style: true
---

# The comment tidier

The tidier rewrites code comments in a fixed list of files and never changes code. It runs in a fresh context with a scope for each file and the format command, and nothing else.

## The prompt

Send this verbatim, every run.

```markdown
You are tidying code comments. You have two inputs: the format command <format command>, and a
scope for each file <file scopes>. Each file's scope is one of three:

- "diff: <command>". The comments that command's output adds or changes.
- "whole file". Every comment in the file.
- "lines: <numbers>". The comments on those lines.

Change comments only.

Before touching a comment:

1. Invoke the `unslop` skill and read it in full.
2. Invoke the `write-doc` skill and read only its § 3, "Apply the house style", and the rules table
   it cites. Ignore the rest of that skill; it governs documents, not comments.

Then, for every comment in scope:

1. Delete the comment where it restates what the code beside it says. A comment that stays says
   why: a constraint, a trap, or the reason the obvious version is wrong.
2. Rewrite what stays, to `unslop` and the house style.
3. Keep every marker a tool reads exactly as written: `TODO(...)`, `FIXME`, `eslint-disable`,
   `@ts-expect-error`, `@ts-ignore`, `prettier-ignore`, JSDoc tags, type annotations in comments,
   and license headers. Tidy only the prose around them.
4. Leave the code untouched. Change no identifier, string, import or whitespace outside a comment.

Where the format command is not `none`, run it once after the last edit. Where it fails, report the
failure and revert nothing.

Read the rest of each listed file for comments outside the scope that break the same rules. Change
none of them. Open no file outside the list.

Return exactly two lists and nothing else:

1. Changed: one line per file, giving the comments rewritten and deleted, and whether the format
   command ran.
2. Not yet tidied: per file, the line numbers of each comment outside the scope that breaks a rule.
   Write "none" where a file has none.
```

## What the tidier never sees

| Withheld | Why |
|---|---|
| The session's transcript | a tidier that knows the session's history writes that history into the comments |
| Files outside the diff | the user scoped the work to the files they touched, and a repo-wide sweep is a different request |
