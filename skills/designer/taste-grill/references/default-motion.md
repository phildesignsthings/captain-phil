---
house_style: true
read_when:
  - "Work adds or reviews motion: a transition, an enter or exit, a press state, a list appearing, a popover, a sheet, a drag, feedback, a shared element, a loading state or haptics"
  - "Somebody asks to make an interface feel snappy, add delight, animate it or polish the motion"
---

# The default motion

How the default taste moves things. `references/default-taste.md` decides where delight goes, and this file decides how it moves. The tags work the same way: a `[bar]` rule is correctness and never changes, and a `[style]` rule is a taste call the designer's overrides can change. A product's design file sets the values a rule uses, such as the tokens below, and never changes a rule.

Motion has two jobs. It informs, saying where something came from, where it went and what changed. It confirms, saying the tap worked or the thing saved. Delight comes from doing those two jobs fast and physically, never from extra animation.

## Budget

- **A motion that neither informs nor confirms is cut.** [style]
- **One motion story per interaction.** A tap gets a press, a result and at most one trailing detail. Three things never move at once for one cause. [style]
- **Nothing moves while idle.** No looping pulses, no shimmer on settled content and no breathing badges. A skeleton shimmer runs only while data is loading. [style]
- **High stakes and high frequency get speed, not flourish.** Errors, destructive actions, outages and tasks done many times a day get short, crisp feedback only. The bigger moments are for the few heroes the default taste picks, such as finishing something, an all-clear or a first run. [style]
- **Reduce Motion keeps every confirmation.** Under the system setting, movement becomes an opacity crossfade of 150 ms or less. Only the travel goes, never the feedback. [bar]
- **Under 300 ms for almost everything.** Snappy beats smooth, so a motion that feels slow gets shorter before it gets a new easing. [style]

## The ambient glow

The one exception to nothing moving while idle is the glow behind a glass focus panel, like balls of colour slowly swirling together.

- **Two or three soft colour blobs inside the panel,** each on its own slow orbit of 15 to 25 seconds a lap, out of phase so it never visibly repeats. They blend where they overlap, like light, rather than sliding as one gradient. [style]
- **A little film grain in the glow only,** subtle and gone at arm's length. [style]
- **The colours keep the panel's meaning:** trouble is red with amber, information is blue with violet. [style]
- **Text over the glow passes contrast at the brightest overlap,** not on average. [bar]
- **Only the glow moves,** never the panel or its text. [style]
- **It runs only on the screen in focus,** pauses when the app is in the background, and holds still under Reduce Motion. [bar]
- **One glow per screen at most.** A glow anybody notices while reading is too much. [style]
- **In light mode the glow is about half its dark-mode strength,** around 9% alpha for red and 7% for blue: a hint of warmth, never a stain. [style]

## Timing and easing tokens

| Token | Value | For |
|---|---|---|
| `press` | 100 ms in, 150 ms out | Press scale |
| `fast` | 150 ms | Icon swaps, small fades, exits of small things |
| `base` | 200 ms | Dropdowns, popovers, toasts, accordions |
| `move` | 250 ms | On-screen moves, sheets, shared elements |
| `stagger` | 30 ms per row, capped at 8 rows (about 240 ms) | Lists, timelines |
| `trail` | 50 ms | A detail settling after its parent, such as a badge or a count |
| `ease-out` | `cubic-bezier(0.22, 1, 0.36, 1)` | Entrances |
| `ease-in` | `cubic-bezier(0.55, 0, 1, 0.45)` | Exits |
| `ease-in-out` | `cubic-bezier(0.65, 0, 0.35, 1)` | Things already on screen moving |

- **The token values above are the default.** A product's design file can change the values, and the rules below still hold. [style]

## The rules

### Entering and leaving

- **Ease-out for entrances.** Things arrive fast and settle. [style]
- **Dropdowns take 150 to 250 ms.** Faster feels broken, and slower feels heavy. [style]
- **Popovers start at scale 0.95, not 0,** with opacity going from 0 to 1. [style]
- **Enter from the trigger.** The transform origin is the control that opened it, so a top-right menu grows from the top right, never out of the centre. [style]
- **Exit to the trigger.** It closes back toward where it came from, rather than fading into the centre. [style]
- **Exits run about 20% shorter than entrances,** such as 250 ms in and 200 ms out, because leaving is less interesting than arriving. [style]
- **The old and new states overlap.** The new state comes in while the old one leaves, with no blank beat between them: Save becomes Saved, never Save, then nothing, then Saved. [style]

### Lists and detail

- **List rows stagger by 30 ms,** on first appearance only, never on scroll or refetch. [style]
- **Details stagger as they settle.** A badge or a count trails its row by 50 ms, so the eye reads the parent first. [style]
- **Masks for reveals and colour changes.** Expanding content is clipped open by height or a mask, rather than faded and slid, and a colour change can wipe across with a mask instead of a flat fade. [style]

### Moving things

- **An object crossing the screen follows a slight arc,** about 32 px, rather than a straight line. [style]
- **Ease-in-out for on-screen moves.** The thing starts and ends on screen, so it speeds up and slows down. [style]
- **A moving knob stretches by about 12%** along its direction of travel, keeping its area, and resets when it lands. That covers toggle knobs and a tab bar's pill. [style]
- **No spring bounce on everyday UI.** Critically damped, with no overshoot. Bounce is for a hero moment, if anywhere. [style]
- **A thing that appears on two screens animates as one object,** under one shared layout ID, such as a list row's title becoming the detail header. [style]

### Touch and gestures

- **Every tappable surface scales to 0.97 on press:** rows, buttons and chips. It is instant on touch-down and springs back on release. [style]
- **No tween while held.** Under a finger, the object tracks the finger one to one with no easing, and animates only after release, with the release velocity. [style]
- **Rubber band past drag bounds.** Pulling past the end resists, at about a third of the finger's travel, then springs back. [style]

### Feedback

- **A single pulse confirms success:** one scale from 1 to 1.04 and back, or one ring, about 300 ms, together with the label change. It never repeats. [style]
- **Icons crossfade with scale and blur.** From copy to check, the old icon fades out at 0.8 scale with a few px of blur while the new one comes in from 0.8. Never a hard swap. [style]

## Haptics on mobile

- **Haptics confirm, the way motion does, and never decorate.** Selection for picks and toggles, a light impact for a press that commits, and the success, warning and error notifications for outcomes. [style]
- **Never on scroll, on every row, or on anything that fires repeatedly.** [style]
- **Haptics work on both mobile platforms,** and a device with no vibration motor never throws. [bar]
- **Use `expo-haptics` in an Expo app.** It covers both platforms. [style]

## React Native and Expo

- **Reanimated for the tokens,** with `withTiming` and `Easing.bezier(...)`, and `withSpring` only with damping high enough for zero overshoot, except on a hero. Gesture Handler for anything under a finger, with the shared value following the gesture directly. [style]
- **Reanimated's `sharedTransitionTag` is the shared layout ID.** Where it is unreliable on Android, Android falls back to a crossfade rather than shipping a broken move. [style]
- **Read Reduce Motion with `useReducedMotion()`,** and branch at the token level, not per screen. [style]
- **Every motion runs on iOS and Android.** Where the blur in an icon crossfade is expensive on Android, Android drops the blur and keeps scale and opacity. [bar]
- **Entering rows use presets such as `entering={FadeInDown.delay(i * 30)}`,** on the first render only, guarded with a ref, never on refetch. [style]
- **The ambient glow draws with Skia,** `@shopify/react-native-skia` with Reanimated values on the UI thread, so the blend and the blur are real on both platforms. [style]

## Before calling motion done

- **Each motion says what it explains or confirms,** and the ones that can't are cut. [style]
- **Everything is under 300 ms,** except a named hero. [style]
- **Popovers and menus grow from their trigger and return to it.** [style]
- **No overshoot on everyday UI, and no idle loops.** [style]
- **Exits run shorter than entrances,** with no blank beat between states. [style]
- **A dragged thing tracks the finger,** and rubber-bands at its bounds. [style]
- **Reduce Motion keeps every confirmation.** [bar]
- **It was checked on Android,** or the report flags it as read from code only. [bar]
