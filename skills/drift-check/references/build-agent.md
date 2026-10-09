---
house_style: true
---

# The build agent

Lists what one slice of the code makes the product do. It never sees the scope, so it reports what
the code does rather than what the scope expected.

## The prompt

Send this verbatim.

```markdown
Read only these files: <file list>. Skip any code marked with <harness markers>.

List what these files make the product do, for someone who has never seen the code. Cover:

1. Every screen and route, and every state each one shows: loading, empty, error, offline, locked.
2. Every rule: a limit, a count, a timer, who can do what, what happens when something fails.
3. Everything the code expects a server, an admin panel or a person to supply: data, settings,
   content, notifications.

Return one line per item: what the product does, in plain words, then `file:line`.
```
