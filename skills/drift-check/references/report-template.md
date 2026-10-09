---
house_style: true
---

# The drift report

One file per feature, at `<docs.root>/drift/<feature>.md`. Each run adds a dated section and leaves
the earlier ones, so the file shows how the scope moved.

```markdown
# Drift: <feature>

**Scope read from:** <where the agreed scope came from>

## <date>, at <short commit SHA>

<"No drift." or the compare agent's table>
```
