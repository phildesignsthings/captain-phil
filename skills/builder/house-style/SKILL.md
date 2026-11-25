---
name: house-style
description: >-
  Makes new code read like the repo's own hand wrote it. It finds the example code to copy, first
  in the repo itself and then in a reference repo the designer names, writes the patterns down in
  the brain before the first edit, writes the change in that shape, and ends every change with
  tidy-comments.
when_to_use: >-
  Use before writing or changing code in a product repo, when a change has to match the code
  already there, when a refactor brings code back in line with the repo's style, or when a review
  checks a diff for drift. Trigger phrases "house style", "match the rest of the code", "like the
  first one", "same shape as", "this drifted", "make it look like the template". Not for choosing
  a screen's layout, which `new-screen` does, or for a diff whose only change is its comments,
  which `tidy-comments` does.
argument-hint: "[the change to make]"
compatibility: >-
  Reads the product's reference and notes from its captain.json entry
  (references/captain-lookup.md). With notes a path, the pattern notes are read from it and
  written to it, and a missing file is created there. With notes null, the notes stay in the
  chat and the closing report, with no offer to record them and no question about a notes file.
  With notes absent, it asks once where they live, offering notes/<name>.md in the brain, and
  keeps them in the chat where nobody answers or no brain was found. With reference null or
  absent, the repo's own code is the only reference, and where the repo has none, it asks for
  one. Reads docs.index, git.trunk, components.dir, checks.lint and checks.typecheck from the
  host file found through captain.json, falling back to .agents/host.json. docs.index absent means
  the agent index at the repo root. git.trunk absent means the remote's default branch, and the
  working tree where the repo has no remote. components.dir absent means the folder the example
  code imports its shared components from. checks.lint or checks.typecheck null skips that check
  in one line, and absent means the matching script in the package manifest, skipped in one line
  where there is none.
metadata:
  suite: captain-phil
  hand: builder
  host: [docs.index, git.trunk, components.dir, checks.lint, checks.typecheck]
  captain: [products]
---

# House style

New code has to read as if the hand that wrote the repo's example code wrote it too: the same file shape, naming, layout, props, styling and comments. This skill finds that example, writes its patterns down, and holds the change to them. Drift is fixed, never accepted.

The short version: find the product and its notes, find the reference, write the patterns into the brain, write the change in that shape, prove it, then run `tidy-comments`.

## Hard rules

- **Read the reference before writing any code.** The repo's own example code comes first, a reference repo the designer names comes second, and asking comes last.
- **Write the patterns down before the first edit,** into the notes file in the brain, or into the reply where step 1 keeps them in the chat. Never write notes into the product repo.
- **Match the reference, not your habits.** Add no folder, pattern or library the reference doesn't use. A library outside the repo's stack is a question for the designer.
- **The code wins over the notes,** and the repo's own code wins over a reference repo. Where they disagree, follow the code and update the notes in the same session.
- **Take patterns from a reference repo, never its files.** Copy no code, names or content out of it.
- **A refactor to match the style changes no behaviour.** Prove it with before and after screenshots and the changed flows walked again.
- **Comments follow the reference's comment style,** and every change ends with `tidy-comments` over its diff, its step 4 question answered yes.
- **Read other branches through git objects** (`git show <ref>:<path>`). Never check out or switch branches in a worktree somebody else is building in.
- **Never narrow a check to make it pass.** A red lint or typecheck gets its hit fixed, never a skip, an exclusion or a looser rule.

## Steps

### 1. Find the product and its notes

Resolve the product the change is for through `references/captain-lookup.md`. The target is the repo the request names, or the working directory where it names none. Then read two keys from the product's `captain.json` entry:

| Key | A path | `null` | Absent |
|---|---|---|---|
| `notes` | Read the file where it exists. Where it is missing, note it: step 3 creates it there | Say in one line that the notes stay in the chat and the closing report. Make no offer to record them and raise no question about a notes file, because `null` is the designer's answer | Ask once where the notes live, offering `notes/<name>.md` in the brain and setting the entry's `notes`. With nobody to answer, keep them in the chat. With no brain, keep them in the chat, and say in one line that they cannot be recorded without a `captain.json` |
| `reference` | A second repo to read in step 2, after the product's own code | The product's own code is the only reference | The same as `null`, and step 2 asks for one only where the product has no example code |

A path in either key resolves the way the lookup resolves every `captain.json` path.

### 2. Find the reference

Work out what kind of code the change adds: a screen, a component, a hook, a data call, a test. Then find the code of that kind to copy, as `references/finding-a-reference.md` sets out:

1. **The notes.** Patterns the notes already record, each with the file it was read from.
2. **The product's agent index and stack doc:** `docs.index` and the stack doc it names, for what the repo allows.
3. **The product's own example code,** read from its trunk: `git.trunk`, then the remote's default branch, then the working tree where there is no remote.
4. **The reference repo,** where the entry names one, for any kind of code the product has no example of.
5. **The designer,** where neither has an example. Ask once which repo or file to copy, and offer to record a repo as the entry's `reference`. With nobody to answer, write no code: say what kind of example is missing, and stop.

Pick the example the way `references/finding-a-reference.md` § What makes code a good reference orders it: the same kind first. Where two examples disagree, follow the one more files share, and name the other in the notes.

### 3. Write the patterns down

Before the first edit, write what the reference does into the notes file, in the shape `references/pattern-notes.md` gives. One section per kind of code, and one line per pattern, each citing the file and lines it was read from. Cover shape and size, naming, where files go, props and types, styling, data and state, comments and tests, and say "none seen" where the reference shows nothing.

1. Where the notes file is missing at the path `notes` names, create it there, with any folders it needs. Where step 1 keeps the notes in the chat, write them into the reply instead, in the same shape.
2. Where the notes already hold a pattern, check it against the code read in step 2. Update the line where the code has moved on, and keep what still holds.
3. Read the file back from disk.
4. List the patterns in the reply, in a few lines, before any code. Where the designer asked for the notes only, stop here.

### 4. Write the change in that shape

1. Write the change the way the reference would. Keep files as small as the reference keeps them, and put logic where the reference puts it.
2. Where the reference extracts repeated or large markup into shared components, do the same into `components.dir`, and put helpers in the folder the reference keeps them in. Where it keeps markup inline and has no shared components, so does the change, because the hard rule against new folders and patterns wins.
3. Use a library the repo's stack doc lists. One it doesn't list needs the designer's yes before it goes in. Where the stack has its own installer that picks versions, such as `npx expo install` on Expo, install through it and report the version it picked.
4. Where the change needs a pattern the reference doesn't show, pick the one closest to the reference, and add it to the notes under § Decided by a change.

### 5. Prove it

1. Run `checks.lint` and `checks.typecheck`, and fix every hit the change caused. A hit the change didn't cause goes in the report as pre-existing.
2. For a refactor that brings code in line with the style, take before and after screenshots of each changed screen through `verify-ui`, and walk the changed flows again. Any difference between the two is a behaviour change, and gets fixed before the change is done.
3. For any change to a screen, prove it rendered through `verify-ui`.

### 6. Tidy the comments

Read `references/comment-style.md` for the comment rules the reference doesn't settle. Then run `tidy-comments` over the change's diff. Its step 4 asks whether to clean the other untidy comments in the files the diff touched: the answer is yes. Never widen past those files.

### 7. Close

1. Add to the notes anything this change decided that the next change needs.
2. Report in a few lines: the reference used and its commit, the notes file's path, what changed, the check results, and anything left for the designer.

## Review mode

`review-build`, or a designer asking whether a diff matches the house style, runs steps 1 and 2 against the diff's base, then reads the diff against the notes and the reference. A review writes nothing, the notes included. Each of these is a finding, tagged with `file:line` and the pattern it breaks:

- A file grown past the size the reference keeps, or a component defined inline where the reference extracts it.
- A folder, pattern or library the reference doesn't use.
- Naming, props, styling or data access that departs from the notes.
- A comment that restates the code, or one that breaks `references/comment-style.md`.

Where the notes and the code disagree, or there are no notes, say so in the report, and leave the update to the next build session.

## When you need

| You need | Read |
|---|---|
| Where the brain is, the product's entry, and its host file | `references/captain-lookup.md` |
| Where to look for example code, and what makes code a good reference | `references/finding-a-reference.md` |
| The notes file's shape, and how to update it | `references/pattern-notes.md` |
| The comment rules where the reference doesn't settle them | `references/comment-style.md` |
| Rewriting the comments a diff touched | the `tidy-comments` skill |
| Screenshots and proof a screen rendered | the `verify-ui` skill |
