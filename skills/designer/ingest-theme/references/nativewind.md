---
doc: nativewind
house_style: true
read_when:
  - "A theme is being written for a stack whose stylesheet imports nativewind/theme"
  - "A dark theme has to be checked for a token one of its blocks left out"
---

# Writing a theme for NativeWind

**Scope:** the two shape rules a theme file owes on a NativeWind stack, such as gluestack-ui v5 on Expo. The `ingest-theme` skill is the order the work happens in, and this file is what its steps 2 and 4 check against. The file named by `theme.doc` overrides it wherever a repo states its own.

The stylesheet tells you the stack. It carries an `@import 'nativewind/theme'` line, and declares colour tokens as `rgb(var(--token))` in an `@theme inline` block.

## Values are space-separated RGB triplets

Write every colour token as three channels with no commas and no wrapper: `--primary: 80 105 232;`. The `@theme inline` block wraps each one in `rgb(var(--primary))`, which is what lets an opacity modifier such as `bg-primary/50` work.

- **Convert a hex or an oklch export before it lands.** A hex or an `oklch()` value dropped into a triplet slot fails without an error, and the token renders as nothing.
- **Keep the designer's hex findable.** Write it in a comment beside the triplet it became, because nobody searches a theme file for `80 105 232`.
- **Read the traps' thresholds in oklch anyway.** `references/theme-traps.md` states them in oklch, so convert the triplet to check a threshold, rather than guessing from the channels.

## The dark theme is three blocks, and each one carries every token

A NativeWind theme with a dark face writes the same token set three times:

1. `:root` holds light, on every platform.
2. `@media (prefers-color-scheme: dark) { :root { … } }` holds dark. NativeWind maps this block to the device's appearance setting on native.
3. `:root.dark` and `:root.light` hold the same two faces again at higher specificity, for the web's class toggle.

**A token has to appear in all three blocks or in none.** A token that the dark blocks set and `:root.light` omits does not fall back to light. It keeps its dark value on a device whose system is dark and whose app is forced light, and that screen renders plausibly and wrong.

Check it by listing the tokens each block declares and comparing the three lists. Where the theme is single-mode, write its one face into `:root` and carry neither dark block.
