---
house_style: true
read_when:
  - "A claim from a drift check is being given a verdict"
  - "A drift table is being ordered before it goes to the user"
  - "Two sources disagree and the run has to say which one stands"
---

# Drift verdicts

Every claim a drift check finds gets exactly one verdict. The verdict says which side is wrong, so
it also says where the fix goes. Every example here is invented.

## The verdicts

| Verdict | Test | Fix goes to | Invented example |
|---|---|---|---|
| `code-wrong` | The sources agree with each other, and the code or the copy a user reads does something else | The code, with its comment | The sources say a refund takes 5 days, and the confirm reads "Refunds land in 24 hours" |
| `comment-wrong` | The code agrees with the sources, and its comment describes something else | The comment, then `tidy-comments` | The code locks the form after 5 tries, as the spec says, and the comment says 3 |
| `self-split` | A comment and the code beside it disagree, and no source covers the point | The owner of the rule, as a question | The comment says a link lasts an hour, and the constant holds 24 hours |
| `sources-split` | Two written sources disagree with each other, whatever the code does | The owner of the older source | A spec says 5 tries, and a later decision record says 3 |
| `code-only` | The code enforces a rule no source states | The owner, to record it as a decision or have it removed | A typed code drops its spaces before the lookup, and no doc says it does |
| `open` | A source holds the point open, and the code has picked an answer | Nobody yet, and the row names the open question | The code charges no fee, and the decision record still asks whether there is one |
| `agrees` | The code, its comment and every source say the same thing | Nowhere, and the row is counted rather than shown | |

## Which source stands

1. **The newest dated source stands**, where two disagree. A decision dated 8 March outranks a spec
   last edited on 1 March, even where the spec is the longer document.
2. **A comment on a ticket is a source**, dated by the comment rather than by the ticket.
3. **A ticket's acceptance criteria outrank the ticket's description** where the two disagree.
4. **A draft is never a source.** A note marked unposted, a branch-only doc or a proposal marked not
   approved records what somebody meant to say.
5. **Date a doc in the repo by the commit that last changed the lines in question**, from
   `git log -L`, rather than by a status line or a sign-off date in its text. A doc signed off on one
   day and edited three days later carries two dates, and only git knows which line has which.
6. **The code is never a source for itself.** Code that has done something for months has been
   unreviewed for months, which is no ruling.

## Order

Put the rows to the user in this order, so the first screen of the table holds the rows that change
what a user reads or what the product does.

1. `code-wrong` where a user reads the wrong thing.
2. `code-wrong` everywhere else.
3. `self-split`.
4. `sources-split`.
5. `open`.
6. `comment-wrong`.
7. `code-only`.

## What a search with gaps proves

A search that found nothing proves nothing about the places it did not read. Every verdict that rests
on an empty search names those places: a meeting it skimmed rather than read, a channel it did not
search, a page of results it did not open. A row that says "no source mentions it" without its gaps
is a row the user cannot trust.
