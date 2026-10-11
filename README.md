---
house_style: true
---

# captain-phil

Captain Phil's working defaults, packaged as agent skills that install into any repo. They plan longer work in gates that stop for review, ask for decisions and report finished work in one fixed shape each, and never call a screen rendered until something has looked at it.

## Install

Installing captain-phil takes two commands, not one. `npx skills add` installs skills and nothing else, and the host file is not a skill, so step 2 is a separate fetch. Skip it and every skill runs its own degraded fallback instead of reading the repo's answers.

### Step 1. The skills

Into one project:

```bash
npx skills add phildesignsthings/captain-phil --skill '*' --agent universal --agent claude-code -y
```

Globally, for every session on the machine:

```bash
npx skills add phildesignsthings/captain-phil -g --skill '*' --agent universal --agent claude-code -y
```

List what the repo publishes without installing any of it:

```bash
npx skills add phildesignsthings/captain-phil -l
```

Refresh every installed skill from `main`:

```bash
npx skills update -p -y
```

The installer writes `.agents/skills/<name>/` with a symlink from `.claude/skills/<name>/`, and records each skill's content hash in `skills-lock.json`.

**Name both `universal` and `claude-code`, and do not use `--all`.** The installer picks its layout from how many distinct directories it is writing to. Name one agent and it sees a single destination, skips the shared folder, and writes a real copy of every skill into `.claude/skills/` instead. Naming `universal` as well gives it the second directory it needs, so it writes each skill once and links to it. `--all` is shorthand for `--skill '*' --agent '*' -y`. That second wildcard installs into every agent the tool knows, not only the ones the repo uses, so it drops an unprefixed `agent/` folder for Eve into repos that do not use Eve.

### Step 2. The host file

Several skills need to know things only the repo can answer: which command starts the app, which branch a pull request goes to, where the design records live. The repo answers once in `.agents/host.json`, and every skill reads its answers by slot.

Three templates ship in `host/templates/`. Pick the one that matches the repo and paste its block. Each writes `.agents/host.json` and prints the name of the template it wrote, so you see a wrong pick straight away. Each refuses to overwrite an existing host file, because that file holds answers the template lacks. Move it aside first to start again.

**Expo, React Native.** Starts with `npx expo start --ios`, checks with `tsc --build` and `npx expo lint`, screens under `src/app/`, primitives under `src/components/ui/`.

```bash
(set -C; mkdir -p .agents && gh api repos/phildesignsthings/captain-phil/contents/host/templates/react-native-expo.json \
  --jq .content | base64 -d > .agents/host.json) && grep '"template"' .agents/host.json
```

**React on the web.** Starts with `npm run dev` on port 5173, adds a Prettier check, routes under `src/routes/`, shadcn components under `src/components/ui/`.

```bash
(set -C; mkdir -p .agents && gh api repos/phildesignsthings/captain-phil/contents/host/templates/react-web.json \
  --jq .content | base64 -d > .agents/host.json) && grep '"template"' .agents/host.json
```

**Anything else.** Sets the trunk to `main` and leaves every other slot empty, the checks included, rather than guessing them. Start here when no other template is close, then fill the slots the repo can answer.

```bash
(set -C; mkdir -p .agents && gh api repos/phildesignsthings/captain-phil/contents/host/templates/minimal.json \
  --jq .content | base64 -d > .agents/host.json) && grep '"template"' .agents/host.json
```

Open the file afterwards and correct the paths the repo does not match, most often `surfaces.root`, `components.dir` and `theme.dir`. Point the `checks` commands at scripts the repo really has. [The host file spec](host/README.md) gives each slot's meaning, the three states a slot can be in, and which skills read it.

A repo with no host file still works. Each skill names its fallback in its `compatibility` frontmatter, runs that degraded path, and offers once to write the answer into `.agents/host.json`.

## Skills

The manual is [the articles](skills/articles/references/articles.md): what each skill does, grouped by the moment it runs, plus how gates work and what the host file answers. It installs with the `articles` skill, so in a consuming repo `/articles` answers the questions this section would. Add a skill's row there, in the commit that adds the skill.

## Versioning

`main` means released. Develop on a branch, merge when a skill is finished, and every consumer's next `npx skills update -p -y` pulls the change.

**`update` refreshes the skills a repo installed. It does not add skills the suite gained since.** It walks the lock file, so it never sees a skill merged to `main` after the repo's install. A consumer picks up a new skill by running the install command again, which adds the missing folders and leaves the rest alone. Each release says which of the two its consumers need.

- **Version history** is the consuming repo's own git log. Commit `.agents/skills/` and `skills-lock.json`, and `git log -- .agents/skills` is the record of what changed when.
- **Rollback** is `git revert` in the consuming repo, not a flag on the installer.
- **Pinning** is not running `update`. The lock file records the hash a repo installed.
- **Never hand-edit an installed skill.** `update` reinstalls from source and overwrites the edit without warning. Fix it in this repo, merge to `main`, then `npx skills update -p -y`.

## Contributing

Run `npm run guard` before every commit. CI runs it again on every push and every pull request, but a failing run does not block a merge, because a private repo on a free personal account cannot protect a branch. Somebody has to read a red run.

The guard checks the skills index against the filesystem both ways, validates the three host templates against `host/host.schema.json`, ties each skill's `metadata.host` to the slots its body reads, fails any skill body outside `references/` that names a particular repo's paths, and runs the house style over every markdown file.

`AGENTS.md` holds the rules for an agent editing this repo. `CLAUDE.md` symlinks to it.

## Access

The repo is private under `phildesignsthings`. Coworkers who want the suite get read-only collaborator access, which lets `npx skills add` resolve the repo. This repo stays the only source, because `update` reinstalls every installed copy and a local edit does not survive it.
