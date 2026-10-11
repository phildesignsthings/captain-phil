# <Thing> ✅ <Done | Blocked | Needs a call>

<One sentence: what happened. No preamble.>

---

<!-- Middle, SPIKE shape: once, then one item per question id -->
## How I tested
- <what was built, and what it holds>
- <what stood in for the network>
- <what recorded the evidence, one item per instrument>
- <how many runs, and the runner's settings>

## What each test showed
- **Q<id> · <the answer, in a few words>.** <what was done>. <what happened>. <the number>. (`<case>`)
- **Q<id> · not measured.** <why no case reached it>.

## Findings that conflict with the <spec | plan>
- <what was done, and what happened> (`<case>`). The <spec | plan> says <the sentence it breaks>.

## Files
- `<results file>` has one row per question.
- `<fixtures folder>` has <what each fixture shows>.
- <what is left running, or "No processes are left running.">

---

<!-- Middle, CODE shape: repeat per route. On native, the deep link replaces the URL, and the
taps and the screenshot follow the line -->
## <Screen name> — <clickable URL | `xcrun simctl openurl booted <deep link>`>
<One line under 15 words, starting with a verb: "Check…", "Compare…", "Tap…">

<native only: the taps from where the link lands, then ![<screen name>](<screenshot path>)>

**Checks:** <paste the check-baseline lines, joined with " · ">

---

<!-- Middle, PAPER shape: repeat per page -->
## <Page name as the designer sees it>
- **<Board name>** — <the question it answers, one clause>. <Drawn, not built.>

---

<!-- Middle, DOCS shape: repeat per file -->
## `<path>`
- <what landed, one item per change>
- Status: <living | frozen | superseded>, where the pass changed it

---

## Two things for later
<!-- only where something changes a later step; delete otherwise -->
- <item>

**Next:** <the one action, and who takes it>
