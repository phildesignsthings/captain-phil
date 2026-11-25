---
house_style: true
read_when:
  - "A skill is about to read a host file slot, or a `captain.json` slot such as `taste` or `plans`"
  - "A skill offers to record an answer"
---

# Finding the brain and the host file

A product repo's answers live in a host file, and the host file lives in the designer's brain repo. The brain's root holds `captain.json`, an index that lists each product repo and the host file kept for it. Run this lookup before reading any slot, in the order written, and stop at the step that settles it.

The lookup itself writes nothing. Where a step offers to write, ask once, and write only after a yes. A run with nobody to answer writes nothing and carries on. Every write goes into the brain, never into the product repo.

## 1. Find the brain

The first match wins.

1. **The working directory.** Look for `captain.json` in the session's working directory, then at the root of the git repo that holds it.
2. **The `CAPTAIN_BRAIN` variable.** Run `echo "$CAPTAIN_BRAIN"`. A value is the brain's folder, and the index is the `captain.json` inside it.
3. **The pointer file.** Read `captain.json` in the `.claude` folder of the home directory (`echo "$HOME"` gives the home directory). It holds `{"brain": "<path>"}`, and the index is the `captain.json` inside that folder.
4. **Nothing found.** Go to step 4, the fallback.

Where a match names a folder holding no `captain.json`, say so in one line naming the folder, and try the next match. Where `captain.json` is not valid JSON, say so in one line with the parse error, and stop the lookup with no host file. A broken index is the brain the designer meant, so a later match never stands in for it.

Inside `captain.json`, a path starting with `~/` resolves against the home directory, and any other relative path resolves against the brain's folder.

## 2. Find the product repo

The target is the folder the task names, or the working directory where the task names none. An entry in `products` matches when the target is its `path` or sits inside it. Where two entries match, the longer `path` wins, because one repo sits inside the other.

| What `products` holds | What to do |
|---|---|
| One matching entry | Use it, and go to step 3. |
| No match, and the target is the brain or a folder inside it | With one entry, use it. With several, ask once which product the task is for, naming each entry's `name` and `path`. With none, say in one line that `captain.json` lists no product repo yet, and go on with no host file and no offer. |
| No match, and the target is outside the brain | The repo has no entry. Make the offer in step 5, then go to step 4 for this run. |
| An empty list, or no `products` key | Treat it as no match, and take whichever of the two rows above fits the target. |
| `null` | The brain manages no product repos. Say so in one line, and go on with no host file and no offer. |

## 3. Read the entry's host file

The entry's `host` follows the three-state rule.

- **A path.** Read the file it names. That is the host file. Where the file does not exist, say so in one line naming the path, and read every slot as absent. Where it is not valid JSON, say so in one line naming the path and the parse error, read every slot as absent, and make no offer to record an answer, because a write would replace what the designer wrote.
- **`null`.** The repo has no host answers. Say so in one line, read every slot as absent, and make no offer to record one.
- **Absent.** Nobody answered. Go to step 4.

A slot named `group.leaf` is the `leaf` key inside the host file's `group` object. A value is the answer, and the skill uses it. A `null` means the repo has none of that thing: the skill skips the step, says so in one line, and never asks. An absent slot sends the skill to the fallback its `compatibility` line names.

## 4. Fall back to the repo's own host file

For one release, the suite reads a host file kept inside the product repo as a fallback, and a later release drops it. Walk up from the target to the first `.agents/host.json`, and stop at the root of the git repo that holds the target, because a host file above that root belongs to another folder. Where the target sits in no git repo, look in the target alone.

- **Found.** Read the slots from it, and print this warning on its own line: "Read this repo's `.agents/host.json`. A later release stops reading it there: move it into your brain and list the repo in `captain.json` (https://github.com/phildesignsthings/captain-phil/blob/main/captain/README.md)."
- **Not found, after step 2 found no entry.** Read every slot as absent. Step 5's offer is the only line to print.
- **Not found, after step 3 found no `host`.** Read every slot as absent, and print one line naming the entry: "The `<name>` entry in `<brain>/captain.json` has no `host`, so this skill has no host answers and runs its fallbacks."
- **Not found, with no brain.** Read every slot as absent, and print one line: "No `captain.json` found, so this skill has no host answers and runs its fallbacks. To set one up, see https://github.com/phildesignsthings/captain-phil/blob/main/captain/README.md." Make no offer, because the suite never creates a brain.

## 5. Offer to add a missing entry

Where a brain is found and no entry matches a target outside it, print one offer on one line. Name the index by its full path, and name the entry it would add:

> `<brain>/captain.json` has no entry for this repo. Add `{"name": "<repo folder name>", "path": "<repo root>", "host": "hosts/<repo folder name>.json"}` to its `products`, and create that host file?

The host file it creates holds a copy of the repo's `.agents/host.json` where the repo has one, and `{}` where it has none. After a yes, write both files and run the lookup again. Make the offer once per session.

## 6. Record an answer

A skill that offers to record a slot's answer writes it into the host file the entry's `host` names, inside the brain.

- **The entry has no `host`, or its file is missing.** Offer to create the file at `hosts/<name>.json` in the brain, and to set the entry's `host` to it.
- **The entry's `host` is `null`.** Make no offer, because the designer said the repo has no host answers.
- **The entry's host file is not valid JSON.** Make no offer, and say in one line that the file has to be fixed before an answer can be recorded in it.
- **No brain was found.** Say in one line that the answer cannot be recorded without a `captain.json`.

Never write an answer into the product repo, its `.agents/host.json` included.

## The other `captain.json` slots

A skill reads only the slots its `metadata.captain` lists. `taste`, `plans` and `tools` follow the same three-state rule as a host slot:

- **A value.** Resolve the path, and use it.
- **`null`.** The brain has none of that thing. Skip the step, say so in one line, and never ask.
- **Absent, or no brain.** Run the fallback the skill's `compatibility` line names.
