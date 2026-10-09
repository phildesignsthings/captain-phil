---
name: show-me
description: >-
  Put a visual decision in front of the user as something they can see, move or hold, instead of
  describing it in words. Recommend a medium, make the options in it, then hand the ask to
  decision-request.
when_to_use: >-
  Use before asking the user to judge how something looks, moves or feels when nothing exists yet
  for them to look at: a layout, a hierarchy, a motion curve, the size of an effect, a speed, a
  touch target. Also use when you catch yourself describing a visual option in a sentence. Trigger
  phrases "show me", "draw it", "I can't picture it", "give me options", "let me see it", "put it
  on my phone".
compatibility: >-
  Reads dev.start, dev.url and dev.platform from .agents/host.json. Without them, start the app the
  way the repo's readme says and quote the address it actually bound. With dev.platform native, a
  link to the running app means a deep link plus taps, as decision-request describes.
metadata:
  suite: captain-phil
  host: [dev.start, dev.url, dev.platform]
---

# Show me

A visual option described in words is one the user has to take on trust. This skill turns it into
something they can open, and leaves the asking to `decision-request`.

## 1. Recommend a medium

Pick the row that fits what is being decided.

| What is being decided                                                 | Medium                              | What you make                                                                                                      |
| --------------------------------------------------------------------- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Layout, hierarchy, density, where copy sits, inside the design system | Paper, three options                | Three boards side by side on one page, through the `paper` skill                                                   |
| A look past the design system, a new visual idea, or open exploration | HTML, three options                 | One local HTML page with the three options side by side, free of the design system where the user asked to explore |
| Anything interactive, responsive or with states                       | HTML, three options                 | One local HTML page with the three options side by side, each one working                                          |
| Motion, timing, easing, the size of an effect                         | HTML with controls                  | One local HTML page with a slider per value and a button that copies the settings                                  |
| A change to the running app, where each option is cheap to build      | The app on its dev server           | A link to each option at the address `dev.start` bound                                                             |
| Size, speed, smoothness, touch, anything a real screen decides        | A Release build on the user's phone | The build installed, and the taps to reach each option                                                             |

Then ask in one line, before making anything: "I'd show this as X, because Y. Or would you rather
see it as Z?" Skip the ask where the user already named a medium.

## 2. Make the options

1. Make every option to the same finish, because a rough option next to two polished ones loses
   for the wrong reason.
2. Label each option on the option itself, with a letter and a name of two or three words.
3. Use the project's own components, tokens and copy, where the project has them and the user has
   not asked to explore past them.
4. Put your recommended option first.
5. Write each HTML page as one self-contained file in a fresh temporary folder, outside the repo's
   tracked files.
6. Give each slider its unit and its live value, set its starting value to your recommendation,
   and make the copy button produce JSON that names each value.
7. Open each option yourself and confirm it shows what the label says, before anyone else sees it.

## 3. Hand off the ask

Invoke `decision-request` to write the ask. It adds the link or the path, the steps that reach each
option, and the recommendation.

Where an HTML page is for looking at rather than for using, offer in the same ask to paste it into
Paper through the `paper` skill, so the user can leave comments on it. Paper limits how far a
creative exploration can go, which is why the options start in HTML.

Where the user pastes settings back from a slider page, write the values into the spec or the code
exactly as pasted.
