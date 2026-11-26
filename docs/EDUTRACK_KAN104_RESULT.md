# EduTrack — KAN-104: Landing Login Modal Interaction Fixes

## Scope and preflight

- Date: 2026-11-26, Asia/Bangkok. Read repository `AGENTS.md`; no prior KAN-104 report existed. This is the single consolidated report.
- Branch: `Duy`; starting HEAD: `c735fa0342f1abbc153956b1d87e4a7377fc84f9` (`CM/AD - Remove reset and PDF export from reports`). Starting working tree was clean; the previous KAN-115 work was already committed before this task began.
- Inspected the latest local `WorkspaceChooser`, landing layout/header/CSS, authentication flow, and existing Landing browser suite. No resets, reverts, staging, commits, pushes, merges, or pull requests were performed.
- Scope includes login interaction fixes and the subsequent requested close-button style B refinement. Backend, authentication contracts, role permissions, KAN-103 modals, KAN-115 reports, landing section content, global smooth scrolling, anchor navigation, and Back to Top remain unchanged.

## Root causes and interaction changes

### Scroll and focus

The previous lifecycle automatically focused the X button and called `previous?.focus()` during cleanup without suppressing browser scrolling. With the landing document's smooth scrolling, the focus/open/close sequence could move the viewport. The original production build reproduced a desktop shift of **457px** at Featured Classes and near the bottom. No scrollbar-width or horizontal layout change was reproduced.

The dialog now removes X autofocus, explicitly focuses the identifier input with `preventScroll: true` after `showModal()`, and restores the previous connected element with `preventScroll: true` on ordinary dismissal. Native `<dialog>`, `showModal()`, `close()`, accessible title, and Escape/cancel handling remain in use. No production `scrollTo()` workaround or CSS scrolling change was added.

On mobile, clicking Sign In also closes the navigation containing that button. The original dialog returned focus to BODY rather than a visible control. The header now focuses the visible navigation toggle with `preventScroll: true` before closing the menu and opening the dialog, so ordinary dismissal returns keyboard users to Open navigation. Desktop returns focus to Sign In.

Successful authentication marks navigation separately, allowing the existing close-and-redirect workflow without explicitly restoring focus to the landing header during route teardown.

### Backdrop interaction

The old `onClick` checked only the final target/coordinates. A mouse gesture starting on dialog text and releasing on the backdrop produced a click interpreted as backdrop dismissal; reproduced at 1440, 390, and 360px.

The replacement uses React pointer handlers on the dialog. A primary, left-button pointer must begin and end on the backdrop with the same pointer ID. Movement beyond 8 CSS pixels invalidates the gesture, including moving away and returning to the starting point. Pointer cancellation clears the candidate. Dialog-origin drags and backdrop-to-dialog drags cannot qualify. No document-wide product listeners or pointer capture were introduced. Intentional short backdrop clicks and touch taps still dismiss.

### Authentication in flight

A synchronous ref blocks duplicate submissions and ordinary dismissal while authentication is pending. X is disabled; Escape's native cancel action is prevented and routed through the same guard; qualifying backdrop gestures respect the guard. Failed authentication leaves the dialog and entered credentials intact and releases the guard. Successful authentication retains the original API, payload, user-selection/session updates, and redirect logic. Validation and error messages are unchanged.

## Files changed

| File | Change |
|---|---|
| `Capstone2/frontend/src/GUIs/components/landing/WorkspaceChooser.tsx` | Scroll-safe focus, pointer gesture tracking, pending-auth dismissal guard, navigation-aware cleanup |
| `Capstone2/frontend/src/GUIs/layouts/landing/LandingHeader.tsx` | Visible mobile focus destination before hiding navigation |
| `Capstone2/frontend/src/assets/css/landing.css` | Isolated login close-button style B and brand-row alignment |
| `Capstone2/frontend/tests/landing.browser.mjs` | Focused `--login-interactions` mode, controlled authentication fixtures, real mouse/touch/keyboard regression checks, measurements and listener checks |
| `docs/EDUTRACK_KAN104_RESULT.md` | This consolidated report |

Reviewed without modification: `Landing-page-layout.tsx`, `authApi.ts`, and the user-selection service. Landing CSS was unchanged in the initial interaction fix and updated only for the requested close-button refinement below.

## Scroll-position measurements

Measurements use the production app in headless Chrome. The suite records scroll X/Y, Featured Classes top/left, header left/width, and document client width every animation frame across opening, closing, and a 450ms settling interval. Smooth scrolling remains enabled. Top is 12px, middle positions Featured Classes below the sticky header, and bottom is 12px above the document's end.

| Width × height | Position | Original scrollY before → after | Fixed scrollY before → after |
|---|---|---|---|
| 1440 × 900 | Near top | 12 → 0 | 12 → 12 |
| 1440 × 900 | Featured Classes | 1465 → 1008 | 1465 → 1465 |
| 1440 × 900 | Near bottom | 3602 → 3145 | 3602 → 3602 |
| 390 × 844 | Near top | 12 → 12 | 12 → 12 |
| 390 × 844 | Featured Classes | 2206 → 2206 | 2206 → 2206 |
| 390 × 844 | Near bottom | 6732 → 6732 | 6732 → 6732 |
| 360 × 844 | Near top | 12 → 12 | 12 → 12 |
| 360 × 844 | Featured Classes | 2536 → 2536 | 2536 → 2536 |
| 360 × 844 | Near bottom | 7074 → 7074 | 7074 → 7074 |

The original measurements cover X, backdrop, and Escape once at each position/width. Fixed measurements repeat each combination twice: **54 open/close cycles**. Every fixed cycle recorded **0px maximum deviation** in all seven measured dimensions, including scrollX/Y and layout coordinates, throughout the sampled frames. Mobile cycles use the actual navigation-menu Sign In trigger. Original mobile focus ended at BODY; fixed focus ends at the visible navigation toggle.

## Browser regression results

`node tests/landing.browser.mjs --login-interactions` passes at **1440, 390, and 360px**:

- Open, X, intentional backdrop click, Escape, repeated cycles, initial identifier focus, visible opener focus restoration, and Shift+Tab/Tab between identifier and Close dialog.
- Real CDP mouse press/move/release selects actual paragraph text and drags outside without dismissal. Input-to-outside, outside-to-inside, significant backdrop movement, and moving out and back also retain the dialog.
- Labels, identifier/password fields, and show/hide password controls retain the dialog and entered data. Drags/controls trigger no authentication requests or route changes.
- Emulated touch inside-to-outside, outside-to-inside, significant movement, and cancellation retain the dialog; an intentional backdrop tap closes it. Touch drag coordinates avoid the browser's left-edge history gesture.
- Invalid credentials display the existing error and retain the dialog. Held authentication blocks X, Escape, and backdrop dismissal while preserving the password; a failed response releases the guard.
- Successful authentication at all three widths saves the fixture session and navigates to `/student/dashboard`; no explicit landing-header focus restoration occurs on that path.
- Exactly nine synthetic login submissions: invalid, held-then-invalid, and successful once per width. No real credentials, database writes, or live backend authentication were used.
- No browser runtime exceptions or console API errors. Window/document listener inventories match before and after repeated open/close and failed-auth cycles.

The original Landing suite also passes at **1440, 1280, 768, 390, and 360px**, including navigation/content, subject filtering, profile dialogs, FAQ mouse/keyboard/reduced-motion behavior, contact anchors, Back to Top mouse/keyboard, and boundary harness checks. It reports zero API requests and no browser errors.

## Quality checks and artifacts

Commands run from `Capstone2/frontend`:

| Check | Result |
|---|---|
| `npm.cmd run lint` | PASS, exit 0; existing repository warnings remain, including the unchanged `setError(null)` effect pattern in WorkspaceChooser; no warnings in the changed header or browser suite |
| `npm.cmd run typecheck` | PASS, exit 0 |
| `npm.cmd run build` | PASS, exit 0; existing large-chunk advisory remains |
| `node tests/landing.browser.mjs --login-interactions` | PASS, exit 0 |
| `$env:LANDING_QA_OUTPUT='../../tmp/kan104/static/screenshots'; node tests/landing.browser.mjs` | PASS, exit 0 |
| `git diff --check` | PASS |

Baseline reproduction used the original production build and `--login-interactions --login-baseline` before implementation. All KAN-104 logs, measurements, screenshots, and Chrome profiles are in Git-ignored `tmp/kan104/`. Key files are `browser/baseline-results.json`, `browser/login-results.json`, `browser/login-*-dialog.png`, `login-browser.log`, and `static-browser.log`. No generated QA artifacts are documentation or commit inputs. Visual inspection sampled the 360px dialog; styling and content were preserved.

## Remaining limitations and acceptance

- Browser results are headless Chrome with viewport and touch emulation, not physical iOS/Android devices or Firefox/Safari. Mobile software-keyboard and OS gesture behavior still need manual device acceptance if those browsers are supported.
- Authentication tests verify frontend behavior with controlled fixture responses; they do not establish live authentication/backend availability.
- No functional failures remain in the requested automated checks. Changes are unstaged and uncommitted, ready for visual and functional acceptance.

## Initial close-button style B refinement

Continued KAN-104 on the same branch and HEAD, preserving all uncommitted interaction fixes, tests, and this report. No separate task document was created.

- The login dialog now has a small brand header row with the logo on the left and X on the right, aligned on their vertical centers. The title and form remain below; on narrow screens, removing X from the title row lets the title use the available width.
- X uses its own `et-workspace-close` class rather than the shared navigation-toggle styling. This initial version used 40×40px with an 11px radius, light mint `#eaf6ef`, subtle border `#d3e8dd`, and neutral dark icon `#42564c`. Hover used `#f2faf5` with green `#24724d`. These color, radius, and icon-size choices are superseded by the final refinement below. Keyboard focus and pending-auth disabled styling remain supported.
- Styles are limited to the new login header/close classes. Other popup controls and the mobile navigation toggle retain their styling. Sign In retains its existing full-width green gradient and visual priority. No login business logic changed in this refinement.
- Added real input-selection regressions for both the identifier and password fields: press inside the input, drag outside, release, verify an actual selection remains and the dialog stays open. Values are retained and no authentication or navigation is triggered.

### Revalidation after refinement

| Check | Result |
|---|---|
| Lint, typecheck, production build | PASS; existing lint warnings and large-chunk advisory remain |
| Login interaction suite at 1440/390/360px | PASS; all 54 open/close cycles again have 0px maximum deviation across scroll and layout measurements |
| Input-selection drags | PASS for identifier and password at all three widths: six additional selection scenarios |
| Mouse/touch backdrop, Escape, focus restoration, authentication fixtures, listener checks | PASS; nine explicit fixture login requests; no browser errors |
| Existing Landing suite at 1440/1280/768/390/360px | PASS, including profile popups, navigation, anchors, FAQ and Back to Top; zero API requests |
| Visual probe at 1440/390/360px | PASS: measured 40×40px, logo-center alignment delta 0px, aligned to the right content edge, no horizontal overflow; normal/hover/keyboard-focus states captured |
| `git diff --check` | PASS |

Visually inspected the 1440px normal and 360px hover captures: X is recognizable with a light mint surface, while Sign In remains the strongest action. The keyboard-focus capture and computed styles confirm an outline without changing button dimensions. No scrollbar/layout workaround was needed.

Commands remain the same as above, with `LANDING_QA_OUTPUT` directed into `../../tmp/kan104/style-b/browser` for login tests and `../../tmp/kan104/style-b/static/screenshots` for the existing Landing suite. The temporary visual probe is `tmp/kan104/style-b-visual.mjs`; all additional logs, screenshots, profiles, and results remain in ignored `tmp/kan104/style-b*`. The original baseline measurements are preserved. Physical mobile devices and Safari/Firefox remain outside the performed checks.

## Final close-button refinement: white default, mint on hover

Continued on `Duy`, HEAD `c735fa0342f1abbc153956b1d87e4a7377fc84f9`. Preflight read `AGENTS.md` and the latest source, and confirmed the existing four modified KAN-104 source/test files plus this untracked report. All prior uncommitted work was preserved.

This final round changes only `landing.css`, the existing browser suite's viewport coverage, and this report. `WorkspaceChooser.tsx` and `LandingHeader.tsx` retain their earlier uncommitted changes without further edits. No event handlers, modal lifecycle, authentication, navigation, backend, or other popup styles changed.

| State/property | Final design |
|---|---|
| Default | White `#FFFFFF`, icon `#475569`, transparent border; enabled opacity remains 1 |
| Hover | Mint `#EAF8F1`, green icon `#078444` |
| Focus-visible | Green `#078444` 3px outline with 3px offset; remains fully inside the modal's padded space |
| Active | Soft green `#DFF2E7`, icon `#05643C`; no position or scale change |
| Dimensions | 40×40px target; 20×20px outline SVG with CSS stroke width 2px; radius 10px |
| Transition | Existing 180ms color/background/border transition |

The logo-left/close-right header alignment, title below, modal dimensions, padding, typography, form, primary CTA, backdrop color, and blur remain unchanged. Selectors remain scoped to the login close control. Existing disabled behavior while authenticating remains intact.

### Final visual QA

The temporary probe captured default, hover, keyboard-focus, and active screenshots at **1440, 768, 390, and 360px**. Computed styles match the specified default/hover colors, transparent border, opacity 1, 40px target, 20px icon, 2px stroke, and 10px radius. Button-to-logo center alignment deviation is 0px; no horizontal overflow occurs. Focus rings fit inside the modal at all four widths; active state has no transform or size change.

Visual inspection sampled 1440px default, 390px hover, and 360px keyboard focus: the white default blends with the header while the dark X remains clear; mint is shown on interaction, and Sign In remains the strongest action.

Lint, typecheck, and production build passed again. Existing repository lint warnings and the large-chunk advisory remain. Screenshots, visual results, profiles, and quality-check logs are under Git-ignored `tmp/kan104/final-close/`. Existing baseline and previous-round artifacts are preserved. Physical-device/Safari/Firefox verification and live backend authentication remain outside the performed checks.

### Final regression results and Git status

- `node tests/landing.browser.mjs --login-interactions` passed with the suite extended to **1440/768/390/360px**. All **72 open/close cycles** recorded **0px maximum deviation** across scrollX/Y and the measured layout coordinates. X, backdrop click, Escape, focus restoration, repeated cycles, and mobile/tablet navigation triggers pass.
- Paragraph selection and both input-selection drags remain safe: **eight input-selection scenarios** pass across four widths, with credentials retained and no unintended authentication or navigation. Intentional backdrop clicks/taps still dismiss; mouse/touch drags and cancellation do not.
- Invalid/pending authentication, successful session/redirect, and listener checks pass at all four widths. Exactly **12 synthetic login submissions**; no runtime exceptions or console API errors. No real credentials or database changes were used.
- Lint, typecheck, build, targeted browser regression, visual probe, and `git diff --check` all passed. The existing full Landing suite was last run successfully in the previous style B round; this final round reran the targeted login suite and visual probe only.
- Reproduction: from `Capstone2/frontend`, set `LANDING_QA_OUTPUT='../../tmp/kan104/final-close/browser'` and run `node tests/landing.browser.mjs --login-interactions`. Results: `tmp/kan104/final-close/browser/login-results.json` and `browser.log`. Visual screenshots/results: `tmp/kan104/final-close/visual/`.
- Final Git state: branch `Duy`, unchanged HEAD `c735fa0`; four modified files (`WorkspaceChooser.tsx`, `LandingHeader.tsx`, `landing.css`, `landing.browser.mjs`) plus this untracked consolidated report. Nothing staged, committed, pushed, merged, or submitted as a PR. Ready for acceptance before commit.
