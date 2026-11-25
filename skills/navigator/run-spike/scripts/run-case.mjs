#!/usr/bin/env node
// Runs one spike case and keeps everything it printed, so every claim in the
// write-up can name the folder that proves it.
//
// Writes stdout.txt, stderr.txt and run.json to <spike dir>/out/<case>/.
// Refuses a case folder that already exists, so a rerun takes its own case name
// and never overwrites the run a claim cites.
//
// The command runs with SPIKE_CASE_DIR set to the case folder, so a hook or a
// logger the command starts can write its evidence there too.
//
// Exits 0 once the case is recorded, whatever the command returned, because the
// command's exit code is evidence rather than a failure of this script. Exits 1
// when the command could not start, and 2 on bad usage or an existing case folder.

import { closeSync, existsSync, mkdirSync, openSync, realpathSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const USAGE = "usage: run-case.mjs <spike dir> <case> [--cwd <dir>] -- <command> [args...]";

function main(argv) {
  const dash = argv.indexOf("--");
  const head = dash === -1 ? argv : argv.slice(0, dash);
  const command = dash === -1 ? [] : argv.slice(dash + 1);
  const positional = [];
  let cwd = resolve(".");
  for (let i = 0; i < head.length; i++) {
    if (head[i] === "--cwd") cwd = resolve(head[++i] ?? ".");
    else positional.push(head[i]);
  }
  const [spikeDir, caseName] = positional;
  if (!spikeDir || !caseName || command.length === 0) {
    console.error(USAGE);
    return 2;
  }

  const out = resolve(spikeDir, "out", caseName);
  if (existsSync(out)) {
    console.error(`${out} already exists. Name the rerun as a new case, for example ${caseName}-2.`);
    return 2;
  }
  mkdirSync(out, { recursive: true });

  const stdout = openSync(join(out, "stdout.txt"), "w");
  const stderr = openSync(join(out, "stderr.txt"), "w");
  const started = new Date();
  const result = spawnSync(command[0], command.slice(1), {
    cwd,
    stdio: ["ignore", stdout, stderr],
    env: { ...process.env, SPIKE_CASE_DIR: out },
  });
  const wallSeconds = Math.round((Date.now() - started.getTime()) / 100) / 10;
  closeSync(stdout);
  closeSync(stderr);

  const record = {
    case: caseName,
    command,
    cwd,
    started: started.toISOString(),
    wallSeconds,
    exit: result.status,
    signal: result.signal,
    startError: result.error ? String(result.error.message) : null,
  };
  writeFileSync(join(out, "run.json"), JSON.stringify(record, null, 2) + "\n");

  if (result.error) {
    console.error(`${caseName}: the command did not start (${result.error.message}). Recorded in ${out}.`);
    return 1;
  }
  console.log(`${caseName}: exit=${result.status ?? result.signal} wall=${wallSeconds}s out=${out}`);
  return 0;
}

// A skill installs as .agents/skills/<name>/ with .claude/skills/<name>
// symlinked at it, so the entry path typed through the symlink never equals
// the already-resolved import.meta.url. Compare real paths, or the script
// exits 0 having run nothing.
function invokedDirectly(moduleUrl) {
  const entry = process.argv[1];
  if (!entry) return false;
  try {
    return realpathSync(entry) === realpathSync(fileURLToPath(moduleUrl));
  } catch {
    return false;
  }
}

if (invokedDirectly(import.meta.url)) process.exit(main(process.argv.slice(2)));
