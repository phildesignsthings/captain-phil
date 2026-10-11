---
name: articles
description: >-
  The captain-phil suite's manual. Answers what the suite is, what each skill does and the moment
  it runs in, where to start, how gates work, and what the host file answers, from the copy of the
  manual that installs with this skill.
when_to_use: >-
  Use when somebody asks what the captain-phil skills are or do, which skill to use, where to
  start, how gates work, or what `.agents/host.json` is for. Trigger phrases "what skills do I
  have", "what does this suite do", "how do these skills work", "the ship's articles", or
  "/articles". With an argument, answer about that skill or topic only.
argument-hint: '[skill or topic]'
metadata:
  suite: captain-phil
---

# The articles

The manual is `references/articles.md`. Read it before answering, and answer from it alone, because it is the suite's only description of itself in this repo.

## With no argument

1. Say in one sentence what the suite is, from the manual's opening paragraph.
2. Give the three steps of the manual's "Where to start" section.
3. List the moment headings of the manual's skills section, each with the names of its skills and nothing more.
4. Mark any skill in the table that this session does not list as installed, and say that running the README's install again adds it.
5. Say whether `.agents/host.json` exists at the repo root. Where it does not, say the skills run their fallbacks, and link step 2 of the README's install as the manual's host file section does.
6. Offer to explain any one skill or topic.

## With an argument

Where `$1` names a skill, give its row from the manual's table and the moment it sits under. Where that skill is installed, read its `SKILL.md` and add what triggers it and what it asks for.

Where `$1` names a topic, such as gates or the host file, give the manual's section on it.

Where the manual says nothing about `$1`, say so in one line and list the moment headings so the user can pick.

## Never

- Never answer from another source about the suite. The manual installed with these skills, so it matches their version, and the README on GitHub can describe a newer one.
- Never edit an installed skill or the host file. The manual's last section says where a change goes.
