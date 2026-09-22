# Criteria, severity and the score

Read this file once per run, at step 1 of `SKILL.md`, and hand its path to the scorer at step 3. It
holds what a score measures, the six criteria with their written scales, the severity table, the
mapping from severities to a number, and the six terms the skill uses.

## What a score measures

A score measures the surface only when three things are pinned: what was checked, how a finding was
weighed, and how the weights became a number. Leave any one of them to the auditor and the number
measures the auditor.

- **What was checked is the sweep list** in `sweeps.md`, and it is versioned. A run executes every
  sweep on one version and scores nothing the list does not cover. A check the auditor thinks of
  mid-run is reported as an off-list finding and joins the list at the next version.
- **How a finding is weighed is the severity table** below, applied by a scorer in a fresh context
  that has seen no earlier score and no bar. Severity is the one judgment call in the method, so it
  is the one made without knowing what number it produces.
- **How weights become a number is the mapping table** below, which `scripts/score.mjs` applies. Two
  auditors who agree on the findings get the same score, and a disagreement about a score is argued
  as a disagreement about one finding's severity.

Two scores compare only at the same sweep version. When the list gains a version, the baseline
surface is re-scored under it in the same session, so one comparable line survives. A re-audit after
a fix round reports two things and never subtracts one from the other: the surface's score under the
version executed, and how many of the previous run's findings closed.

The standard for every criterion is the product record's own commitment. Where the record leaves a
threshold unset — a contrast floor, a vocabulary, a device — a screen that fails the unset threshold
is a criterion 1 gap owned by the record, and no other criterion scores it as a violation. Where no
product record exists, the auditor writes the six standards as stated assumptions at the top of the
run and flags every finding that rests on one.

## The six criteria

Each criterion names the product record section its standard is quoted from, states the test, and
writes all five points of its 0–4 scale. The written scale is a sanity check on the arithmetic in
§ From findings to a score, never the arithmetic itself. Fidelity is not a criterion: a grayscale
wireframe can score 4 on all six.

### 1 · Traceability

**Standard:** the record's evidence section. Every screen, state and stated fact traces to a story,
a dated decision or a named comment, or it carries a gap marker.

**Test:** pick the numbers, the formats and the promises — a code's digit count, a cooldown, a
retention claim — and find the source. Untraceable is the finding. Where the record says a decision
is unset, the finding is that nobody has set it.

| Score | Reads as |
|---|---|
| 4 | Nothing on the surface asserts a fact nobody decided |
| 3 | The screens trace; an incidental value or two carries no source |
| 2 | A mechanism is drawn that no source describes, and nothing marks it as a gap |
| 1 | Invented mechanisms recur across more than one band |
| 0 | The surface asserts a product nobody decided |

### 2 · One system

**Standard:** the record's principles, where it separates structure from expression. Field, button,
header, message, sheet, disabled, required-marker and footnote treatments are one treatment across
every band, whichever day each band was built.

**Test:** put the same control from three bands side by side. Then look for one job done two ways —
a disabled button, an empty required field, the exit from a flow.

| Score | Reads as |
|---|---|
| 4 | A reader cannot tell which band was built first |
| 3 | One control has two treatments, and the record defends the reason |
| 2 | Several controls have two treatments, or one has two with no defence |
| 1 | Three bands, three vocabularies |
| 0 | A developer cannot name the system from the boards |

### 3 · Copy for the persona

**Standard:** the record's users section. Every word on a screen is one the named persona uses, at
the literacy the record states, in the situation the screen meets them in — tired, rushed, anxious,
one-handed, mid-task. One word per thing. No screen explains itself; the reasoning lives on the
sticky. Internal words stay internal. A reading-age number is not the standard; the persona is.

**Test:** read every heading and every button aloud in the persona's voice, at the moment the screen
appears in their day. Ask whether they would say that word, and whether they need the sentence under
it. Hunt the words the record has ruled out. Count the words in every confirmation.

| Score | Reads as |
|---|---|
| 4 | The persona's own vocabulary throughout, and no screen explains itself |
| 3 | The vocabulary holds; a few screens explain what the persona already knows |
| 2 | Two names for one thing, or a screen that assumes a mood the persona is not in |
| 1 | Internal or expert words leak, or a heading needs knowledge the persona lacks |
| 0 | The persona the record names cannot use the surface |

### 4 · Signal without colour

**Standard:** the record's accessibility section. Every state is legible in grayscale. One shape
never means two things on one surface. Colour reinforces; the word or the mark carries.

**Test:** ask of every status, error and empty state whether it reads with the hue removed. Then ask
the harder question: does any two-state pair share a mark?

| Score | Reads as |
|---|---|
| 4 | Hue could be stripped from the surface with no loss |
| 3 | Legible; one pair leans on colour to separate |
| 2 | Two marks are identical and only hue tells them apart |
| 1 | A state is distinguishable only by hue |
| 0 | The surface's core mechanic is carried by hue alone |

### 5 · Craft

**Standard:** the record's brand commitments. Lanes, type tokens, contrast, composition variety.
Fixed-width slots for icons and trailing actions, never gap alone. Tokens, never literals. No stack
of same-sized cards, and no composition repeated until it reads as a template.

**Test:** trace vertical lines through three repeated rows. Measure any text that looks faint or
small. Scan a band left to right and count how many screens share one composition.

| Score | Reads as |
|---|---|
| 4 | The lanes measure clean and no two adjacent screens share a shape |
| 3 | Lanes clean; one systemic token or contrast slip |
| 2 | A repeated element is off-token or off-library across boards |
| 1 | A board group is off the type system, or half a band is one layout |
| 0 | Nothing on the surface follows the token set |

### 6 · Completeness

**Standard:** the record's capabilities and constraints, and its positioning where it names what
the incumbent gets wrong. The states a flow needs — empty, error, offline, and loading where the run
declares it in scope. Every error names its door out and keeps its recovery hint. Every irreversible
action has friction and looks tappable. A gap is flagged, never filled.

**Loading is a run parameter.** Set `loading_in_scope` to `false` when the target stack supplies a
loading state for every fetch, so a shaping surface that omits one is drawing the right artifact;
set it to `true` when the surface is the whole product. Record the choice; sweep 19 reads it.

**Test:** walk each flow as a user who fails at every step. At each failure, ask what the screen
offers next.

| Score | Reads as |
|---|---|
| 4 | Every failure has a named way forward, and every absent state is flagged |
| 3 | The states exist; one error strands the user or drops its hint |
| 2 | A state family is absent from the surface and nothing flags it |
| 1 | A flow has a dead end |
| 0 | The surface has no error states |

## Severity

Tag every open finding with one level. The test between two levels: would a developer build the
wrong thing from this board? Yes puts it at P1 or above. Would the user be stranded? That is P0.

| Level | Name | On a surface of boards |
|---|---|---|
| **P0** | Blocking | A user has no way forward, a state is separable only by hue, or a developer cannot build the screen from what is drawn |
| **P1** | Major | A developer reading the surface ships two conventions or a fact nobody decided; a user would contact support |
| **P2** | Minor | Two treatments for one job and a builder picks arbitrarily; a workaround exists |
| **P3** | Polish | A literal where a token exists, a wording slip, an alignment drift with no visible consequence |

Severity attaches to a finding, never to a criterion. A criterion with six P3 findings scores 4.

## From findings to a score

Count the open, in-list findings per criterion and read the score off the first row that matches,
top down.

| Score | Rule |
|---|---|
| **0** | Two or more P0 |
| **1** | One P0, or two or more P1 |
| **2** | One P1, or three or more P2 |
| **3** | No P1 or P0, and at most two P2 |
| **4** | No finding above P3 |

Six criteria at 4 each make **24**. A criterion the surface cannot exercise scores `n/a` with a
one-line reason, and the maximum drops by 4 for each, so the band is read off the percentage rather
than the raw total.

| Percentage | Band |
|---|---|
| 90 and above | Excellent |
| 70 to 89 | Good |
| 50 to 69 | Acceptable |
| 30 to 49 | Poor |
| below 30 | Critical |

**Calibration:** most surfaces land between 50 and 80 percent. A 4 means no finding above polish
with the whole list swept, and a run that awards several needs its sweep log read before its score
is believed. The bar is a band the designer sets per surface and the run carries. We recommend Good.

`scripts/score.mjs` applies this section. Its `--self-test` runs each row of both tables through the
code and exits non-zero on a disagreement, so a printed score is a score the mapping produced.

## Terms

| Term | Meaning here |
|---|---|
| **surface** | The thing being scored: one Paper page of boards, or one prototype's screens |
| **band** | A row of boards on the page that draws one flow or one feature |
| **product record** | The file that states what the product is and for whom: `PRODUCT.md`, a PRD, a brief — whatever the project has |
| **design record** | The file or board that states the surface's own visual rules: a `DESIGN.md`, a rules board, an icon set |
| **sweep list** | The numbered, versioned list of checks in `sweeps.md`; a run scores only what its version covers |
| **run record** | The rendered output of one run — scores, findings, withdrawals — written to the scratch folder by `score.mjs --record` |
