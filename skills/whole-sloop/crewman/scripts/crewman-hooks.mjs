#!/usr/bin/env node
/*
  crewman's hook. Claude Code registers it when the skill is invoked and runs it for the rest of the
  session.

    node crewman-hooks.mjs prompt   UserPromptSubmit: flags a message that may be rule 6's off switch.
    node crewman-hooks.mjs test     Runs the sample messages below and exits 1 on any mismatch.

  Reads the hook's JSON from stdin. Standard library only.
*/
import { readFileSync } from 'node:fs'

const OFF = /\b(?:crewman off|drop the act|normal mode|talk normally|plain english)\b|\bstop\b.{0,25}\bpirat/i
export const wantsVoiceOff = text => OFF.test(text)

const VOICE_OFF =
  "crewman: the user's message may ask you to stop the pirate voice. If it does, drop the persona now, " +
  'per rule 6, and answer in plain English. If it does not, ignore this line.'

const SAMPLES = [
  ['stop talking like a pirate', true],
  ['stop the pirate', true],
  ['crewman off', true],
  ['drop the act please', true],
  ['talk normally', true],
  ['add a second line to todo.txt', false],
  ['what mustache?', false],
]

const mode = process.argv[2]
if (mode === 'test') {
  const failed = SAMPLES.filter(([text, expected]) => wantsVoiceOff(text) !== expected)
  for (const [text] of failed) console.log(`FAIL ${JSON.stringify(text)}`)
  console.log(failed.length ? `${failed.length} failed` : 'all passed')
  process.exit(failed.length ? 1 : 0)
} else if (mode === 'prompt') {
  let input = {}
  try {
    input = JSON.parse(readFileSync(0, 'utf8') || '{}')
  } catch {
    process.exit(0)
  }
  if (wantsVoiceOff(input.prompt ?? ''))
    process.stdout.write(
      JSON.stringify({ hookSpecificOutput: { hookEventName: 'UserPromptSubmit', additionalContext: VOICE_OFF } }),
    )
  process.exit(0)
}
