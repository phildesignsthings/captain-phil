---
house_style: true
read_when:
  - "`house-style` is writing or checking code comments, and the reference doesn't settle a case"
  - "A review is judging whether a comment earns its place"
---

# Comment style

The reference's own comments are the first rule. Where its comments are sparse, follow them as sparse, and where it documents every export, document every export. The rules here settle what the reference leaves open.

## The rules

- **A one-line doc comment only where the name doesn't already say it.** Many exports need none.
- **A doc comment on a prop only where the prop carries a contract,** such as a unit, a range, or what happens when it is missing.
- **A `//` comment only for a why,** on the line it explains. Never restate what the code does.
- **No section banners, change history, ticket numbers, to-do chatter or narration** such as "here we load the data".
- **Plain words and short sentences,** as `unslop` sets out.

## Telling a why from a what

A comment earns its place when deleting it would lose something the code can't show.

| Comment | Keep it? |
|---|---|
| `// Fetch the user` over `fetchUser()` | No. The call says it |
| `// The API returns cents, so divide before display` | Yes. The unit is invisible in the code |
| `// Added for the onboarding work` | No. That is history, and the commit holds it |
| `// Keep this above the auth check: the splash renders before sign-in` | Yes. Moving the line breaks something the code doesn't explain |

## Handing off to tidy-comments

Every change ends with `tidy-comments` over its diff. Its step 4 asks whether to clean the other untidy comments in the files the diff touched. Answer yes, and give it no file the diff didn't touch.
