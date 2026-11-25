---
house_style: true
read_when:
  - "`taste-grill` is about to ask its next question, and needs the planned order and what each question covers"
  - "A question has to be written in the grill's shape"
  - "The designer's answer is not a single letter, and has to become entries"
---

# The question bank

The planned questions for `taste-grill`, in the order it asks them, and how it writes each question and reads each answer.

## The planned questions

Each question covers one or more headings of the default taste, and asks only about the `[style]` rules under them. `The one rule: clarity` holds bar rules alone, so no question covers it. The questions about where a design comes from go first, because an answer there can reshape the questions about systems and copy.

| Q | Headings it covers | The default on this axis | Shape |
|---|---|---|---|
| 1 | Where a design starts | Start from the user's moment and the constraints, never from a concept | Keep, change or drop |
| 2 | Convention, then break it | Lay out with conventions first, then break one where it helps the user. Borrow across verticals, and never play it safe to the point of sterility | Keep, change or drop |
| 3 | Delight: hero moments, not everywhere | Land a few hero moments. No delight where stakes or stress are high, or on tasks done many times a day | Keep, change or drop |
| 4 | Density: the onion | Three layers, with the default layer showing what this moment needs and the rest one tap away | Keep, change or drop |
| 5 | Data on screen | Every summary stat changes what the user does next. A status group never repeats its status on each row, and a node graph appears only where the data branches | Keep, change or drop |
| 6 | Design systems | Work inside the system, with no one-off variants. One shape keeps one meaning, the action colour marks only what can be acted on, and the destructive style is only for what can't be undone | Keep, change or drop |
| 7 | Copy | The fewest words that make the point, with a voice in small doses. Copy never explains the product's rules, and a kind is named by grouping or an icon, never an inline prefix | Keep, change or drop |
| 8 | Process | Explore wide at middle fidelity and go to hi-fi quickly, with no lo-fi stage. Three options that differ in premise per round, and a per-screen state switch in every prototype | Keep, change or drop |
| 9 | Working with product and engineering, Critique | Keep the shared context current, and listen when an engineer says a thing costs too much. In critique, ask first what the maker was going for, and prefer async feedback to live | Keep, change or drop |
| 10 | What good looks like | Products that commit fully to a point of view, stay focused tools, curate over volume and use design to teach | Open prompt |
| 11 | Things that make the default twitch | Pet peeves such as tight gaps between buttons, a modal on a modal, overused gradients and a coloured stroke down a card | Open prompt, then keep, change or drop |
| 12 | Unslop design check | The tells of machine-made work: filler badges, redundant labels, a random italic word, decoration that does no work | Keep, change or drop |
| 13 | Budget, The ambient glow, Timing and easing tokens | Motion informs or confirms, one motion story per interaction, nothing moves while idle, and everyday motion stays under 300 ms | Keep, change or drop |
| 14 | Entering and leaving, Lists and detail, Moving things, Touch and gestures, Feedback, Haptics on mobile, React Native and Expo | Ease-out in and ease-in out, popovers grow from their trigger, no overshoot on everyday UI, and haptics confirm without decorating | Keep, change or drop |
| 15 | Before showing anyone anything, Before calling motion done | Which of the designer's changes join the pre-flight checks | The closing question |

A Change can add questions: where the designer changes a heading without saying which rule, the follow-up is its own numbered question, and the total goes up by one.

## Writing a question

Every question follows one shape, so the designer reads each the same way:

```markdown
**Q1 of ~15: Where a design starts**

The default starts from the user's moment and the constraints: who is using it, where they are, what they need to get done and the real data. It never starts from a concept.

A) **Keep** (recommended). The rules stay as they are. The work opens on the user's situation and data. A booking flow starts from someone rebooking on a phone in a queue.
B) **Change.** You say what you start from instead, in your words. The work opens there. A booking flow starts from a moodboard of travel brands.
C) **Drop.** No rule on where a design starts. The work opens wherever the brief does. A booking flow starts from the brief's feature list.
D) **Talk it through.**

Keep, because nothing in your overrides file points elsewhere. Change if you work concept-first, and expect a call for the edge cases that approach misses.
```

- **Give every option the same slots,** in the same order and at the same length: what it means for the rules, what the work looks like, one example.
- **Keep every example generic,** from any app or product, and never from the designer's current brief.
- **Say the pick and its trade-off in one line after the list,** never by writing the recommended option in more detail.
- **Write an open prompt as a request for names.** Ask which products, objects or makers the designer holds up, or what makes them twitch. Add A, B and C as a short optional guess list drawn from the default's own section, and D) Talk it through. Turn the names they give into Add entries, then ask keep, change or drop on the default's own list as the next question.

## Reading an answer

| The designer answers | Write |
|---|---|
| One letter | The entry that letter names. A Keep writes `- Keep all.` under each heading the question covers |
| Letters combined, such as "B for the voice rule, A for the rest" | One entry per part. Every part is an answer |
| A Change with no new rule | Nothing yet. Ask which rule and their version of it as the next numbered question |
| Their own words, with no letter | Their words as the entry, under the closest letter. Say your reading back in one line, and let a correction edit the entry |
| A line that sharpens an earlier answer | An edit to that answer's entry, never a new question |
| "Your pick" | The recommended option's entry |
| A requirement added beside the answer | An `Add` entry of its own, under the heading it fits |
| A push on a `[bar]` rule | Nothing. Name the rule in one line, and say it holds whatever the taste |
| A request to park the question | Nothing yet. Move the question to the end of the plan, and ask the next one |

When the answer is not a pick:

- **"Talk it through" gets a stance, not another set of options.** Name what the default rule protects against, propose one rule that would settle it, and close on one yes-or-no question asking whether that rule lands.
- **"None of these" gets guesses.** List three or four short guesses at what is off, such as the question, the default it states or one example, and let the designer pick a number.
- **"More options" changes the premise.** Name the premise the last set shared, drop it, and write the new set on a different axis.
