---
house_style: true
read_when:
  - "`house-style` is about to look for the example code a change copies"
  - "Two examples in a repo disagree, and one has to be picked"
  - "A repo has no example of the kind of code a change adds"
---

# Finding a reference

The reference is the code a change copies its shape from. A good one makes every later choice easy, and a poor one spreads its accidents through the repo. Look in the order given, and stop at the first place that has an example of the kind of code the change adds.

## The lookup order

| Order | Where | How to read it |
|---|---|---|
| 1 | The notes on this product, at the entry's `notes` | Read the file. Each pattern cites the file it came from, so check that file still says the same thing |
| 2 | The product's agent index and stack doc | `docs.index`, or `AGENTS.md` or `CLAUDE.md` at the repo root where the slot is absent. The index names the stack doc where the repo has one. Both say what the repo allows, which outranks what any one file does |
| 3 | The product's own code, on its trunk | `git fetch`, then `git show origin/<trunk>:<path>`. The trunk is `git.trunk`, or else the remote's default branch, which `git symbolic-ref --short refs/remotes/origin/HEAD` prints as `origin/<trunk>`. With no remote, that command fails, and you read the working tree |
| 4 | The reference repo, at the entry's `reference` | `git -C <reference> show HEAD:<path>`, or its working tree where it is not a git repo. Read it only for kinds of code the product has no example of |
| 5 | The designer | Ask once which repo or file to copy. Offer to record a repo as the entry's `reference` in `captain.json` |

Read from the trunk rather than the working branch, because the branch may already have drifted. Where the change itself is on the trunk, the working tree is the trunk.

## What makes code a good reference

Pick by these, in order:

1. **The same kind.** A screen for a screen, a data call for a data call. A component is a poor reference for a screen, even in the same repo.
2. **Written and kept by a person.** Generated code, vendored packages, a spike nobody returned to and a fixture are not references.
3. **Shared by more files.** Where two screens disagree, follow the shape more screens use, and name the other one in the notes as a known exception.
4. **Recent on the trunk.** Between two examples used equally often, `git log -1 --format=%cs -- <path>` tells which was touched last, and the later one wins.

Where the agent index and the code disagree, the agent index is the rule and the code is the drift. Follow the index, and name the drifted files in the notes.

## A reference repo

A reference repo is any repo whose code the designer wants new code to read like. It can be a starter the team builds from, an earlier product or a completely different codebase.

- Take its patterns, never its files: no code, names, copy or assets cross into the product.
- Its stack can differ. Take what transfers, such as file shape, naming and where logic lives, and leave what doesn't, such as a library the product doesn't use.
- Where the product's own code and the reference repo disagree, the product wins, because its code is what the next reader sees beside the change.

## Platforms

A native build and a web build of one product share some things and not others. Shared things match across both: colour roles, corner radii, words, behaviour and the icon family. Each platform keeps its own spacing, type scale and legibility fixes, and a difference there is adaptation, not drift.
