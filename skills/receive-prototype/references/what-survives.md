---
house_style: true
---

# What survives a handoff

A prototype folder is two things wearing one coat: a set of decisions somebody made on purpose, and a set of machinery that exists so those decisions could be seen without a backend. The first travels into the application. The second was built to be deleted.

This is the generic list. Where the source repo answers `surfaces.receiveDoc`, that file is the authority and this one is the fallback.

## What carries a contract

| What | Why it survives |
|---|---|
| The runtime schemas for each entity | Each one is a contract you can diff a real response against, rather than a type that vanishes at build time. It is the single most valuable file in the folder |
| The shape each data hook returns | A hook returning named fields rather than a fetching library's own result object is the whole surface you re-implement. Keep the names, and the screens need no edit when the data becomes real |
| The screens, and their loading, empty and error states | All four were designed rather than defaulted. An empty state is a product decision, and re-deriving it costs a design round |
| The transitions on the moments that carry them | Motion on a hero moment is intent. Keep it, or re-create it deliberately, rather than losing it by omission |
| The theme file | Where the look is one file of explicit values and nothing is styled per screen, porting the look is porting that file. The receiving application still owes whatever compiles those values into its own utilities |
| The design record and the developer record | The first says what system the screens landed; the second says what was real, what was faked and which choices were deliberate. Both stop a reviewer re-litigating a decision as an accident |

## What stays behind

- **The harness the source repo runs its surfaces inside** — the device frame, the palette, the surface listing, the theme switcher. It is the source repo's own interface rather than part of this work.
- **The demo machinery.** Forcing a screen into a loading or error state, and the scenario switches beside it, exist so a screen could be reviewed. They are marked so they can be found by grep rather than by memory.
- **The discovery metadata.** The per-surface config file and whatever registry reads it are how the source repo finds its surfaces. The receiving application has its own router.
- **The fixtures**, once the endpoint is real. Keep one per state while the states are being proved, then delete them with the loader.

## The three questions a receiving developer asks

1. **Is this real or faked?** The developer's record answers it, and a stale one is worse than none. Where it disagrees with the code, the code wins and the record gets corrected in the same commit.
2. **Why is it like this?** The design record answers it. A value in there is a rule the screens already follow rather than a suggestion.
3. **What happens when the data is wrong?** The parse at the seam answers it. Leave the parse where it is when the fetch becomes real: it is how a contract drift announces itself rather than rendering as a blank cell.
