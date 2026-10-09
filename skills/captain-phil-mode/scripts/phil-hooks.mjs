#!/usr/bin/env node
/*
  captain-phil-mode's hooks. Claude Code registers them when the skill is invoked and
  runs them for the rest of the session.

    node phil-hooks.mjs prompt   UserPromptSubmit: reminds the agent of the
                                 "Before asking Phil anything" list, and flags
                                 a message that reads as a correction or
                                 mentions the mustache or the pirate talk.
    node phil-hooks.mjs stop     Stop: sends back a reply that asks the user
                                 something and breaks the asking rules.
    node phil-hooks.mjs test     Runs the sample messages below and exits 1 on
                                 any mismatch.

  Reads the hook's JSON from stdin. Standard library only.
*/
import { readFileSync } from 'node:fs'

// A user message that matches one of these may be correcting the direction.
const CORRECTION = [
  /\bnot what i\b/i,
  /\bthat'?s not\b/i,
  /\bwhy (did|are|would) you\b/i,
  /\bi (said|meant|asked)\b/i,
  /^\s*no[,.!\s]/i,
  /\bwrong\b/i,
  /\bstep back\b/i,
  /\bgrill/i,
  /\bmisunderst/i,
  /\btells? me (nothing|fucking nothing)\b/i,
  /\bfuck|\bshit\b|\bffs\b|\bwtf\b/i,
]

// An agent reply that matches one of these asks the user for something.
const ASK = [
  /\?\s*$/m,
  /\byour call\b/i,
  /\bneeds? your (attention|eyes|input|sign-?off)\b/i,
  /\b(want|would you like) me to\b/i,
  /\bshould i\b/i,
  /\bwhich (one|option|do you)\b/i,
  /\bover to you\b/i,
]

const CAVEAT_OPENERS =
  /^(one thing worth flagging|worth flagging|worth noting|one caveat|caveat|note:|one risk|a risk)/i

function lastParagraph(text) {
  const parts = text.trim().split(/\n\s*\n/)
  return parts[parts.length - 1] ?? ''
}

export function problemsWithAsk(text) {
  const problems = []
  if (text.includes('—')) problems.push('It uses an em dash. Run `unslop` on the message: periods and commas only.')
  const questions = (text.match(/\?(\s|$)/g) ?? []).length
  const numbered = /^\s*(\d+[.)]|\*\*\d+)/m.test(text)
  if (questions >= 2 && !numbered)
    problems.push(
      `It asks ${questions} questions with no numbered list. Run \`decision-request\` so each ` +
        'decision is a numbered block the user can answer by number.',
    )
  const code = text.match(/\b[A-Z][A-Z0-9]{1,9}-\d{1,5}\b/)
  if (code) problems.push(`It names ${code[0]}. Lead with the issue's or the screen's title, never a code alone.`)
  if (CAVEAT_OPENERS.test(lastParagraph(text).replace(/^[*_>\s-]+/, '')))
    problems.push('It ends on a caveat. Cut it unless acting on it changes what the user does next.')
  return problems
}

export const isAsk = text => ASK.some(re => re.test(text))
export const isCorrection = text => CORRECTION.some(re => re.test(text))

const REMINDER =
  'captain-phil-mode: before you ask the user anything, run captain-phil-mode\'s "Before asking Phil ' +
  'anything" list. Skipping a step is a failure even when the work is right.'

const DRIFT =
  "captain-phil-mode: the user's message may be correcting the direction. Before any tool call, " +
  'run step 1 of `grill-me`: say back what you think the user wants and offer the interview.'

const MUSTACHE =
  "captain-phil-mode: the user's message mentions the mustache or the pirate talk, so they are " +
  'not the real Phil. Unless you already speak as Rodger, or the user turned `crewman` off this ' +
  'session, invoke `crewman` before any other tool call.'

const CREWMAN_OFF = /crewman off|drop the act|stop the pirate|normal mode/i

// The mustache, or the pirate voice the session opened with.
const UNMASK = [
  /\b(mu|mou)stach/i,
  /\bstache\b/i,
  /\bpirat/i,
  /\b(arr+|ahoy|matey|'?sblood|avast)\b/i,
  /\b(talk|talking|speak|speaking|spoke|sound|sounding|sounded)\s+like\s+a\b/i,
  /\bwhy (are|did|do) you (talk|speak|sound)/i,
  /\b(accent|old-timey|olde)\b/i,
]

export const mentionsMustache = text => !CREWMAN_OFF.test(text) && UNMASK.some(re => re.test(text))

function onPrompt(input) {
  const lines = [REMINDER]
  if (isCorrection(input.prompt ?? '')) lines.push(DRIFT)
  if (mentionsMustache(input.prompt ?? '')) lines.push(MUSTACHE)
  return {
    hookSpecificOutput: {
      hookEventName: 'UserPromptSubmit',
      additionalContext: lines.join('\n'),
    },
  }
}

function onStop(input) {
  // A reply this hook already sent back once goes through, so a false positive
  // costs one rewrite and never a loop.
  if (input.stop_hook_active) return null
  const text = input.last_assistant_message ?? ''
  if (!isAsk(text)) return null
  const problems = problemsWithAsk(text)
  if (!problems.length) return null
  return {
    decision: 'block',
    reason:
      'captain-phil-mode: this reply asks the user something and breaks the asking rules. ' +
      'Rewrite it and send it again.\n- ' +
      problems.join('\n- '),
  }
}

const SAMPLES = [
  // [kind, text, expected]
  ['correction', "no, that's not what I meant, the point is the sample", true],
  ['correction', 'Do we need to do a grill-me session about this?', true],
  ['correction', 'this table told me fucking nothing', true],
  ['correction', 'I said page names, not codes', true],
  ['correction', "That'll work.", false],
  ['correction', 'Looks good, ship it', false],
  ['correction', 'Now make the header sticky', false],
  ['mustache', 'thanks, the mustache is new', true],
  ['mustache', 'what moustache?', true],
  ['mustache', 'Must we ship today?', false],
  ['mustache', 'lol why did you talk like a pirate', true],
  ['mustache', "what's with the 'sblood?", true],
  ['mustache', 'why do you sound like that', true],
  ['mustache', 'stop the pirate', false],
  ['mustache', 'drop the act, the pirate stuff is funny but not now', false],
  ['mustache', 'Talk me through the plan', false],
  ['ask', 'Want me to open the PR?', true],
  ['ask', 'Done. Lint and typecheck pass.', false],
  ['ask', 'The Home tab is your call.', true],
  ['clean', 'Should I merge it, or will you?', 0],
  ['clean', 'Two calls:\n\n1. Keep the toast?\n2. Move Save up?', 0],
  ['clean', 'Merged. The PR is closed.', 0],
  ['dirty', 'Keep the toast? Move Save up?', 1],
  ['dirty', 'Want me to fix PROJ-412 next?', 1],
  ['dirty', 'Want me to ship it — or wait?', 1],
  ['dirty', 'Want me to ship it?\n\nOne thing worth flagging: lint is slow.', 1],
]

function selfTest() {
  let failed = 0
  for (const [kind, text, expected] of SAMPLES) {
    let got
    if (kind === 'correction') got = isCorrection(text)
    else if (kind === 'mustache') got = mentionsMustache(text)
    else if (kind === 'ask') got = isAsk(text)
    else got = problemsWithAsk(text).length
    const ok = got === expected
    if (!ok) failed++
    console.log(`${ok ? 'ok  ' : 'FAIL'} ${kind.padEnd(10)} ${JSON.stringify(got)}  ${JSON.stringify(text)}`)
  }
  console.log(failed ? `${failed} failed` : 'all passed')
  process.exit(failed ? 1 : 0)
}

const mode = process.argv[2]
if (mode === 'test') selfTest()
else if (mode === 'prompt' || mode === 'stop') {
  let input = {}
  try {
    input = JSON.parse(readFileSync(0, 'utf8') || '{}')
  } catch {
    process.exit(0)
  }
  const out = mode === 'prompt' ? onPrompt(input) : onStop(input)
  if (out) process.stdout.write(JSON.stringify(out))
  process.exit(0)
}
