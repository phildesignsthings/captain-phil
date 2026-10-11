---
house_style: true
read_when:
  - "A spike runs headless Claude Code workers and needs a runner command"
  - "A spike has to count hook calls, tool calls or tokens from an agent run"
  - "An agent spike result looks wrong and the rig might be the cause"
---

# Spike cases that run agents

A spike about agent behaviour runs `claude -p` against a scratch repo and reads the event stream it prints. This file holds the runner command, the instruments that worked, and the ways the operator's own setup changes a result.

## The runner command

Run each worker through `scripts/run-case.mjs`, so the stream lands in the case folder:

```bash
node <skill dir>/scripts/run-case.mjs .context/spikes/<spike> q1-session-id --cwd <scratch repo> -- \
  claude -p "<prompt>" --session-id <uuid> --output-format stream-json --verbose \
  --model <model id> --effort low --permission-prompts none --max-budget-usd 0.50 --strict-mcp-config
```

- **`--session-id`** takes a lowercase UUID you generate, so a case can check which session did what. `uuidgen | tr A-Z a-z` makes one on macOS.
- **`--output-format stream-json --verbose`** writes one JSON event per line to `stdout.txt`. The stream is the main evidence file.
- **`--permission-prompts none`** makes a call that would prompt fail rather than hang.
- **`--max-budget-usd`** stops a looping case. It does not hold spend to the cap, because the cap is checked after each turn and a run can stop well past it.
- **`--strict-mcp-config`** skips the operator's MCP servers. Drop it only where the question is about them.

## Instruments

- **The event stream.** The `init` event names the model and the loaded tools. Each `assistant` event carries token usage. The `result` event carries cost, turns and permission denials. Count from these fields rather than from the worker's own summary.
- **A hook logger.** Add a `PostToolUse` hook to the scratch repo's `.claude/settings.json` that appends each payload to a log in the case folder. `run-case.mjs` sets `SPIKE_CASE_DIR` to that folder, so the log lands beside the stream and the reset never touches it. The log gives one line per tool call with the session id on it:

  ```json
  {
    "hooks": {
      "PostToolUse": [
        { "hooks": [{ "type": "command",
          "command": "{ cat; echo; } >> \"$SPIKE_CASE_DIR/hook-payloads.jsonl\"" }] }
      ]
    }
  }
  ```
- **A sampler.** Where a question is about a file changing while the worker runs, start a loop that lists the folder once a second into the case folder, and stop it when the case ends.

## Where the operator's setup leaks into the rig

A scratch repo does not isolate a worker from the machine it runs on. Each of these changes a result without showing up in the scratch repo's files.

- **User-level skills load before the scratch repo's.** A stub skill in the scratch repo's `.claude/skills/` loses to a skill of the same name under `~/.claude/skills/`. Read the `Skill` tool results in the stream to see which copy ran.
- **The permission mode comes from the operator's settings.** A worker inherits the default mode in `~/.claude/settings.json`. Record which mode each case ran under, and pass `--permission-mode` on every case that tests permissions.
- **User-level MCP servers load into every worker.** They add tool definitions to the first turn and change its token count. The runner command passes `--strict-mcp-config` to skip them.
- **Every `CLAUDE.md` in a parent folder loads too.** A scratch repo inside the project gives each worker the project's instructions. Put an agent spike's scratch repo in a temporary folder outside the project, as `SKILL.md` step 3 says.
