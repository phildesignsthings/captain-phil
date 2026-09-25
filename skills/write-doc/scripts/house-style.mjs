#!/usr/bin/env node
// The mechanical half of the house style, as an importable module.
//
// This file is the only copy of the rules. This repo's guard runs it over
// every markdown file in the repo. A consuming repo's guard imports the
// installed copy, so it keeps no second set of regexes to drift from this one.
//
// The caller supplies the file list and the two predicates that decide scope,
// because scope is the only thing that differs per repo. One predicate picks
// the files that opt into the prose rules, and the other picks the files
// allowed dated language. What counts as prose, the rules, and the wording of
// each finding all live here.
//
// Usage: node house-style.mjs <file>...
import { readFileSync, realpathSync } from "node:fs";
import { basename } from "node:path";
import { fileURLToPath } from "node:url";

// The regex half of the "no anchoring words" rule. The written standard also
// bans `new`, `existing` and `old`, and this list leaves those three out on
// purpose, because no regex separates the dating sense from the ordinary one.
// "The new registry" goes stale, while "leave it under the new name" in a
// rename procedure does not. A check that fired on all three would be wrong
// most of the time, and people learn to skip a check like that. The reader
// applies those three by hand.
export const ANCHORING_WORDS = [
  /\bcurrently\b/gi,
  /\bnow\b/gi,
  /\bat present\b/gi,
  /\brecently\b/gi,
  /\beventually\b/gi,
  /\bsoon\b/gi,
  /\bthe latest\b/gi,
];

// The all-caps check fires on a run of three or more capitalised words. It
// removes these acronyms first, because an acronym is not shouting. maskProse
// has already blanked code spans, which covers token names.
export const HOUSE_STYLE_ACRONYMS =
  /\b(?:FSD|CDP|MCP|CSS|HTML|JSX|API|CLI|DOM|PR|PRD|UI|UX|URL|CSV|JSON|YAML|SVG|AST|CMD|QA|CI|MVP|KPI|SSR|TSX|RHF|GIF|PNG)\b/g;

// The standard narrows Google's flat ban on all caps, allowing it on a
// prohibition or on a trap that already cost time. A line carrying one of
// these words counts as a prohibition.
export const PROHIBITION_MARKER =
  /\b(?:never|nothing|cannot|can't|don't|do not|must not|may not|no)\b/i;

// Both are canonical headings in a schema another tool reads, and renaming
// either one breaks the file for that tool. `Elevation & Depth` belongs to a
// design record and `Accessibility & Inclusion` to a product record. The
// exemption lives here rather than in a caller, so a repo that brings those
// records under this check gets no finding it is forbidden to fix.
export const HEADING_AMPERSAND_EXEMPT = new Set([
  "Elevation & Depth",
  "Accessibility & Inclusion",
]);

// Link text that names nothing. The rule is Google's "meaningful link text".
export const EMPTY_LINK_TEXT =
  /^(?:click here|here|this|this link|link|read more|more|see this)$/i;

/*
  Blanks out everything that is not prose. It keeps every line break and
  column, so a finding's line number is the line the author sees.

  What gets masked, and why each would otherwise fire:
    · Frontmatter. The rules exempt it, and a skill's `description` can say
      "new prototype" there.
    · Fenced blocks and inline code spans. A token name, a shell flag and a
      slot name are not prose. This corpus writes every banned-word list in
      backticks for this reason, so the standard does not fail itself.
    · Link targets and autolinks. A URL carrying `latest` or a path carrying
      `new-surface` is a path, not a claim about time.
*/
export function maskProse(text) {
  const blank = (m) => m.replace(/[^\n]/g, " ");
  let out = text;
  if (out.startsWith("---\n")) {
    const end = out.indexOf("\n---\n", 3);
    if (end !== -1) out = blank(out.slice(0, end + 5)) + out.slice(end + 5);
  }
  return out
    .replace(/```[\s\S]*?```/g, blank)
    .replace(/`[^`\n]*`/g, blank)
    .replace(
      /(\]\()[^)\n]*(\))/g,
      (m, open, close) => open + blank(m.slice(2, -1)) + close,
    )
    .replace(/<https?:\/\/[^>\n]*>/g, blank);
}

// A markdown file other than a SKILL.md opts into the prose rules with
// `house_style: true` in its frontmatter. A file can then land, show as
// pending in the count, and reach the style in a later commit.
export function optedIntoHouseStyle(text) {
  if (!text.startsWith("---\n")) return false;
  const end = text.indexOf("\n---\n", 3);
  if (end === -1) return false;
  return /^house_style:\s*true\s*$/m.test(text.slice(4, end + 1));
}

/*
  Run the mechanical rules over a list of markdown files.

  files                 absolute paths
  opts.standard         what a finding cites as the written rule
  opts.rel              path → the label a finding prints
  opts.prose            (file, text) → whether the prose rules bind this file
  opts.datedLanguageOk  (rel) → whether anchoring words are legal in this file

  Returns { findings, prose, pending, longSentences, total }. `longSentences` is
  a count with no finding attached. The 26-word rule is a reading guide, and a
  finding per long sentence would bury the rules that bind.
*/
export function checkHouseStyle(files, opts = {}) {
  const {
    standard = "the house style",
    rel: relOf = (f) => f,
    prose: isProse = (file, text) =>
      basename(file) === "SKILL.md" || optedIntoHouseStyle(text),
    datedLanguageOk = () => false,
  } = opts;

  const findings = [];
  let prose = 0;
  let pending = 0;
  let longSentences = 0;

  for (const file of files) {
    const rel = relOf(file);
    const text = readFileSync(file, "utf8");
    const checkProse = isProse(file, text);
    const dated = datedLanguageOk(rel);
    if (checkProse) prose++;
    else pending++;

    const masked = maskProse(text).split("\n");
    const raw = text.split("\n");
    let level = 0;

    raw.forEach((line, i) => {
      const at = `${rel}:${i + 1}`;
      const maskedLine = masked[i];

      // ── Headings ──
      const heading = /^(#{1,6})(.*)$/.exec(maskedLine);
      if (heading) {
        const depth = heading[1].length;
        const label = raw[i].slice(depth).trim();
        if (!label) {
          findings.push(
            `${at}: empty \`${heading[1]}\` heading.\n\n` +
              `House style (${standard}): a heading names the section under it. Give it a label, or ` +
              `delete the line.`,
          );
        }
        if (level && depth > level + 1) {
          findings.push(
            `${at}: heading jumps from h${level} to h${depth} — "${label}".\n\n` +
              `House style (${standard}): don't skip heading levels. A skipped level breaks the ` +
              `outline every reader and every table of contents reads the file by. Make this an ` +
              `h${level + 1}, or add the h${level + 1} it belongs under.`,
          );
        }
        if (/\s&\s/.test(label) && !HEADING_AMPERSAND_EXEMPT.has(label)) {
          findings.push(
            `${at}: \`&\` stands in for "and" in a heading — "${label}".\n\n` +
              `House style (${standard}): write "and" in a heading. The one exemption is ` +
              `\`## Elevation & Depth\`, which is canonical in a design record. Renaming a heading ` +
              `changes its anchor, so fix any index line that links to it in the same commit.`,
          );
        }
        level = depth;
      }

      // ── Link text ──
      for (const [, label] of raw[i].matchAll(/\[([^\]\n]+)\]\(/g)) {
        if (!EMPTY_LINK_TEXT.test(label.trim())) continue;
        findings.push(
          `${at}: link text "${label}" names nothing.\n\n` +
            `House style (${standard}): meaningful link text, never "click here". A reader scanning ` +
            `the page sees the link text alone, so it has to say what is on the other end. Name the ` +
            `destination.`,
        );
      }

      if (!checkProse) return;

      // ── Anchoring words ──
      // The written standard exempts a retirement record, an append-only note
      // and a design record, because each one has to say when something
      // happened. The caller's datedLanguageOk decides which files those are.
      for (const pattern of dated ? [] : ANCHORING_WORDS) {
        for (const [hit] of maskedLine.matchAll(pattern)) {
          findings.push(
            `${at}: anchoring word "${hit.trim()}".\n\n` +
              `House style (${standard}): a doc is timeless. "${hit.trim()}" dates the sentence ` +
              `against a moment the reader was not there for, and it goes stale without anybody ` +
              `editing the file. State the rule as it stands. Where the sentence is genuinely about a ` +
              `change, it belongs in a retirement record or an append-only note, both of which are ` +
              `exempt.`,
          );
        }
      }

      // ── should ──
      for (const [hit] of maskedLine.matchAll(/\bshould(?:n't| not)?\b/gi)) {
        findings.push(
          `${at}: "${hit}" — pick a modality.\n\n` +
            `House style (${standard}): say \`must\` where the rule binds, \`can\` where it is one ` +
            `option of several, \`might\` where it is a possibility, and \`We recommend\` where it is ` +
            `advice. "${hit}" reads as all four, so the reader cannot tell whether skipping it breaks ` +
            `something.`,
        );
      }

      // ── All caps ──
      const shoutable = maskedLine.replace(HOUSE_STYLE_ACRONYMS, "");
      for (const [hit] of shoutable.matchAll(
        /\b[A-Z][A-Z0-9'’-]*(?:\s+[A-Z][A-Z0-9'’-]*){2,}\b/g,
      )) {
        if (PROHIBITION_MARKER.test(hit) || PROHIBITION_MARKER.test(maskedLine))
          continue;
        findings.push(
          `${at}: all caps across ${hit.trim().split(/\s+/).length} words — "${hit.trim()}".\n\n` +
            `House style (${standard}): all caps marks a prohibition or a trap that already cost ` +
            `time, and nothing else — bold carries every other emphasis. Each run that means only ` +
            `"this matters" costs the ones that mean "this will bite you" their whole effect. Use ` +
            `bold, or state the prohibition.`,
        );
      }

      // Counts on the masked line, so a sentence full of code spans does not
      // read as a 40-word sentence.
      if (!/^\s*[#|>]/.test(maskedLine)) {
        for (const sentence of maskedLine.split(/(?<=[.!?])\s+/)) {
          if (sentence.trim().split(/\s+/).filter(Boolean).length > 26)
            longSentences++;
        }
      }
    });
  }
  return { findings, prose, pending, longSentences, total: files.length };
}

/*
  Whether node was told to run this file.

  Compares REAL paths. A skill installs as `.agents/skills/<name>/` with
  `.claude/skills/<name>` symlinked at it. The entry path a user types goes
  through the symlink, while `import.meta.url` is already resolved. Compared
  unresolved, the two never match when a user runs the script by the path the
  skill's own instructions name, and the run exits 0 having done nothing. A
  check that silently passes is worse than none.
*/
function invokedDirectly(moduleUrl) {
  const entry = process.argv[1];
  if (!entry) return false;
  try {
    return realpathSync(entry) === realpathSync(fileURLToPath(moduleUrl));
  } catch {
    return false;
  }
}

if (invokedDirectly(import.meta.url)) {
  const files = process.argv.slice(2);
  if (!files.length) {
    console.log("Usage: node house-style.mjs <file>...");
    process.exit(2);
  }
  const r = checkHouseStyle(files);
  if (r.findings.length) {
    console.error(r.findings.join("\n\n"));
    process.exit(2);
  }
  console.log(
    `house style: ok — read ${r.total} file(s), ${r.prose} of them for prose, ` +
      `${r.pending} yet to opt in with \`house_style: true\`, ` +
      `${r.longSentences} sentence(s) over 26 words (advisory).`,
  );
  process.exit(0);
}
