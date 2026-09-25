---
name: run-spike
description: >-
  Answer a gate's questions by measuring before anything gets built. Number the questions, build a
  scratch rig with local stand-ins and instruments, run each case through a runner that keeps its
  raw output, control every case before counting it, and fill a results file where each row says
  measured or not measured. The write-up goes to the spike shape in `work-report`.
when_to_use: >-
  Use when a plan's gate asks how something behaves rather than asking for something to be built,
  when two tools or frameworks have to be compared on numbers, when a claim about a CLI, an agent
  or a library has to be proved before a spec relies on it, or when a spike report came back and
  nobody can tell what was tested. Do not use it for verifying a built screen, which is
  `verify-ui`. Trigger phrases "spike this", "run a spike", "measure it before we build",
  "bake-off", "test how it behaves", "what did you do to test this".
argument-hint: "[spike-name]"
metadata:
  suite: captain-phil
---

# Run a spike

The short version: number the questions, write the results file, build a scratch rig, run every
case through `scripts/run-case.mjs`, control each case before it counts, fill one row per question,
copy out the fixtures a later gate needs, then hand the write-up to `work-report`'s spike shape.

**Every claim in the write-up names the case folder that proves it.** A claim with no folder behind
it goes in the results file as not measured.

`<skill dir>` in every command is the folder holding this `SKILL.md`. An installed skill is a
symlink, so the path differs per repo.

## 1. Fix the questions

1. Name the spike with `$1`. Where `$1` is empty, derive a short kebab-case name from the gate's
   title and say which name you picked.
2. Copy the gate's questions and number them `Q1`, `Q2` and on. Keep that id for the whole spike: a
   case name, a results row and a report line about one question all carry the same id.
3. Write beside each question what a measured answer looks like: a count, a duration, an exit code,
   a field in a file. Rewrite a question that has no observable answer, or mark it not measured,
   before any case runs.
4. Write down the spec or plan sentence each question tests, where one exists. A finding that
   breaks it goes in its own section later.

## 2. Open the results file

1. Confirm the project's `.context/` folder is gitignored with `git check-ignore -q .context/spikes`.
   Exit 1 means it is not ignored: add `.context/` to `.gitignore` before writing anything.
2. Copy `assets/results.template.md` to `.context/spikes/RESULTS-<spike>.md`.
3. Fill one row per question, every row marked not measured. A row changes to measured when a case
   proves it, so an unanswered question stays visible.

## 3. Build the rig

The rig lives in `.context/spikes/<spike>/`. It never touches the working tree the spike is about.

- **A scratch copy.** Clone or copy what is under test into the spike folder, commit its starting
  state, and record that commit.
- **A scratch copy outside the project, where the tool reads parent folders.** A tool that loads
  configuration from every parent folder, as an agent loads each `CLAUDE.md`, picks up the project's
  own files from inside `.context/`. Make that scratch copy in a folder from `mktemp -d`, and record
  its path in the results file.
- **A reset.** Write a reset that puts the scratch copy back to the recorded commit and deletes what
  the last case left behind. Run it before every case.
- **Local stand-ins for anything that reaches out.** Use a bare git repo in place of a hosted remote,
  a local server in place of an API, and a throwaway account in place of a real one. Name each
  stand-in in the results file, because each one limits what a result proves.
- **Instruments, added on purpose.** Every count in the report comes from a file an instrument
  wrote: a hook that appends each call to a log, a sampler that lists a folder every second, the
  command's own structured output. Decide what each question counts and add the instrument before
  the first case.
- **Instruments that write to the case folder.** The runner sets `SPIKE_CASE_DIR` to the case
  folder for the command it runs. Point every instrument's log there, so each count sits beside the
  case that produced it and the reset never deletes it.
- **The runner.** Run every case through the bundled script. It refuses to overwrite a case folder,
  so a rerun never replaces the case a claim cites:

  ```bash
  node <skill dir>/scripts/run-case.mjs .context/spikes/<spike> <case> --cwd <scratch copy> -- <command> [args...]
  ```

Where the spike runs headless agents, `references/agent-cases.md` holds the runner flags, the hook
logger and the settings a worker inherits from the operator's machine.

## 4. Run and control each case

1. Name each case after the question it answers, as `q3-prompt-file`, and add `-2` for a rerun.
2. Run the reset, then the case.
3. Confirm the case exercised the thing before counting it. A push that printed
   `Everything up-to-date` tested nothing, and reporting it as "allowed" is the failure this step
   exists to prevent. Read the case's output for the action happening, rather than for the absence
   of an error.
4. Run a negative case wherever a question asks whether something is blocked or denied, and confirm
   it fails the way the question predicts. A check that cannot fail proves nothing.
5. Record how many runs back each answer. One run is a result with n = 1, and the row says so.
6. Mark a case that failed its control as void in the results file, with the reason, and rerun it
   as `<case>-2`.

## 5. Fill the results file

1. Write the method once at the head: what the scratch copy holds, each stand-in, each instrument,
   the runner's settings, and the tool versions.
2. Fill each question's row with the answer, the case names behind it, and measured or not
   measured.
3. Give every not-measured row its reason: the case never reached the condition, a stand-in could
   not reach it, or nobody named the resource it needed.
4. Split a partly measured answer across its status, as "measured against a local origin, a hosted
   origin not measured".
5. List findings that conflict with the spec or plan in their own section, each with its case name
   and the sentence it breaks.
6. List what the runs showed that no question asked, in a section of its own.

## 6. Keep the evidence

1. Copy each output a later gate will test against into `.context/spikes/<spike>/fixtures/`, under
   a name saying what it shows, and list the fixtures in the results file.
2. Leave `out/` in place. The results file cites it.
3. Stop every background process the rig started, such as a sampler or a local server, and confirm
   none is left running.

## 7. Hand back

Run `work-report` and pick its spike shape. The report cites the results file for the full table,
names the case behind every claim, and carries its items under their question ids.
