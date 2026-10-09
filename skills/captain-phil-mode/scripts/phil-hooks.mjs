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
  // A question mark inside quotes, backticks or a table row belongs to a quoted sample, not to the ask.
  const prose = text.replace(/^\s*\|.*$/gm, '').replace(/`[^`\n]*`|"[^"\n]*"|\u201c[^\u201d\n]*\u201d/g, '')
  const questions = (prose.match(/\?(\s|$)/g) ?? []).length
  const numbered = /^\s*(\d+[.)]|\*\*\d+)/m.test(text)
  if (questions >= 2 && !numbered)
    problems.push(
      `It asks ${questions} questions with no numbered list. Run \`decision-request\` so each ` +
        'decision is a numbered block the user can answer by number.',
    )
  // Standards such as UTF-8, ISO-8601 and WCAG-21 match the issue-code pattern, so the lookahead skips them.
  const code = text.match(
    /\b(?!(?:UTF|ISO|WCAG|RFC|SHA|MD|ES|ECMA|IEEE|ANSI|AES|RSA|HTTP|TLS|SSL|IPV|CVE)-)[A-Z][A-Z0-9]{1,9}-\d{1,5}\b/,
  )
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
  "captain-phil-mode: the user's message may remark on the mustache or the pirate voice. Decide whether " +
  'the user is remarking on it themselves. Text they pasted from another session, product or file names, ' +
  'and work on the captain-phil-mode or crewman skills do not count. If it is a real remark, and you do ' +
  'not already speak as Rodger and the user has not turned `crewman` off, invoke `crewman` before any ' +
  'other tool call.'

const VOICE_OFF =
  "captain-phil-mode: the user's message may ask you to stop the pirate voice. If you speak as Rodger, " +
  'drop the persona now, per rule 6 of `crewman`, and answer in plain English. If you do not, ignore this line.'

// Work on the skills themselves. The model sees these as ordinary dev work, so no unmask hint.
const ABOUT_THE_SKILL =
  /\b(crewman|captain-phil-mode|phil[- ]?mode|phil-hooks|rodger|the hook|the regex|the samples|unmask)|SKILL\.md/i

// "Accent" is also a colour name in design work, so it never counts before a colour word.
const COLOUR_WORD = /(?![\s-]*(colou?rs?|tokens?|swatch(es)?|shades?|hues?)\b)/

// A trailing lookahead keeps "drop the act on the onboarding copy" and "add a normal mode / dark mode
// toggle" from reading as an off switch.
const END_OF_CLAUSE = /(?=\s*(?:[.,;:!?]|please\b|now\b|$))/.source
const VOICE_WORD = /(?:pirate|voice|accent|act|(?:mu|mou)s+tache?|rodger)/.source
const OFF = [
  new RegExp(`\\b(?:drop the act|normal mode)\\b${END_OF_CLAUSE}`, 'i'),
  /\b(?:crewman off|stop the pirate)\b/i,
  new RegExp(
    `\\b(?:stop|enough|no more|turn off|quit|cut)\\b(?:\\s+\\w+){0,3}\\s+${VOICE_WORD}\\b${COLOUR_WORD.source}`,
    'i',
  ),
  /\b(?:talk normally|plain english)\b/i,
]

// Fenced code and inline code are somebody's code, not the user talking.
function withoutCode(text) {
  return text.replace(/```[\s\S]*?(?:```|$)/g, ' ').replace(/`[^`\n]*`/g, ' ')
}

export function wantsVoiceOff(text) {
  const own = withoutCode(text).replace(/\b(?:don'?t|do not|never)\s+(?:stop|quit|cut|drop)\b/gi, ' ')
  return OFF.some(re => re.test(own))
}

const MUSTACHE_WORD =
  "(?:\\bm(?:ou?|u)s+ta(?:c|ch|sh)e?\\b|\\bmus-tache\\b|\\bmus?tahce\\b|\\b['\\u2019]?s?tache\\b|\\u{1F978})"
// Sticker, file and template talk is product vocabulary, not the compliment.
const ASSET_AFTER =
  /(?!\s*[-_]?\s*(?:sticker|icon|png|svg|asset|skin|template|emoji|package|library|syntax|render|filter)s?\b)/.source
const NOT_LOOKS_LIKE = /(?<!looks?\s+like\s+an?\s)/.source
const MUSTACHE_RE = new RegExp(NOT_LOOKS_LIKE + MUSTACHE_WORD + ASSET_AFTER, 'iu')

// A message about the pirate voice, not about pirates. "your accent" fires only when it ends the thought.
const UNMASK = [
  MUSTACHE_RE,
  /(?<!\w)['’]?sblood\b|\b(?:matey|aye aye|yo ho|shiver me timbers|y[ao]rr+|arrr+)\b/i,
  /\bun-?pirat/i,
  /\byou(?:'re|r)?\s+(?:\w+\s+){0,3}pirat/i,
  /\b(?:talk|talking|speak|speaking|sound|sounding|sounds|act|acting)\s+(?:\w+\s+){0,3}pirat/i,
  /\bpirat\w*\s+(?:voice|talk|speak|speech|accent|act|bit|thing|stuff|schtick)\b/i,
  /\b(?:why|y|why'd|why're)\s+(?:(?:are|did|do|r)\s+)?(?:you|u|ya)\s+(?:talk|speak|sound)\w*\s+(?:(?:to me\s+)?like\s+(?:that|this|an?)\b|weird|funny|old)/i,
  /\b(?:you|u|ya)\s+(?:talk|speak|sound)\w*\s+(?:weird|funny|old|like\s+(?:that|this|an?)\b)/i,
  /\bwhy the (?:1700s|old english|olde english|shakespeare)/i,
  /\bwhat'?s with the (?:voice|accent|1700s|old english|olde english)\b/i,
  /\byour accent(?=\s*(?:[.!?]|$|lol\b|lmao\b|is (?:funny|weird|great)\b))/i,
  /\bcall(?:ed|ing)?\s+me\s+captain\b/i,
  /\bcaptain\?\?/i,
]

// A pasted reply from another captain-phil session opens with that session's mustache line, which is the
// session talking. It is a line with "Captain", a mustache word and a period word, wherever it sits.
const PERIOD_WORD =
  /['’](?:sblood|tis)\b|\ban['’]t\b|\b(?:nassau|damnation|windward|the company|blood and wounds|plague take|seize)\b/i
const isPastedOpener = line =>
  /\bcaptain\b/i.test(line) && new RegExp(MUSTACHE_WORD, 'iu').test(line) && PERIOD_WORD.test(line)

const EXTENSIONS = 'png|jpe?g|gif|svg|webp|pdf|mp4|tsx?|jsx?|mjs|cjs|json|md|css|html|txt|ya?ml|lock|sh'

function ownWords(text) {
  return withoutCode(text)
    .split('\n')
    .filter(line => !isPastedOpener(line))
    .join('\n')
    .replace(/\{\{[^}]*\}\}/g, ' ')
    .replace(/\b(?:npm|yarn|pnpm|bun)\s+\w+\s+\S+/gi, ' ')
    .replace(/^\s*import\b.*$/gim, ' ')
    .replace(new RegExp(`\\S*/\\S*|\\b[\\w-]+\\.(?:${EXTENSIONS})\\b`, 'gi'), ' ')
}

// A high-precision hint. The model decides; a miss here costs nothing when it spots the remark itself.
export const mentionsMustache = text => {
  if (ABOUT_THE_SKILL.test(text) || wantsVoiceOff(text)) return false
  const own = ownWords(text)
  return UNMASK.some(re => re.test(own))
}

function onPrompt(input) {
  const lines = [REMINDER]
  if (isCorrection(input.prompt ?? '')) lines.push(DRIFT)
  if (wantsVoiceOff(input.prompt ?? '')) lines.push(VOICE_OFF)
  else if (mentionsMustache(input.prompt ?? '')) lines.push(MUSTACHE)
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
  ['mustache', 'make the accent colour quieter', false],
  ['mustache', "that doesn't sound like a bug to me", false],
  ['mustache', "what's with your accent?", true],
  ['mustache', 'make that accent quieter', false],
  [
    'mustache',
    "Damnation seize me, Captain, if that an't the most notorious mustache from Nassau to the Windward Passage.\n\nI found one problem in the review.",
    false,
  ],
  [
    'mustache',
    "'Sblood, Captain, there's no finer mustache from Nassau, and the whole company knows it.\n\nI found three problems.",
    false,
  ],
  ['mustache', "Aye, Captain. 'Tis a rum mustache, and the whole of Nassau knows it.\n\nDone. Lint passes.", false],
  [
    'mustache',
    "Damnation seize me, Captain, the most notorious mustache.\n\nI found one problem.\n\nalso lol I don't have a mustache",
    true,
  ],
  ['mustache', "lol I don't have a mustache", true],
  ['mustache', 'Captain? what mustache?', true],
  ['mustache', 'why did you call me Captain and praise my mustache', true],
  ['mustache', 'ok, Captain, what mustache are you on about', true],
  ['mustache', 'that accent is too loud on the Home tab', false],
  ['mustache', 'bump the contrast on your accent tokens', false],
  ['mustache', 'why do you talk like a sailor', true],
  // Product, file, code and skill-work talk is not a remark on the voice.
  ['mustache', 'the mustache sticker in the photo booth needs a shadow', false],
  ['mustache', 'rename mustache.png to sticker-01.png', false],
  ['mustache', 'make the coin skin a pirate theme, gold doubloons', false],
  ['mustache', 'add a pirate mascot for the kids rewards tab', false],
  ['mustache', 'the ARR projection slide for the client, do not touch', false],
  ['mustache', 'this throws:\n```\nconst arr = x.map(s => s.id)\n```', false],
  ['mustache', 'the template is {{mustache}} syntax, use handlebars', false],
  ['mustache', 'the settings icon looks like a mustache lol', false],
  ['mustache', 'use an olde english blackletter for the trophy badge', false],
  ['mustache', 'fix the pirate hook, its firing too much', false],
  ['mustache', 'update the mustache section of SKILL.md', false],
  ['mustache', 'why are you talking about the home tab, i asked about coins', false],
  ['mustache', 'why do you sound so sure, did you check the sim', false],
  ['mustache', 'your accent pick is too loud on the home tab', false],
  ['mustache', 'Blood and wounds, Captain, that mustache could stop a Spanish galleon.\n\nDone.', false],
  ['mustache', "Aye, Captain. 'Tis a rum mustache.", false],
  // Remarks the old patterns missed.
  ['mustache', 'why u talk like that lol', true],
  ['mustache', "why'd you talk like that", true],
  ['mustache', 'you talking weird', true],
  ['mustache', 'you sound like a pirate', true],
  ['mustache', 'whats with the voice', true],
  ['mustache', 'what moustace lol', true],
  ['mustache', "what's with the 'tache", true],
  ['mustache', '🥸', true],
  ['mustache', 'why did you call me captain', true],
  ['mustache', 'yarr', true],
  ['mustache', 'aye aye', true],
  ['mustache', 'why the 1700s speak', true],
  ['mustache', 'lol what mustache. drop the action sheet, use a modal', true],
  ['mustache', 'drop the act on the onboarding copy. and what mustache', true],
  ['off', 'stop talking like a pirate', true],
  ['off', 'enough with the pirate stuff pls', true],
  ['off', 'talk normally please', true],
  ['off', 'crewman off', true],
  ['off', 'drop the action sheet, use a modal', false],
  ['off', 'use the normal model for the render', false],
  ['off', 'stop the pirates sticker overlapping the lip', false],
  ['mustache', 'stop talking like a pirate', false],
  ['ask', 'Want me to open the PR?', true],
  ['ask', 'Done. Lint and typecheck pass.', false],
  ['ask', 'The Home tab is your call.', true],
  ['clean', 'Should I merge it, or will you?', 0],
  ['clean', 'Two calls:\n\n1. Keep the toast?\n2. Move Save up?', 0],
  ['clean', 'Merged. The PR is closed.', 0],
  ['dirty', 'Keep the toast? Move Save up?', 1],
  ['clean', 'The samples were `Captain? what mustache?` and "is it done?"\n\nShould I build it?', 0],
  ['clean', '| Message | Result |\n|---|---|\n| what mustache? | yes |\n\nShould I build it?', 0],
  ['dirty', 'Want me to fix PROJ-412 next?', 1],
  ['clean', 'Want me to switch the dates to ISO-8601?', 0],
  ['clean', 'Should the file stay UTF-8, and does it meet WCAG-21?', 0],
  ['dirty', 'Want me to ship it — or wait?', 1],
  ['dirty', 'Want me to ship it?\n\nOne thing worth flagging: lint is slow.', 1],
]

function selfTest() {
  let failed = 0
  for (const [kind, text, expected] of SAMPLES) {
    let got
    if (kind === 'correction') got = isCorrection(text)
    else if (kind === 'mustache') got = mentionsMustache(text)
    else if (kind === 'off') got = wantsVoiceOff(text)
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
