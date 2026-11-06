# S.A.S.H.A — Learning Lab

A starter for building lessons one action at a time. Lesson 1 begins with a colorful, animated Fractions title (action 0).

The lesson card is named **Fractions** (its existing `/lesson/1` URL is unchanged).
Lesson 2, **Equations**, opens at `/lesson/2` with forty-four actions:
0. A centered, colorful Equations title.
1. "Imagine a scale" appears above a large, empty, balanced scale.
2. Three boxes drop onto the right pan; the scale tips to the right.
3. Three boxes drop onto the left pan; the scale balances.
4. "3 = 3" appears beneath the scale.
5. "This is a simple equation!" introduces the definition: an equation says
   both sides have the same value, just like a balanced scale. The three boxes
   on each side and "3 = 3" remain visible.
6. A fourth box drops onto the left pan and tips the scale left. "4 ≠ 3"
   and "Not balanced!" explain that 4 = 3 would be a false equation.
7. One little 1 kg box faces one big 4 kg box, drawn twice as wide and twice
   as tall as a little box (a 2 × 2 footprint), including in the legend. An icon legend and
   "1 + x = 4" ask how many little boxes to add. Whole-number answers 0–20
   add that exact number of little boxes; the scale responds to their weight.
   Three balances the scale with success feedback and confetti. Incorrect
   answers show an unbalanced scale, then reset the activity after five seconds.
   Both results show a one-second translucent green/red full-screen overlay
   with scattered, randomly positioned and rotated "Correct!"/"Incorrect!" text.
   Overlays do not intercept clicks; screen readers receive a single result
   explanation. Leaving the action removes the overlay and cancels its reset
   timer. Reduced motion disables text pop animations. The scale size adapts
   to viewport height.
8. Three little boxes on the left face two big boxes (8 kg) on the right.
   "3 + [letter] = 8" asks learners to add five little boxes to the left.
   The variable and input label change to a different random letter every second.
   An arrow points to the variable: "A variable can be any letter!"
   Fixed-width variable and input-label slots keep the layout stable as letters change.
   Answer limits, overlays, confetti, and incorrect-answer reset match action 7.
   Leaving this action clears its letter interval and resets the puzzle.
9. "How do we solve each equation?" introduces four examples on the right:
   x + 3 = 7, x − 2 = 5, x ÷ 4 = 3, and x × 3 = 12.
   The title and equations stack vertically on narrow screens.
10–29. Each equation card is highlighted in turn while the others dim.
   Explanations undo addition with subtraction, subtraction with addition,
   division with multiplication, and multiplication with division.
   Each example has five arrow-key steps: original equation, animated inverse
   operation beneath both sides, cancellation and simplified equation,
   calculated solution, and substitution check. Earlier working stays visible.
   Left Arrow reverses each step; only advancing after the check focuses the
   next equation. Reveals respect reduced-motion preferences.
30–34. A guided mystery-weight scale shows x + 2 = 6. Each little box is 1 kg.
   Right Arrow highlights two boxes on each side and shows −2 on both sides,
   animates their simultaneous removal while keeping the scale balanced,
   reveals the mystery box as 4 kg, then restores the original boxes to check
   4 + 2 = 6. Left Arrow reverses the walkthrough.
35–37. Three independent answer-entry challenges increase in difficulty:
   x + 4 = 9, 3 × x = 18, and 2 × x + 3 = 13. Each offers an optional hint;
   the last introduces undoing addition before undoing multiplication.
   Answers use the existing 0–20 whole-number limit, one-second result overlay,
   five-second incorrect reset, and focused-field arrow navigation. Correct
   answers reveal worked solutions and substitution checks. Re-entry resets
   each challenge; leaving cancels pending reset timers.
38–41. One rule-family slide per operation: addition, subtraction,
   multiplication, and division. Each shows a + b = c (or the corresponding
   operation) and two related equations, without explanatory paragraphs.
   Only brief nonzero-divisor conditions remain where required.
   Each includes a "For example" section with three matching numeric equations,
   using the same orange/teal/purple colors as the symbolic rules.
   Each example number has its corresponding a, b, or c directly above it.
42. A giant, four-line look-ahead equation with large decimals, an infinite
   summation, zeta and gamma functions, an integral, a product, nested square
   roots, a fourth root, logarithms, and an exponential, introduced by “You’ve made your first
   step in understanding how to solve THIS.” This is inspiration, not a problem
   learners are expected to solve; advanced equations need additional methods.
43. A celebration finale with encouraging messages around the screen,
   animated fireworks, and a Back to lessons link. Reduced motion keeps
   messages static and hides the fireworks.

Use Left/Right Arrow to navigate, bounded at the first and last actions.
The box-answer field also allows these slide shortcuts while focused;
Up/Down Arrow retains its numeric input behavior.
Submitting moves focus to the puzzle container before disabling its controls,
so slide navigation remains available after either a click or Enter submission.
Reversing removes the corresponding boxes or equality; advancing replays box
entrances. Pans remain upright as their anchors follow the beam ends.
Animations respect reduced-motion preferences. Progress is not saved.
Both lessons use the shared `src/components/LessonTitle.jsx` component.
The homepage lesson cards include local SVG illustrations of pizza fractions and
an equation balance. Navigation is a vertical left sidebar. During lessons it
is fully hidden until the leftmost 14px of the screen is hovered (or tapped).
Outside lessons, a Menu button stays visible. Keyboard focus also reveals the
Menu button, which opens with Enter or Space. The sidebar slides away when the
pointer leaves, focus leaves, a link is selected, Escape is pressed, or the route
changes. Equations has no previous/next buttons or bottom slide counter.
Card and navigation transitions respect reduced-motion preferences.
The **Practice** navigation item opens `/practice`, with a **Quick Math** game at
`/practice/quick-math`.

## Equation Quest

Open **Practice → Equation Quest** (`/practice/equations`) for endless equation
practice using the same game interface and rules as Quick Math: 3 hearts,
level-ups every 3 correct answers, streak points, heart recovery every 5 levels,
pause/resume, automatic pause when leaving the tab, and replay/results.
Each equation gets a fresh **60-second timer**. There are no speed bonuses.
Levels 1–2 use addition/subtraction; levels 3–4 add multiplication/division;
level 5 onward mixes one-step equations with two-step equations such as
`3 × x + 4 = 19` and `x ÷ 3 + 4 = 9`. Number ranges grow with levels and are
capped. Every equation has one non-negative whole-number solution, and division
is exact. Wrong answers cost a heart and allow retrying the same equation;
timeouts reveal x and a substitution check before continuing (or ending when
hearts run out). Best scores save separately from Quick Math; equation practice
does not read or write its arithmetic fact map. Other game progress is not saved.
Both games share the same state engine and UI; equation generation lives in
`src/games/equations.js`.
Run game tests with `node --test src/games/*.test.js`.

## Quick Math

- Endless play starts at level 1, with a fresh 30-second timer per question.
  Every 3 correct answers raise the level. There is no total time limit.
  On timeout the answer is revealed, the streak resets, and a Next question
  button lets the learner continue without losing points.
  A timeout counts as one unsuccessful attempt for accuracy.
- Players start with 3 hearts. Each wrong answer or timeout costs a heart, and
  losing the last heart ends the game (the final answer is shown on the
  summary). Reaching level 5, 10, 15, … restores one heart, up to 3.
- Addition, subtraction, multiplication, and division rotate through the round
  with a random starting operation. Difficulty increases the number ranges;
  operands eventually cap at 200 for addition/subtraction. Multiplication and
  division stay within times tables (factors up to 12) through level 10, then
  grow slowly to a cap of 25. Subtraction is non-negative; division is always exact.
- Type a whole-number answer and press Enter or tap Check answer. The numeric
  keyboard is requested on mobile. Blank and non-digit answers are blocked by
  form validation. The input clears and refocuses for every new question.
  Incorrect attempts reset the
  streak but do not deduct points, and the same problem stays available to retry.
- Correct answers earn `10 × level + 2 × min(streak − 1, 10)` points, plus a
  first-try speed bonus: +10 at 2 s or less (⚡) and +5 at 3 s or less (🚀).
  Answer time excludes pauses and is shown in the feedback. The next
  question appears after a snappy 320 ms celebration with its own full timer; answers
  cannot be scored twice. Timers stop while showing a correct answer or timeout.
- Each new question cycles to a different five-color palette for the numbers,
  input, buttons, timer, and accents (including after a timeout). Colors stay
  stable while typing, retrying, or pausing. A 160 ms question entrance respects
  reduced-motion preferences. Progress markers track the next level.
- Pause/resume is available; leaving the browser tab automatically pauses.
  The countdown uses a deadline, not interval tick counts.
- Score, best score, level, and current streak stay visible. Finish & see results
  ends the game at the learner's choice, including while paused. The final screen
  includes solved problems, best streak, accuracy (correct / all attempts),
  average and fastest answer time, speed bonuses, and replay. Best score
  persists in local browser storage; blocked or invalid storage shows an
  explicit warning. Other round progress is not persisted.
- Fact tracking (`src/games/facts.js`): every exact fact (for example `7 × 8`)
  stores attempts, misses, whether the latest try was correct, and a
  recent-weighted first-try answer time in local storage
  (`sasha.quick-math.facts.v1`, up to 1,500 facts, validated on load). Only the
  first miss per question counts; timeouts count as misses.
- Review: each question has a 35% chance to replay a missed or slow fact that
  fits the current level's limits (never the same fact twice in a row). Review
  questions show a 🔁 REVIEW badge. Weights: missed 4, over 5 s 3, 3–5 s 1.5;
  facts answered in 3 s or less are not reviewed.
- Fact map: on the start and results screens, a 1–12 heat map per operation
  colors each fact as fast (≤3 s), getting there (3–5 s), slow (>5 s), missed
  last time, or not seen yet, with a mastered count. Addition and multiplication
  fold `a·b` and `b·a` into one square; subtraction and division use
  (number taken away / divisor, answer). Reset fact map clears the saved data.
- Arithmetic and game-state tests: `node --test src/games/quickMath.test.js`.

```bash
npm install
npm run dev        # http://localhost:5173
```

## Where things live

| What | Where |
|---|---|
| App routes | `src/App.jsx` |
| Starter page | `src/pages/Home.jsx` |
| Lesson route | `src/pages/LessonPage.jsx` |
| Lesson 1 actions | `src/lessons/FractionsLesson.jsx` |
| Lesson 1 styling and animation | `src/lessons/fractions.css` |
| Lesson 2 actions | `src/lessons/EquationsLesson.jsx` |
| Shared animated lesson title | `src/components/LessonTitle.jsx` |
| Midnight theme | `src/styles/themes.js` |
| Shared UI components | `src/components/` |

## Lesson actions

Right Arrow advances to the next action; Left Arrow returns to the previous action.
Navigation stops at the first and last defined actions and ignores editable fields,
held keys, and modified shortcuts.

- Action 0: a huge, centered, colorful Fractions title.
- Action 1: the title shrinks and slides to the top center; a large whole pizza appears.
- Action 2: the pizza shifts left and shrinks, two people appear on the right, and
  the sharing question appears. Hovering over the pizza shows a knife cursor and
  a diameter cut preview following the pointer. Clicking cuts along that diameter
  and sends one smaller half on a white plate beneath each person, with a colorful
  stacked 1/2 label. The boy and girl move closer together toward the center and grow.
  Enter or Space on the focused pizza
  also cuts it; touch users can tap. Left Arrow resets the cut when leaving action 2.
  On narrow screens the uncut pizza and people stack vertically.
- The sharing question disappears after cutting.
- Action 3: repeats the sharing interaction for three people. The knife previews
  three equal 120-degree sectors; clicking serves each child one third on a white
  plate, labeled 1/3. Moving between actions resets the cut.
- Action 4: repeats the sequence for four children, with four equal 90-degree
  sectors, white plates, and colorful 1/4 labels.
- Action 5: only one quarter remains, moving to the center-left beside a large
  colorful 1/4, with "This is a fraction!" above. A whole pizza rolls from left
  to right while the sharing scene fades out and the fraction scene settles in.
  Right Arrow waits for this transition; Left Arrow cancels it. Reduced motion
  skips the rolling transition.
- Action 6: the quarter and fraction stay in place as the heading animates to
  "But what do these numbers actually mean?"
- Featured fraction numbers respond to hover and keyboard focus, with hints
  explaining each number.
- Action 7: a teal chalk arrow explains the denominator (4); "whole" and "pieces"
  have highlight backgrounds and the other three quarters faintly complete the pizza.
- Action 8: a pink chalk arrow explains the numerator (1). A thick white outline
  emphasizes the owned quarter while the other pieces fade further.
- Action 9: explanatory sentences disappear and a yellow chalk arrow labels 1
  "Numerator" from a new position.
- Action 10: a blue chalk arrow also labels 4 "Denominator".
- Action 11: "Practice time ;)" asks learners to identify the numerator in 1/3.
- Action 12: asks learners to identify the denominator in 2/5.
- Action 13: uses 4/9 and asks how many slices the pizza is divided into (9).
- Action 14: keeps 4/9 and asks how many slices of pizza you have (4).
- Action 15: "What is a fraction?" offers four definitions. The correct answer is
  "A fraction is a number that represents part of a whole or parts of a group."
  All choices use the same styling, retry feedback, and celebration.
- Action 16: a huge "Fractions are EVERYWHERE!" title introduces a new concept.
- Action 17: a mostly visual overview of all eight Moon phases.
- Actions 18–19: separate visual explanations of waxing (growing light) and
  waning (shrinking light).
- Actions 20–27: eight named phases, each with a large NASA image, a fraction, and
  one short explanation. Fractions measure the lit part of the face visible from
  Earth, not the amount of Moon. New Moon is approximately 0 lit, quarters are 1/2,
  and Full Moon is 1. Crescents use a rough estimate of ≈ 1/4 and gibbous phases
  ≈ 3/4; these vary continuously and are not fixed values for every night.
  Quarter names refer to progress through the cycle.
- Actions 28–35: one Moon card at a time, in shuffled order. Phase-name and
  fraction dropdowns are also shuffled independently per card, and stay stable
  while answering. Both selections are required before checking. Correct answers
  celebrate and reveal a Next Moon button; incorrect answers allow retries.
  The shuffled deck lasts for the lesson visit. Arrow navigation still works;
  returning to a card resets its answer, not its options.
- Action 36: today's Moon, fetched from NASA Dial-A-Moon for the current UTC hour.
  Shows the matching NASA visualization, phase name, illumination percentage,
  approximate fraction out of 100, source, and UTC observation time.
  Loading, network/invalid-data errors, and image errors are explicit, with retry.
- Action 37: "The end!" and a link back to the lessons.

## Moon imagery

The eight local images in `public/moon/` are NASA phase imagery downloaded from
the [NASA Moon Phases guide](https://science.nasa.gov/moon/moon-phases/), with
visible credit links in the lesson. Original image URLs follow
`https://science.nasa.gov/wp-content/uploads/2023/08/<phase>.jpg`
(Full Moon uses `full.jpg`). These are NASA educational visualizations using
realistic lunar surface imagery, not photographs taken during this lesson.
Phase views are oriented for the Northern Hemisphere; their rotation varies by
viewing location. See [NASA media usage guidance](https://www.nasa.gov/nasa-brand-center/images-and-media/).

Moon phase data and teaching screens live in `src/lessons/MoonLesson.jsx`;
their styling lives in `src/lessons/moon.css`.

### Live Moon data

Vite's development and preview servers proxy `/api/moon/<UTC hour>` to
`https://svs.gsfc.nasa.gov/api/dialamoon/<UTC hour>`, since NASA does not allow
direct browser API requests from this app's origin. No API key is needed.
**Production hosting must provide the same reverse-proxy route**; a static-only
deployment of `dist/` without that route cannot load live Moon data.
Images load directly over HTTPS from NASA. These are hourly scientific
visualizations, not a live telescope feed. Phase names are approximate categories:
under 1% illumination is labeled New Moon, over 99% Full Moon, and 49–51% a
quarter; otherwise waxing/waning follows the lunar age.

## Interaction details
  Click a number (or focus it and press Enter/Space). Incorrect choices show a
  shaking red retry message; correct choices show a bouncing green "Correct!"
  box and a brief pizza shower. Reduced motion keeps feedback static and skips
  the shower. Returning to a practice action resets its answer.
- Served slices and all four pieces in the fraction explanation highlight
  independently on hover or keyboard focus with a smoothly appearing white border.
  Slice opacity stays unchanged on hover. Annotations use the readable UI font,
  highlight important words, and have arrows from different directions.
- Unchanged headings stay mounted between actions; heading entrances only replay
  when the heading text changes.

Add action components to the ordered `actions` array in `src/lessons/FractionsLesson.jsx`
(action 0 has no extra visual beyond the persistent title).
Each lesson opening starts at action 0. Title letters pop in one at a time;
reduced-motion preferences show the title immediately without animation.

The compact navbar reveals when hovering the top edge or focusing a navigation link
with the keyboard. It stays visible on touch devices without hover support.
