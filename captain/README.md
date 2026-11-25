---
house_style: true
read_when:
  - "A designer is setting up a brain repo for the suite"
  - "A skill reports that it found no `captain.json`, or offers to add a product entry"
  - "A `captain.json` slot has to be added, renamed or retired"
  - "A repo still keeps its host file at `.agents/host.json` and has to migrate"
---

# The brain index

A designer keeps their own brain repo: their taste, their plans, and their notes on each product repo they work in. The suite never lays the brain out. It reads one file at the brain's root, `captain.json`, and follows its slots to everything else.

`captain.json` works like the host file one level up. The host file answers one product repo's questions. `captain.json` says where the designer's taste and plans are, which product repos they work in, and where each repo's host file is kept in the brain. Product repos stay untouched.

## Finding the brain

A skill finds the brain through the first of these that matches:

1. `captain.json` in the session's working directory, or at the root of the git repo that holds it. A session started from the brain finds it here.
2. The `CAPTAIN_BRAIN` environment variable, holding the brain's folder.
3. `~/.claude/captain.json`, holding `{"brain": "<path>"}`. A session started from any folder on the machine finds the brain here.
4. None of them. The skill falls back to the product repo's own `.agents/host.json`, with a warning. [Migrating from the in-repo host file](#migrating-from-the-in-repo-host-file) covers that case.

[The lookup](lookup.md) is the procedure a skill follows, step by step, including how it picks the product repo and when it offers to write a missing entry.

## Setting up a brain

[Step 3 of the README's install](../README.md#step-3-the-brains-captainjson) fetches the filled template from `captain/templates/` into the brain's root. Edit the template's values to match the brain: the taste overrides file, the plans folder, and one `products` entry per product repo. Delete the example product, and set any slot the brain has none of to `null`.

To find the brain from a session started in a product repo, run this once from the brain's root. It writes the pointer file, and refuses to overwrite one that exists:

```bash
mkdir -p ~/.claude && (set -C; printf '{"brain": "%s"}\n' "$PWD" > ~/.claude/captain.json)
```

A designer who keeps more than one brain sets `CAPTAIN_BRAIN` per shell instead, because the variable wins over the pointer file.

## The slots

`captain/captain.schema.json` defines every slot, and its `description` fields give each slot's meaning, including what its `null` says.

| Slot | Holds |
|---|---|
| `taste` | The designer's taste overrides file, loaded on top of the default taste |
| `plans` | The folder plans are written to. The reviewer's test plans and misses checklist sit in its `tests/` subfolder. |
| `tools` | Outside tools, keyed by a name the designer picks, each mapped to its path or command |
| `products` | One entry per product repo: `name`, `path`, `host`, `reference` and `notes` |

Each `products` entry names the repo's root in `path`, and its host file in `host`. The host file follows [the host file spec](../host/README.md) and is shaped by `host/host.schema.json`. `reference` names a second repo whose code style new code copies, and `notes` names the designer's notes on the repo's code. A skill that offers to record an answer writes it to the file `host` names, never into the product repo.

A relative path resolves against the brain's folder, and a path starting with `~/` resolves against the home folder. Which skills read a slot is in each skill's `metadata.captain`, the one place that list is kept.

## The three-state rule

Every slot, and every field of a `products` entry apart from `name` and `path`, follows the host file's [three-state rule](../host/README.md#the-three-state-rule). A value is the answer. A `null` means the brain has none of that thing, so the skill skips the step, says so in one line, and never asks. An absent slot means nobody answered, so the skill runs its fallback.

Two cases are particular to `captain.json`:

- **An empty `products` list is a value.** No repo is listed yet, so a skill run in a product repo offers to add its entry. A `null` there says the brain manages no product repos, and no skill offers.
- **An absent `host` falls back to the repo.** The skill reads the product repo's own `.agents/host.json` and prints the migration warning. A `null` `host` says the repo has no host answers.

## Migrating from the in-repo host file

For one release, a skill that finds no host file in the brain reads the product repo's `.agents/host.json` and prints a one-line warning naming `captain.json`. A later release drops the fallback, and a repo still relying on it then reads as having no host file.

To migrate a product repo, run this from its root, with `BRAIN` set to the brain's folder and `NAME` to the repo's entry name. It copies the host file into the brain, and leaves a host file already there untouched:

```bash
mkdir -p "$BRAIN/hosts" && cp -n .agents/host.json "$BRAIN/hosts/$NAME.json"
```

Then add the repo's entry to the brain's `products`, with `host` set to `hosts/<name>.json`, and delete `.agents/host.json` from the product repo. A skill run in a repo with no entry makes the same offer, and copies the in-repo host file across when the designer says yes.

## How a skill reads it

An installed skill reads nothing outside its own folder, so each skill that reads a slot carries a copy of the lookup:

- **The canonical file** is `captain/lookup.md`. Edit only this one.
- **Each copy** sits at `references/captain-lookup.md` inside the skill, and matches the canonical file byte for byte.
- **`metadata.captain`** lists the slots the skill reads, as `metadata.host` does for host slots. A skill that ships the lookup lists `products`.

```yaml
metadata:
  suite: captain-phil
  hand: captain
  host: [checks.typecheck, dev.url]
  captain: [products]
```

The guard fails a copy that differs from the canonical file, a `metadata.captain` key the schema does not define, a skill that declares a slot and ships no copy, and a skill that ships a copy without declaring `products`. It also validates every template in `captain/templates/` against the schema.

## Adding a slot

1. Add the slot to `captain/captain.schema.json`, accepting `null` alongside its type.
2. Write its `description` as the definition a reader arrives wanting, including what its `null` says.
3. Add its row to *The slots*.
4. Fill the slot in every template in `captain/templates/`, using `null` where the example brain has none.
5. Add the slot to the `metadata.captain` of each skill that reads it, and state the fallback in its `compatibility` line.
6. Run `npm run guard`, which fails on a slot the schema does not know and on a template that does not validate.
