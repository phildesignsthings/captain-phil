---
house_style: true
read_when:
  - "A QA run is being set up, or its result looks wrong"
  - "A screenshot, a log or a server went somewhere unexpected"
  - "A planted failure passed, or a green run looks too clean"
---

# Run pitfalls

Each of these has made a run report something false. Read the list before a run, and again when a result surprises you.

## Paths and folders

- **Give every screenshot and log an absolute path.** A relative path resolves against the folder the tool runs in, and a wrapper that changes into the repo drops untracked files into the worktree under test.
- **Write logs and scripts to a folder you named, not the shell's temp folder.** The temp folder an agent's shell reports can differ from the one its tools use, and a background server whose log redirect fails never starts, with no error on screen.
- **Keep `verify-ui`'s screenshots out of the build.** It writes them to `.context/` in the project root, and adds that folder to `.gitignore` where it is not ignored. In a worktree under test that edit is a change to the build: copy the screenshots into the evidence folder, undo the edit with `git checkout -- .gitignore`, and say so in the report.
- **A scratch copy can miss a gitignored file the build needs,** such as a generated type file or a local env file. Run the same check on an unstripped checkout too, so a setup error is not blamed on the change.

## Stale state

- **An app left open by an earlier run keeps that run's bundle.** On a simulator, quit the app, launch it against your own bundler, and wait for the bundler to log that it served the bundle before the first flow.
- **A warm test cache can hide a file the change added.** A runner that caches module scans may not see a test or a source file added since the cache was built, so a planted failure passes. Move the cache aside in your own worktree before proving a scan can fail.
- **A dev server reloads a plant into a running browser.** Plant a break only after the server on that copy is stopped.

## Reading what the screen says

- **Tap inside a control's claimed hit area, as well as its visible part.** An extended hit area on a control tucked against an edge may not reach inward.
- **Read a count beside a list of the same thing for every record,** in a script. The count can come from one field while the list comes from another source.
- **Check which link reads as current on a child route.** A router can mark the parent link active on every child path unless the link asks for exact matching.
- **Script the keyboard path with every tab stop in it,** including a panel that takes focus itself, and read focus rings from a screenshot rather than from a computed style string.
- **Load every state a screen can show,** not only the ones a page lists. A hand-written list of states misses some.

## Proving nothing moved

When the plan says a refactor changed no behaviour, compare against the base commit:

1. Make a second worktree at the base SHA, with its own dependencies.
2. Serve the same data to both, on two ports.
3. Dump each screen's text and each element's rounded box on both sides, and compare them as lists, with clock times masked.
4. Report each difference by element. One extra wrapper is expected, and anything else moved.

Remove the second worktree in the clean-up.

## Processes

- **Stop a server by the process id you recorded,** never by name or by port. A name match reaches servers the editor or another session owns, and a port can be held by someone else's server.
- **Wait on a long background run by its process id,** and give the wait a timeout, so a hung run ends with a result rather than silence.
