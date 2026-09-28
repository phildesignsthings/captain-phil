#!/usr/bin/env node
// Guards the suite's own invariants. Run it with `npm run guard`; CI runs the
// same command on every push, and a branch cannot merge to main without it.
//
// Each check reads one of three things:
//
//   the skill folders:   checkNoStraySkillMd, checkFrontmatter, checkSkillIndex,
//                        checkSkillReferences, checkHostSlots, checkNoHostPaths
//   the host schema:     checkHostSlots, checkTemplates
//   every markdown file: checkHouseStyle, which imports the only copy of the
//                        rules from skills/write-doc/scripts/house-style.mjs
//
// Nothing here reads a consuming repo. A rule about how an installed skill
// behaves belongs in that skill's own body, because this script never runs there.
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, relative, basename, dirname, resolve, sep } from "node:path";
import { checkHouseStyle } from "../skills/write-doc/scripts/house-style.mjs";

const root = resolve(dirname(new URL(import.meta.url).pathname), "..");
const SKILLS = join(root, "skills");
const SCHEMA_PATH = join(root, "host", "host.schema.json");
const TEMPLATES = join(root, "host", "templates");
const README = join(root, "README.md");
// A house-style finding cites this file as the written rule. A path gives the reader a file to
// open, where the name of a standard leaves them searching for it.
const STANDARD = "skills/write-doc/references/house-style.md";

/*
  Folders under skills/ allowed to have no SKILL.md, each mapped to its reason.

  The suite converts one cluster at a time, so a shared script can land before
  the skill that documents it. A folder missing its SKILL.md and absent from
  this map fails. An entry naming a folder that has a SKILL.md fails too, so
  each entry goes in the commit that lands its skill, and the map cannot
  quietly permit a skill with no instructions.
*/
const PENDING_SKILLS = new Map();

// A skill body outside references/ that matches one of these names one repo's
// layout, where a portable skill cites a host slot. references/ is exempt
// because a bundled reference can quote the corpus it came from.
const HOST_PATH_PATTERNS = [
  [/ideation-sandbox\//, "names one repo's app folder — read `surfaces.root`"],
  [/sandbox-guard/, "names one repo's guard script — read `checks.guard`"],
  [/scripts\/probes/, "hardcodes a probe folder — read `verify.probes`"],
  [/docs\/[a-z-]+\.md/, "cites a doc by path — read the matching `docs.*` slot"],
  [/(?<![\w.])memory\//, "names a project-notes folder — read `memory.root`"],
  [/\.agents\/context\//, "names a record folder — read the matching `records.*` slot"],
  [/(?<![\w-])meta\.ts/, "names one repo's per-surface config file — read `surfaces.doc`"],
  // This also matches the gerund, as in "staging a file". Catching a bare
  // branch name needs that, so reword the sentence rather than loosening the
  // pattern.
  [/(?<![\w-])staging(?![\w-])/, "names a branch — read `git.trunk`"],
  [/-vibes(?![\w-])/, "names one repo's branch convention — read `git.doc`"],
];

const findings = [];
const fail = (s) => findings.push(s);

// ── Reading the skills ───────────────────────────────────────────────────────

function markdownUnder(dir) {
  const out = [];
  const walk = (d) => {
    if (!existsSync(d)) return;
    for (const name of readdirSync(d)) {
      if (name === "node_modules" || name === ".git") continue;
      const p = join(d, name);
      if (statSync(p).isDirectory()) walk(p);
      else if (name.endsWith(".md")) out.push(p);
    }
  };
  walk(dir);
  return out;
}

function skillFolders() {
  if (!existsSync(SKILLS)) return [];
  return readdirSync(SKILLS)
    .filter((n) => statSync(join(SKILLS, n)).isDirectory())
    .sort();
}

/*
  A YAML parser for a skill's frontmatter and nothing more.

  It handles the four shapes this corpus uses: scalars, `>-` folded blocks,
  flow arrays, and a `metadata:` map one level deep. A YAML package would be
  the repo's first dependency, and four shapes are not worth one.
*/
function frontmatter(text) {
  if (!text.startsWith("---\n")) return null;
  const end = text.indexOf("\n---\n", 3);
  if (end === -1) return null;
  const lines = text.slice(4, end + 1).split("\n");
  const out = {};
  let key = null;
  let folded = false;
  let parent = null;
  for (const line of lines) {
    if (!line.trim()) continue;
    const nested = /^ {2}([\w-]+):\s*(.*)$/.exec(line);
    if (parent && nested) {
      out[parent][nested[1]] = parseScalar(nested[2]);
      continue;
    }
    if (folded && /^\s+\S/.test(line)) {
      out[key] = (out[key] ? out[key] + " " : "") + line.trim();
      continue;
    }
    const top = /^([\w-]+):\s*(.*)$/.exec(line);
    if (!top) continue;
    parent = null;
    folded = false;
    key = top[1];
    const value = top[2].trim();
    if (value === ">-" || value === ">" || value === "|" || value === "|-") {
      out[key] = "";
      out[`${key}__style`] = value;
      folded = true;
    } else if (value === "") {
      out[key] = {};
      parent = key;
    } else {
      out[key] = parseScalar(value);
    }
  }
  return out;
}

function parseScalar(value) {
  const v = value.trim();
  if (v.startsWith("[") && v.endsWith("]"))
    return v
      .slice(1, -1)
      .split(",")
      .map((s) => s.trim().replace(/^["']|["']$/g, ""))
      .filter(Boolean);
  if (v === "true") return true;
  if (v === "false") return false;
  return v.replace(/^["']|["']$/g, "");
}

// Drops frontmatter and fenced blocks, because a path inside a fence is an
// example rather than a citation.
function bodyProse(text) {
  let out = text;
  if (out.startsWith("---\n")) {
    const end = out.indexOf("\n---\n", 3);
    if (end !== -1) out = out.slice(end + 5);
  }
  return out.replace(/```[\s\S]*?```/g, "");
}

// ── 1. No stray SKILL.md ─────────────────────────────────────────────────────

/*
  The CLI installs any `<dir>/SKILL.md` it finds under skills/ as a skill of
  that directory's name. A SKILL.md at the repo root, or one used as a reference
  file inside a skill, installs a second skill nobody meant to publish.
*/
function checkNoStraySkillMd() {
  if (existsSync(join(root, "SKILL.md")))
    fail(
      `SKILL.md at the repo root. The CLI installs every \`<dir>/SKILL.md\` it finds as a skill of ` +
        `that directory's name, so a root one publishes the repo itself. Move it under ` +
        `skills/<name>/.`,
    );
  for (const folder of skillFolders()) {
    for (const file of markdownUnder(join(SKILLS, folder))) {
      const rel = relative(root, file);
      if (basename(file) !== "SKILL.md") continue;
      if (rel === join("skills", folder, "SKILL.md")) continue;
      fail(
        `${rel} is a second SKILL.md inside skills/${folder}/. The CLI would install it as its own ` +
          `skill named after its parent folder. Rename it — a bundled document goes in ` +
          `references/ under a name that says what it holds.`,
      );
    }
  }
}

// ── 2. Frontmatter ──────────────────────────────────────────────────────────

/*
  The harness picks a skill by matching its `description` and `when_to_use`, so
  a skill missing either one, or folding it badly, never triggers. The guard
  requires `>-` on both and on `compatibility`, because a bare multi-line
  scalar breaks the parse and a single-line one runs past every editor's
  margin.
*/
function checkFrontmatter() {
  for (const folder of skillFolders()) {
    const path = join(SKILLS, folder, "SKILL.md");
    const rel = relative(root, path);
    if (!existsSync(path)) continue;
    const text = readFileSync(path, "utf8");
    const fm = frontmatter(text);
    if (!fm) {
      fail(`${rel} has no \`---\` frontmatter block. Every skill declares one.`);
      continue;
    }
    if (fm.name !== folder)
      fail(
        `${rel} declares \`name: ${fm.name ?? "(none)"}\` inside skills/${folder}/. The folder name ` +
          `is what a user types after the slash and the frontmatter name is what the harness ` +
          `registers; a split between them reads as a skill that exists and cannot be invoked.`,
      );
    for (const field of ["description", "when_to_use"]) {
      if (!fm[field]) {
        fail(`${rel} declares no \`${field}:\`. The harness matches on both.`);
        continue;
      }
      if (fm[`${field}__style`] !== ">-")
        fail(
          `${rel} writes \`${field}:\` without \`>-\`. Fold it: a bare multi-line scalar breaks the ` +
            `parse, and a one-line one runs past every editor's margin unread.`,
        );
    }
    const slots = fm.metadata?.host ?? [];
    if (slots.length && !fm.compatibility)
      fail(
        `${rel} declares \`metadata.host: [${slots.join(", ")}]\` and no \`compatibility:\` line. ` +
          `A slot can be absent in a consuming repo, so every skill that reads one owes the reader ` +
          `a sentence naming the fallback. host/README.md § How a skill declares what it reads ` +
          `states the shape.`,
      );
    if (fm.compatibility && fm.compatibility__style !== ">-")
      fail(`${rel} writes \`compatibility:\` without \`>-\`. Fold it.`);
    if (fm.metadata?.suite !== "captain-phil")
      fail(
        `${rel} declares \`metadata.suite: ${fm.metadata?.suite ?? "(none)"}\`. Every skill in this ` +
          `repo carries \`captain-phil\`, which is how a consuming repo tells a suite skill from ` +
          `one of its own.`,
      );
    if (/\$1\b/.test(bodyProse(text)) && !fm["argument-hint"])
      fail(
        `${rel} reads \`$1\` in its body and declares no \`argument-hint:\`. Without the hint the ` +
          `user cannot tell the skill takes an argument, and the skill's own fallback branch runs ` +
          `every time.`,
      );
  }
}

// ── 3. The skills index ─────────────────────────────────────────────────────

/*
  The skill folders on disk are the truth and README.md's `## Skills` table is
  the claim, and the check fails a mismatch in either direction. A skill absent
  from the table is invisible to anybody deciding whether to install the suite.
*/
function checkSkillIndex() {
  if (!existsSync(README)) {
    fail(`No README.md at the repo root, so nothing indexes the skills.`);
    return;
  }
  const onDisk = new Set();
  for (const folder of skillFolders()) {
    const hasSkill = existsSync(join(SKILLS, folder, "SKILL.md"));
    const pending = PENDING_SKILLS.get(folder);
    if (hasSkill && pending)
      fail(
        `skills/${folder}/ has a SKILL.md and is still listed in PENDING_SKILLS in ` +
          `scripts/skills-guard.mjs — "${pending}". Delete that entry in the same commit. An ` +
          `exemption for a skill that exists is a skill the index never has to list.`,
      );
    else if (!hasSkill && !pending)
      fail(
        `skills/${folder}/ has no SKILL.md, so the CLI installs nothing from it. Write the ` +
          `SKILL.md, or add the folder to PENDING_SKILLS in scripts/skills-guard.mjs with the ` +
          `reason and the gate that clears it.`,
      );
    if (hasSkill) onDisk.add(folder);
  }

  const md = readFileSync(README, "utf8");
  const section = /\n## Skills\n([\s\S]*?)(?=\n## |$)/.exec(md);
  if (!section) {
    fail(
      `README.md has no \`## Skills\` section, so nothing lists the ${onDisk.size} skill(s) under ` +
        `skills/. Restore the heading, or point checkSkillIndex at the heading that replaced it in ` +
        `the same commit.`,
    );
    return;
  }
  const listed = new Map();
  for (const line of section[1].split("\n")) {
    const row = /^\|\s*`([^`]+)`\s*\|\s*(.*?)\s*\|\s*$/.exec(line);
    if (row) listed.set(row[1], row[2]);
  }
  const unlisted = [...onDisk].filter((n) => !listed.has(n));
  const phantom = [...listed.keys()].filter((n) => !onDisk.has(n));
  const triggerless = [...listed].filter(([, t]) => !t).map(([n]) => n);
  if (unlisted.length)
    fail(
      `Skills missing from README.md's \`## Skills\` table: ${unlisted.join(", ")}. Adding a skill ` +
        `is TWO steps — the SKILL.md, and one table row of the form "| \`name\` | the moment it ` +
        `runs |" carrying the frontmatter name verbatim. The row names the MOMENT, never the ` +
        `contents.`,
    );
  if (phantom.length)
    fail(
      `README.md's \`## Skills\` table lists skills that do not exist: ${phantom.join(", ")}. A row ` +
        `pointing at nothing sends a reader to install a skill the CLI will not find.`,
    );
  if (triggerless.length)
    fail(
      `README.md rows carrying no trigger: ${triggerless.join(", ")}. The second column is the ` +
        `moment the skill runs, and a blank one is a skill nobody knows when to invoke.`,
    );
}

// ── 4. References resolve inside the skill ──────────────────────────────────

/*
  A skill installs as one folder, so a citation that walks outside it resolves
  to nothing in every consuming repo. Nothing reports the failure, because the
  reader meets a dead path rather than an error.
*/
function checkSkillReferences() {
  for (const folder of skillFolders()) {
    const dir = join(SKILLS, folder);
    for (const file of markdownUnder(dir)) {
      const rel = relative(root, file);
      const text = bodyProse(readFileSync(file, "utf8"));
      const dead = new Set();
      for (const [, ref] of text.matchAll(
        /`((?:references|scripts|assets)\/[\w./-]*\.(?:md|mjs|json))`/g,
      )) {
        if (!existsSync(join(dir, ref))) dead.add(ref);
      }
      for (const [ref] of text.matchAll(/`\.\.\/[\w./-]+`/g)) dead.add(ref);
      if (dead.size)
        fail(
          `${rel} cites paths that do not resolve inside skills/${folder}/: ` +
            `${[...dead].join(", ")}. A skill installs as one folder, so a citation that walks ` +
            `outside it resolves to nothing in every consuming repo. Bundle the file under ` +
            `references/, or cite the host file by slot instead.`,
        );
    }
  }
}

// ── 5. Host slots ───────────────────────────────────────────────────────────

function schemaGroups() {
  const schema = JSON.parse(readFileSync(SCHEMA_PATH, "utf8"));
  const groups = new Map();
  for (const [group, def] of Object.entries(schema.properties)) {
    if (def.type === "string") continue; // `$schema` and `template` are strings, not slot groups
    groups.set(group, new Set(Object.keys(def.properties ?? {})));
  }
  return { schema, groups };
}

/*
  A slot a body reads must exist in the schema and appear in that skill's
  `metadata.host`. A slot the frontmatter declares must exist in the schema
  too. Without this check, a skill can read a slot whose fallback nobody wrote.
  It works in the repo it was written in and silently does nothing everywhere
  else.
*/
function checkHostSlots() {
  const { groups } = schemaGroups();
  const names = [...groups.keys()].join("|");
  const slotPattern = new RegExp(`\`((?:${names})\\.[A-Za-z]+)(?:\\[\\])?\``, "g");

  for (const folder of skillFolders()) {
    const path = join(SKILLS, folder, "SKILL.md");
    if (!existsSync(path)) continue;
    const rel = relative(root, path);
    const text = readFileSync(path, "utf8");
    const fm = frontmatter(text) ?? {};
    const declared = new Set(fm.metadata?.host ?? []);

    for (const slot of declared) {
      const [group, leaf] = slot.split(".");
      if (!groups.has(group) || !groups.get(group).has(leaf))
        fail(
          `${rel} declares \`metadata.host: ${slot}\`, which host/host.schema.json does not define. ` +
            `Add the leaf to the schema and a row to host/README.md § The groups, or fix the name.`,
        );
    }

    const used = new Set();
    for (const [, slot] of bodyProse(text).matchAll(slotPattern)) used.add(slot);
    for (const slot of used) {
      const [group, leaf] = slot.split(".");
      if (!groups.has(group) || !groups.get(group).has(leaf)) {
        fail(
          `${rel} reads \`${slot}\`, which host/host.schema.json does not define. A slot the schema ` +
            `does not know is absent in every consuming repo, so the skill runs its fallback ` +
            `forever. Add the leaf to the schema, or fix the name.`,
        );
        continue;
      }
      if (!declared.has(slot))
        fail(
          `${rel} reads \`${slot}\` in its body and omits it from \`metadata.host\`. The frontmatter ` +
            `list is what a consuming repo reads to find out which questions this skill asks, so an ` +
            `undeclared slot is one nobody fills.`,
        );
    }
  }
}

// ── 6. No host paths ────────────────────────────────────────────────────────

function checkNoHostPaths() {
  for (const folder of skillFolders()) {
    for (const file of markdownUnder(join(SKILLS, folder))) {
      const rel = relative(root, file);
      if (rel.split(sep).includes("references")) continue;
      const text = bodyProse(readFileSync(file, "utf8"));
      for (const [pattern, why] of HOST_PATH_PATTERNS) {
        const hit = pattern.exec(text);
        if (!hit) continue;
        const line = text.slice(0, hit.index).split("\n").length;
        fail(
          `${rel}: "${hit[0]}" ${why}.\n\n` +
            `A portable skill names no host repo's paths — host/README.md § The ` +
            `generic-versus-host test states the call. Cite the host file by slot and state what ` +
            `happens when the slot is null or absent, or move the sentence into ` +
            `skills/${folder}/references/, which is exempt. (Around body line ${line}.)`,
        );
      }
    }
  }
}

// ── 7. The templates validate ───────────────────────────────────────────────

/*
  A hand-written validator for the subset of JSON Schema the host file uses.
  The suite ships no dependencies, because a consuming repo installs the skills
  as files and a guard that needs an install step stops running.
*/
function validate(value, schema, path, schemaRoot, out) {
  if (schema.$ref) {
    const key = schema.$ref.replace("#/definitions/", "");
    return validate(value, schemaRoot.definitions[key], path, schemaRoot, out);
  }
  if (schema.allOf) {
    for (const sub of schema.allOf) validate(value, sub, path, schemaRoot, out);
    return;
  }
  const types = [].concat(schema.type ?? []);
  if (types.length) {
    const actual =
      value === null ? "null" : Array.isArray(value) ? "array" : typeof value;
    const ok = types.some((t) =>
      t === "integer" ? Number.isInteger(value) : t === actual,
    );
    if (!ok) {
      out.push(`${path} is ${actual}, and the schema allows ${types.join(" or ")}`);
      return;
    }
  }
  if (value === null) return;
  if (schema.enum && !schema.enum.includes(value))
    out.push(`${path} is ${JSON.stringify(value)}, outside ${JSON.stringify(schema.enum)}`);
  if (typeof value === "number" && schema.minimum !== undefined && value < schema.minimum)
    out.push(`${path} is ${value}, under the minimum of ${schema.minimum}`);
  if (Array.isArray(value) && schema.items)
    value.forEach((item, i) =>
      validate(item, schema.items, `${path}[${i}]`, schemaRoot, out),
    );
  if (value && typeof value === "object" && !Array.isArray(value)) {
    for (const key of schema.required ?? [])
      if (!(key in value)) out.push(`${path} is missing the required key \`${key}\``);
    for (const [key, sub] of Object.entries(value)) {
      const child = schema.properties?.[key];
      if (!child) {
        if (schema.additionalProperties === false)
          out.push(`${path}.${key} is not a slot the schema defines`);
        continue;
      }
      validate(sub, child, `${path}.${key}`, schemaRoot, out);
    }
  }
}

function checkTemplates() {
  const { schema, groups } = schemaGroups();
  const names = new Set(
    readdirSync(TEMPLATES)
      .filter((n) => n.endsWith(".json"))
      .map((n) => n.replace(/\.json$/, "")),
  );
  const allowed = new Set(schema.properties.template.enum);
  for (const name of allowed)
    if (!names.has(name))
      fail(
        `host/host.schema.json's \`template\` enum names "${name}" and ` +
          `host/templates/${name}.json does not exist. A template a repo cannot copy is a template ` +
          `nobody fills.`,
      );
  for (const name of names) {
    const path = join(TEMPLATES, `${name}.json`);
    const rel = relative(root, path);
    if (!allowed.has(name))
      fail(
        `${rel} is not in host/host.schema.json's \`template\` enum. Add it there, or delete the ` +
          `template.`,
      );
    let parsed;
    try {
      parsed = JSON.parse(readFileSync(path, "utf8"));
    } catch (error) {
      fail(`${rel} is not valid JSON: ${error.message}`);
      continue;
    }
    if (parsed.template !== name)
      fail(
        `${rel} declares \`template: ${JSON.stringify(parsed.template)}\`, and the file is named ` +
          `${name}.json. A repo that copies it records the wrong starting point.`,
      );
    const errors = [];
    validate(parsed, schema, name, schema, errors);
    if (errors.length)
      fail(`${rel} does not validate against host/host.schema.json:\n  ${errors.join("\n  ")}`);
    const missing = [...groups.keys()].filter((g) => !(g in parsed));
    if (missing.length)
      fail(
        `${rel} answers no slot in ${missing.join(", ")}. A template is a filled questionnaire, so ` +
          `every group appears — with \`null\` leaves where that kind of repo has none. An absent ` +
          `group means "nobody answered", which sends every skill into its fallback.`,
      );
  }
}

// ── 8. House style ──────────────────────────────────────────────────────────

function styleReport() {
  const files = [
    ...markdownUnder(SKILLS),
    ...markdownUnder(join(root, "host")),
    ...["README.md", "AGENTS.md"]
      .map((n) => join(root, n))
      .filter((p) => existsSync(p)),
  ];
  return checkHouseStyle(files, {
    standard: STANDARD,
    rel: (f) => relative(root, f),
  });
}

// ── Run ─────────────────────────────────────────────────────────────────────

checkNoStraySkillMd();
checkFrontmatter();
checkSkillIndex();
checkSkillReferences();
checkHostSlots();
checkNoHostPaths();
checkTemplates();
const style = styleReport();
findings.push(...style.findings);

if (findings.length) {
  console.error(findings.join("\n\n"));
  console.error(`\n${findings.length} finding(s).`);
  process.exit(1);
}
console.log(
  `guard: ok — ${skillFolders().length} skill folder(s), ${style.total} markdown file(s) read, ` +
    `${style.prose} of them for prose, ${style.pending} yet to opt in with \`house_style: true\`, ` +
    `${style.longSentences} sentence(s) over 26 words (advisory).`,
);
