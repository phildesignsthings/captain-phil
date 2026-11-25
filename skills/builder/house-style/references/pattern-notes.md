---
house_style: true
read_when:
  - "`house-style` is about to write or update the pattern notes for a product"
  - "A review needs to cite the pattern a diff breaks"
---

# Pattern notes

The notes are the designer's record of how a product's code is written. They live in the brain, at the path the product's `captain.json` entry names in `notes`, so they outlast any one session and never touch the product repo. A build reads them before its first edit, and a review reads a diff against them.

## The shape

```markdown
# <product name>: code patterns

Reference: <repo>, read at <short sha> on <YYYY-MM-DD>.
Updated: <YYYY-MM-DD>

## <Kind of code, such as Screens>

- **Shape.** One default export per file, under 60 lines, with no component defined inside it. `src/screens/Home.tsx:1-42`
- **Naming.** Files and components in PascalCase, ending in `Screen`. `src/screens/Home.tsx:8`
- **Where files go.** One file per screen in the screens folder, with no subfolders. `src/screens/`
- **Props and types.** None seen.

## Decided by a change

- **<Topic>.** <The pattern picked, and why>. Decided <YYYY-MM-DD>, for <the change>.

## Known exceptions

- `<path>` uses <the other pattern>. Not copied.
```

Leave out § Decided by a change and § Known exceptions until each has an entry, because an empty heading tells the reader nothing.

## Writing a pattern

- **One pattern per line,** opening with a bold lead that names the topic, then the pattern in one sentence.
- **Cite where it was read,** as `path:lines` for a file or `path/` for a folder. A pattern with no citation is a habit, not a reading.
- **Say what you saw.** "Under 60 lines" is a reading and "keep screens small" is advice. Write the reading.
- **Write "None seen"** where the reference shows nothing on a topic, so the next session knows it was looked for.

Cover these topics for each kind of code the change touches: shape and size, naming, where files go, props and types, styling, data and state, comments, and tests.

## Updating the notes

1. Bump `Updated:` and the reference's commit with every write.
2. Where the code has moved on from a pattern, rewrite the line to match the code and cite the file again. Leave no superseded line behind, because the notes hold one live version.
3. A pattern a change had to pick, because the reference showed none, goes under § Decided by a change with its date.
4. A file that departs from the pattern most files share goes under § Known exceptions, so nobody copies it by accident.
5. Read the file back from disk after writing it.

The notes describe the code, so they never outrank it. Where a pattern line and the trunk disagree, the trunk is right and the line gets rewritten.
