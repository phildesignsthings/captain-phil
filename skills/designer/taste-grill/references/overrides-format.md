---
house_style: true
read_when:
  - "A session loads the taste, and the designer's overrides file has to be laid on the default"
  - "A skill writes a taste call into the overrides file the `taste` slot names"
  - "Somebody asks how an override names the default rule it changes"
---

# The taste overrides file

The designer's overrides file holds only where their taste differs from the default taste. The `taste` slot of `captain.json` names it. `taste-grill` writes it, and `captain-phil-mode` lays it on `references/default-taste.md` and `references/default-motion.md` when a session opens.

## How an entry names its rule

A default rule has no id. It is named by two things, and the pair is unique across both default files:

1. **Its heading**, the nearest heading above the rule, such as `Copy` or `Entering and leaving`.
2. **Its lead**, the bold text the rule opens with, such as `Voice shows in small doses,`.

An entry sits under a `##` heading that repeats the default's heading word for word, and quotes the lead between double quotes. Match a lead ignoring case and the punctuation at its end, so `"Voice shows in small doses"` names the rule whose lead is `Voice shows in small doses,`.

## The file

The file opens with one title line, then one `##` heading for each default heading the designer has answered, in the default's order. A heading appears only once it holds an entry.

```markdown
# Taste overrides

## Copy

- Change "Voice shows in small doses": a dry line on every screen, never a joke.
- Drop "Name a kind by grouping, a header or an icon, never by an inline prefix"
- Add: every number carries its unit.

## Density: the onion

- Keep all.
```

An empty file, or a file holding only the title, has no overrides yet, and the default applies as shipped.

## The four entries

Each entry is one bullet, in the designer's words, never an elaboration of them.

| Entry | Written as | What the merge does |
|---|---|---|
| Keep | `- Keep all.`, or `- Keep "<lead>"` | Nothing. It records that the designer was asked, so nobody asks again |
| Change | `- Change "<lead>": <the designer's rule>` | The designer's rule replaces the named `[style]` rule |
| Drop | `- Drop "<lead>"` | The named `[style]` rule stops applying |
| Add | `- Add: <the designer's rule>` | A new `[style]` rule joins that heading |

A heading holding any entry counts as answered. A later answer about the same rule edits its entry in place, so the file holds one live version of each.

## Laying the overrides on the default

Read the entries in file order, and apply each to the rule its heading and lead name.

1. **An entry that names a `[bar]` rule is set aside.** Name the rule in one line, and keep the default. The bar never bends.
2. **An entry whose heading or lead matches no default rule** gets one line naming it. A Change then applies as an Add, under that heading. A Drop or a Keep does nothing.
3. **An `Add` under a heading the default lacks** starts a new section of style rules.
4. **A product's design file sets the values a rule uses** after the merge, such as its spacing, colours and timings. It never changes a rule.

## The pre-flight list

The default's `Before showing anyone anything` and `Before calling motion done` sections are the checks run before work is shown. The designer's entries under those two headings change the checks the same way, so a check they add runs beside the default's.
