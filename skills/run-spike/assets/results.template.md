# Spike results: <spike name>

<The gate or plan this answers, and the date.> Every row says **measured** or **not measured**.

## Method

- **Scratch copy:** <what it holds, and the commit the reset returns to>
- **Stand-ins:** <each local stand-in, and what it replaces>
- **Instruments:** <each file an instrument writes, and what it counts>
- **Runner:** `run-case.mjs`, with <the command and its settings>
- **Versions:** <each tool under test, with its version>

## Answers

| Id | Question | Answer | Cases | Status |
| --- | --- | --- | --- | --- |
| Q1 | <question> | <what happened, with the number> | `<case>`, `<case>` | **measured** (n = <runs>) |
| Q2 | <question> | <why no case reached it> | | **not measured** |

## Findings that conflict with the <spec | plan>

- <what the case did, and what happened> (`<case>`). The <spec | plan> says <the sentence it breaks>.

## What the runs showed that no question asked

- <finding> (`<case>`). **measured** (n = <runs>)

## Void cases

- `<case>`: <why its control failed>, rerun as `<case>-2`.

## Fixtures

- `fixtures/<name>`: <what it shows>
