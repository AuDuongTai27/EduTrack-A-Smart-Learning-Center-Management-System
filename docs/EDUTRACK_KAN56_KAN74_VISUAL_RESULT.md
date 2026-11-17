# EduTrack — KAN-56 / KAN-74 Visual Result

Updated: 2026-11-17. Branch: `Duy`.

## Baseline and final scope

Brand checkpoint: `6d7e538` — `All Roles - Standardize EduTrack color theme and logo`. Shared green tokens and the tree/cap/book logo remain intact. This enhancement covers Student Dashboard/Classes, Parent Dashboard (linked/unlinked), and Student/Parent sidebar decoration. Landing and other roles are unchanged.

Palette: primary #078444, hover #067647, active #05643C, mint #EAF8F1, surface #F7FAF8, white #FFFFFF, heading #142238, border #DCEBE3. Existing semantic status colors remain distinct.

## Presentation delivered

- Student: restrained mint background/waves, green welcome banner with books/cap illustration, white KPI cards, and subject class-card art. Classes uses lighter decoration.
- Parent: green linked/unlinked banners. Linked hero uses the supplied transparent PNG directly, contained at the right/bottom without a separate background, border, or shadow. Existing CTA links, content, linking instructions, and conditional rendering remain intact.
- Parent background waves follow content height and fade at their edges. Existing class grid and five-column behavior at sufficient width are retained.
- Both sidebars reuse the school SVG. Decoration extends through nav padding to both edges; mint backing and gradient masks blend into the white sidebar/footer. It uses available free space without reserving height and hides below desktop width or at heights <=740px. Menu, selector, and footer geometry/handlers remain intact.
- Shared subject art supports Mathematics, Physics, Chemistry, Biology, English, Literature, Informatics, and fallback open book. Exact normalized English/Vietnamese aliases recognize Math, Mathematics, and Toán. Recognized optional codes take precedence; unknown/null/malformed values fall back safely. No class-title guessing or seed-ID assumptions.
- Parent uses official subject name, falling back to the existing badge only when absent/blank. Student uses the subject badge already exposed to its card. Existing upstream default labels cannot distinguish missing raw Subject; DAL is unchanged.
- Decorative images have empty alt/aria-hidden, intrinsic dimensions, and no pointer interaction. Mobile prioritizes content/actions; reduced motion disables added hover movement.

## Files in this enhancement

Paths relative to `Capstone2/frontend/`:

- `src/GUIs/components/parent/ParentEmptyState.tsx`
- `src/GUIs/components/student/common/ClassItem.tsx`
- `src/GUIs/layouts/parent/ParentLayout.tsx`
- `src/GUIs/layouts/parent/ParentSidebar.tsx`
- `src/GUIs/layouts/student/StudentSidebar.tsx`
- `src/GUIs/pages/parent/ParentDashboardPage.tsx`
- `src/GUIs/pages/student/StudentClassesPage.tsx`
- `src/GUIs/pages/student/StudentDashboardPage.tsx`
- `src/GUIs/components/Common/SubjectIllustration.tsx`
- `src/GUIs/components/Common/subjectIllustrationMapping.ts`
- `src/assets/css/parent-academy.css`
- `src/assets/css/student-academy.css`
- `src/assets/css/student-sidebar-academy.css`
- `src/assets/css/subject-illustrations.css`
- `src/assets/illustrations/academy-banner-waves.svg`
- `src/assets/illustrations/academy-books-cap.svg`
- `src/assets/illustrations/academy-page-waves.svg`
- `src/assets/illustrations/academy-school.svg`
- `src/assets/illustrations/academy-study-lineart.svg`
- `src/assets/illustrations/edutrack-parent-hero-transparent.png`
- `src/assets/illustrations/subjects/`: mathematics.svg, physics.svg, chemistry.svg, biology.svg, english.svg, literature.svg, informatics.svg, default-subject.svg.
- `tests/subjectIllustration.test.mjs`

Repository documentation: `docs/EDUTRACK_KAN56_KAN74_VISUAL_RESULT.md` (this file).

## Verification and limitations

| Check | Final result |
| --- | --- |
| `npm.cmd run lint` | Exit 0; existing warnings remain, including vendor JS and TuitionPaymentModal |
| `npm.cmd run typecheck` | Exit 0 |
| `npm.cmd run build` | Exit 0; bundle-size warning remains |
| Subject mapping/vector tests | 5 passed |
| All 23 unit-test files, individually supervised with 20s timeout per file | Matches recorded baseline exactly: 10 passing files, 12 failing files, 1 timeout (notificationInbox.test.mjs); completed tests: 112 pass / 34 fail |
| Working/staged diff whitespace checks | Checked before commit |

**Complete unit suite is not PASS.** Existing failures include stale expected language/messages and Notifications behavior. No business module or test expectations were changed to force a pass. Each file's exit/timeout/pass/fail counts match baseline.

Browser checks from implementation used isolated component/layout specimens and test-only fixtures, not authenticated application sessions. Coverage included linked/unlinked Parent, Student classes/cards, subject aliases/fallback, widths 1440/1280/768/390/360, and short-height sidebars. Final sidebar comparison covered 20 role/viewport combinations with unchanged menu/footer/selector geometry and scroll bounds. No business data was written.

**Authenticated dashboards, real-data interactions, login/logout, Parent mobile integration, and end-to-end regression remain unverified.** Specimen screenshots do not establish these as passing. Actual Parent Math data was not inspected through an authenticated session; aliases were verified with fixtures/unit tests.

## Safety and cleanup

Source diff contains presentation, SVG/PNG assets, pure subject-to-art mapping, and its tests. No backend, API/DAL/BLL, database/migration/seed, auth/permissions, routing, business hooks/state, validation, calculations, linking, filters/sorting/pagination, or business handlers were modified.

At the user's request, generated docs/kan56-* QA folders and per-round visual reports were removed. Temporary specimen/browser scripts depending on those folders and two unused superseded Parent assets were also removed. Screenshots, logs, caches, and build output are excluded from the commit. This is the single consolidated report for this visual work; unrelated project documentation remains intact.

This commit is a visual checkpoint, not full authenticated acceptance. No push, merge, PR, or Jira status update.
