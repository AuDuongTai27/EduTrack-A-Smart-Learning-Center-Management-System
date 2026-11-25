# EduTrack — KAN-103: Unified Modal Design System & Add Student

## Scope and preflight

- Scope: the supplied “Unified Modal Design System & Add Student Workflow” brief; KAN-103 confirmed by the user. No existing KAN-103 report was found. This is the single consolidated report for implementation, QA, and subsequent review.
- Date: 2026-11-25, Asia/Bangkok. Branch: `Duy`. Starting HEAD: `38c7224b742fa08f9a50dc0f807b2f0718173c3a`. Starting working tree was clean. Read repository `AGENTS.md` and inspected local source before editing.
- Jira verification limitation: no Jira connection was available. Atlassian was discovered and suggested, but is not installed/connected. Ticket metadata and related Jira issues have **not** been independently read; the implementation follows the supplied brief and confirmed task code.
- Frontend changes only. Backend, database, migrations, authentication, API contracts, and role permissions are unchanged. No staging, commits, pushes, merges, or pull requests.
- Local screenshots, logs, baseline archive, Chrome profiles, and preview scripts are in ignored `tmp/kan103/`. They are not documentation or commit inputs. Existing unrelated documents are preserved.

## Shared presentation

- `ModalSurface.tsx`: retains the existing div structure and attributes; adds a shared surface class, accessible dialog title, close labels, association of adjacent form labels with their controls, initial focus, Tab/Shift+Tab containment, focus restoration, and inert background content. Escape invokes the existing enabled close control, retaining its workflow guards. When a focused loading/retry control disappears, focus stays in the modal.
- `ModalHeader`: action title, optional subtitle, mint icon, and accessible close button. Used by the extracted Add Student form. Existing dialogs retain their business markup and use the same scoped header/body/footer presentation.
- `modal-system.css`: opt-in `.edu-modal`, `.edu-modal-overlay`, and `.edu-modal-native` styling. No unscoped `.modal` overrides. Tokens: primary `#078444`, dark `#05643C`, mint `#EAF8F1`, text `#142238`, muted `#64748B`, border `#DCEBE3`, white surface.
- White headers, mint icon containers, subtle borders, 16px shell radius, consistent inputs/focus styling, soft shadows, moderate backdrop, and right-aligned footer actions. Separate legacy backdrops no longer double-darken migrated dialogs. Success/error/warning/destructive semantics remain distinct; delete buttons stay red and deactivation actions retain their warning styling.
- Size variants: small 430px, standard 580px, large 740px, complex 900px. Confirmation dialogs use small where applicable. Mobile margins and single-column form rows prevent viewport overflow. Scrollable surfaces keep headers and footers sticky where existing structure supports them.
- Native notification compose and schedule detail retain their native dialog lifecycle and use shared visual tokens. Notification compose also uses the standard close control.

## Add Student before and after

| Entry point | Before | After |
|---|---|---|
| CM Dashboard | Separate quick form; `createUser()`; grade/phone controls were not part of the student workflow | Opens shared `AddStudentModal` on the Dashboard; atomic `createStudent()` |
| CM Student Management | Full student workflow embedded in the page | Same shared `AddStudentModal` |
| AD Student Management | Same embedded page implementation | Same shared `AddStudentModal` |

- One student form and submission handler: Full Name, optional Phone/Email, Gender (existing `male` default), optional Grade, and optional Class Enrollment.
- Reuses `useStudentGrades`, `StudentGradeSelect`, `useStudentEnrollment`, and `StudentEnrollmentSection`. Grade catalogue refresh is stable through `useCallback`; existing grade consumers retain their behavior.
- Keeps existing eligible-class filtering, grade-change selection clearing, optional enrollment, attempt identity, atomic create request, conflict detection, and verified “View saved profile” recovery. No class is enrolled automatically. No student `createUser()` shortcut remains in either entry point.
- A synchronous in-flight guard prevents duplicate requests before React renders the disabled state. Closing is blocked during submission. Errors retain entered data and selections; retry uses the same attempt identity. Cancel preserves profile draft fields, matching the prior management behavior; success resets them.
- Success closes the form and shows a success message. Both pages insert only the actual server-returned record and refetch users. Dashboard also refetches classes. Refresh errors are displayed separately from the confirmed creation result. Dashboard KPI and management list refresh are covered by fixtures.
- Parent creation remains a separate parent workflow using `createUser()`; other role business logic was not folded into this component.

## Role suffixes removed

| Previous title | Current title |
|---|---|
| Quick Add Student (Center Manager) | Add Student |
| Add New Student (Center Manager / Admin Staff) | Add Student |
| Add New Parent (Center Manager / Admin Staff) | Add Parent |
| Add New Staff User (Center Manager) | Add Staff User |
| Add New Subject (Center Manager) | Add Subject |
| Create New Request (Teacher / Teaching Assistant) | Create Request |
| Create New Feedback (Student / Parent) | Create Feedback |
| Edit Feedback: request code (Student / Parent) | Edit Feedback: request code |

Role information used for requester/evaluator identity, permissions, account selection, and payloads remains present.

## Inventory across six roles

Source audit found **55 Bootstrap modal surfaces in 37 component/page files**, now using `ModalSurface`, and **two native dialog implementations** using shared visual classes. Counts refer to source templates, not unique runtime instances; shared components appear under multiple roles. All listed source templates were reviewed/migrated; runtime QA sampled the representative groups below rather than every business workflow.

| Role | Reviewed modal groups |
|---|---|
| Center Manager | Dashboard Add Student; student/parent create/edit/detail/status/linking; staff accounts and subject/grade assignments; subjects; grades; class create/edit/status/staff assignment; tuition create/edit/payment/generation; reports; approval processing; schedule configuration/session creation/details; notification compose |
| Admin Staff | Shared student/parent, class, tuition, schedule, and notification groups; Dashboard request details; approval request create/details; feedback processing; teaching monitoring; reports |
| Teacher | Request create/edit/details; assignment rubric/edit/delete; submission grading; material creation; student evaluations; change password; shared schedule details |
| Teaching Assistant | Shared request create/edit; TA request details; submission grading; evaluations; shared change password and schedule details. Existing read-only/role restrictions remain owned by callers |
| Student | Feedback create/edit/detail; tuition payment; notification preferences; shared schedule details. Profile edits are existing inline flows rather than separate modal templates |
| Parent | Shared feedback create/edit/detail, tuition payment, notification preferences; Link Student Profile with code/request modes. Parent/child context and defaults are retained |

### Migrated files and surface counts

Paths below are relative to `Capstone2/frontend/src/GUIs/`.

| File | Surfaces |
|---|---:|
| `components/management/AddStudentModal.tsx` | 1 |
| `components/management/classes/ClassFormModal.tsx` | 1 |
| `components/management/classes/ClassStaffAssignments.tsx` | 2 |
| `components/management/GenerateTuitionModal.tsx` | 1 |
| `components/management/grades/GradeFormModal.tsx` | 1 |
| `components/parent/LinkStudentModal.tsx` | 1 |
| `components/shared/schedule/ScheduleManagement.tsx` | 1 |
| `components/shared/schedule/ScheduleWorkspace.tsx` | 1 |
| `components/student/feedback/EditFeedbackModal.tsx` | 1 |
| `components/student/feedback/FeedbackTable.tsx` | 1 |
| `components/student/feedback/NewFeedbackModal.tsx` | 1 |
| `components/student/notifications/NotificationsPreferencesModal.tsx` | 1 |
| `components/student/tuition/TuitionPaymentModal.tsx` | 1 |
| `components/teacher/ChangePasswordModal.tsx` | 1 |
| `components/teacher/Teacher/assignment/AssignmentOverviewCard.tsx` | 3 |
| `components/teacher/Teacher/assignment/StudentSubmissionsTable.tsx` | 1 |
| `components/teacher/Teacher/classDetails/AssignmentsSection.tsx` | 1 |
| `components/teacher/Teacher/learningProgress/CreateEvaluationModal.tsx` | 1 |
| `components/teacher/Teacher/request/EditRequestModal.tsx` | 1 |
| `components/teacher/Teacher/request/NewRequestModal.tsx` | 1 |
| `components/teacher/Teacher/request/RequestTable.tsx` | 1 |
| `components/teacher/TeachingAssistant/assignment/StudentSubmissionsTable.tsx` | 1 |
| `components/teacher/TeachingAssistant/learningProgress/CreateEvaluationModal.tsx` | 1 |
| `components/teacher/TeachingAssistant/request/RequestTable.tsx` | 1 |
| `pages/admin/AdminStaff/AdminStaffApprovalRequestPage.tsx` | 2 |
| `pages/admin/AdminStaff/AdminStaffDashboardPage.tsx` | 1 |
| `pages/admin/AdminStaff/AdminStaffFeedbackPage.tsx` | 1 |
| `pages/admin/AdminStaff/AdminStaffReportPage.tsx` | 2 |
| `pages/admin/AdminStaff/AdminStaffTeachingMonitoring.tsx` | 1 |
| `pages/admin/CenterManager/CenterManagerApprovalRequestPage.tsx` | 1 |
| `pages/admin/CenterManager/CenterManagerGradePage.tsx` | 1 |
| `pages/admin/CenterManager/CenterManagerReportPage.tsx` | 2 |
| `pages/admin/CenterManager/CenterManagerSubjectPage.tsx` | 4 |
| `pages/admin/CenterManager/CenterManagerUserAccountPage.tsx` | 4 |
| `pages/admin/shared/ClassManagementPage.tsx` | 1 |
| `pages/admin/shared/StudentManagementPage.tsx` | 5 |
| `pages/admin/shared/TuitionManagementPage.tsx` | 3 |

Additional changed files:

- `src/GUIs/components/Common/ModalSurface.tsx`: shared presentation and interaction layer.
- `src/GUIs/components/Common/ModalIcon.tsx`: shared semantic outline SVG family (added during icon refinement below).
- `src/GUIs/components/shared/notifications/ComposeNotificationModal.tsx`: native dialog classes and standard close control.
- `src/GUIs/components/shared/schedule/ScheduleSessionDetail.tsx`: native dialog classes.
- `src/GUIs/hooks/useStudentGrades.ts`: stable refresh callback.
- `src/GUIs/pages/admin/CenterManager/CenterManagerDashboardPage.tsx`: shared student workflow and confirmed-data refresh.
- `src/assets/css/modal-system.css`: shared visual tokens and scoped styles.
- `src/main.tsx`: imports modal styles after brand styles.
- `tests/modalSystem.browser.mjs`: persistent browser regression suite; artifacts remain under `tmp/kan103/`.
- This consolidated report.

## Parent–Student Link

The general “Configure Parent & Student Link” dialog uses the shared shell/header/footer styling with a mint link icon and green Confirm Link action. The cyan header is removed. Student and parent targeted titles, selected parties, existing links, relationship options, default `Mother`, primary-contact checkbox, validation, and APIs remain unchanged. Close is disabled while submitting. The separate Parent Link Student Profile dialog retains both code and request modes and receives the shared presentation.

## Verification

### Browser regression suite

`tests/modalSystem.browser.mjs` serves the production build and intercepts all API requests with controlled fixtures. No development backend or database is contacted. Unexpected API mutations fail the test.

- Three Add Student entry points pass: whitespace name rejection, name-only creation, optional contact/gender fields, native email validation, real Grade IDs, eligible classes, multiple selection, incompatible class rejection, clearing selections on grade change, grade/class API failures and reload, retained form on failure, retry, uncertain-save replay without duplicate creation, conflict recovery, double-submit guard, blocked Escape during submission, success reset, Cancel draft retention, list refresh, and Dashboard KPI refresh.
- Checks dialog accessible title, initial focus, focus retention after async retry controls disappear, Tab/Shift+Tab wrap, Escape, trigger focus return, and restoration of inert background state.
- Add Student is measured and captured at **1920, 1440, 1280, 1024, 768, 390, and 360px**. No horizontal overflow in measured surfaces. Long mobile content scrolls with reachable footer actions.
- Teacher/TA request and Student/Parent feedback dialogs pass desktop (1440px) and mobile (360px) presentation/keyboard smoke checks.
- Parent–student linking preserves `Mother` by default; profile details and deactivation warning were captured at 360px. Deactivation action remains warning-colored.
- Native notification compose passes desktop/mobile styling, initial focus, Escape, and draft retention. Native schedule detail passes desktop/mobile styling, Escape, and focus return to the selected session.
- Successful run: 21 intercepted student POST requests; no real account creation and no browser exceptions. Detailed fixture results are in `tmp/kan103/browser/results.json`.

### Automated checks

| Check | Result |
|---|---|
| Frontend lint (`npm.cmd run lint`) | Exit 0; existing repository warnings remain; new shared components/hook/browser suite have no warnings |
| Typecheck | Pass, including the production build's `tsc -b` |
| Production build (`npm.cmd run build`) | Pass; existing large-bundle warning remains |
| Unit/contract suite | 202 tests: 161 pass, 41 fail on both original HEAD and modified tree; identical failing-test names, no new failures |
| Browser regression suite | Pass with controlled fixtures |
| `git diff --check` | Pass |

The full suite was run with `node --test --test-force-exit --test-timeout=15000 tests/*.test.mjs`: the normal command leaves Vite handles open. An archive of the original HEAD was tested independently under `tmp/kan103/baseline/`; comparison is saved in `tmp/kan103/test-comparison.json`. Existing failures include translated-label expectations and API/schedule/notification/tuition assertions; they were not changed as part of this UI task. PowerShell execution policy requires using `npm.cmd` on this machine.

### Screenshots and local evidence

All paths below are local and ignored; no screenshots/logs are added to `docs/` or commit inputs.

- `tmp/kan103/browser/add-student-{1920,1440,1280,1024,768,390,360}.png`
- `tmp/kan103/browser/{center-manager-dashboard,center-manager-students,admin-staff-students}-desktop.png`
- `tmp/kan103/browser/{center-manager-dashboard,center-manager-students,admin-staff-students}-{error,saving}.png`
- `tmp/kan103/browser/{teacher,teaching-assistant,student,parent}-{1440,360}.png`
- `tmp/kan103/browser/parent-student-link-mobile.png`
- `tmp/kan103/browser/profile-details-360.png` and `deactivate-warning-360.png`
- `tmp/kan103/browser/notification-compose-{1440,360}.png`
- `tmp/kan103/browser/schedule-detail-{1440,360}.png`
- `tmp/kan103/lint-final.log`, `tests-final.log`, `tests-baseline.log`, `test-comparison.json`, and `final-inventory.json`.

Run browser checks from `Capstone2/frontend` after building. `CHROME_PATH` and `CHROME_ARGS_JSON` support local Chrome configuration. On this machine Chrome required `--no-sandbox` and `--disable-software-rasterizer` for headless CDP. Optional `EDUTRACK_ICON_FONT` points to a local cached Bootstrap Icons WOFF2 for offline screenshots; otherwise font requests use the existing CDN.

## Limitations and acceptance

- Existing browser-native `alert()` calls in management/report/teaching flows and `window.confirm()` in Student submission deletion and Teacher class assignment deletion are unchanged. These browser-controlled prompts are **not** covered by the shared visual system. Dropdowns, tooltips, recipient comboboxes, and landing/workspace dialogs are outside the six-role modal migration.
- Complex schedule detail retains its existing inline action/confirmation layout rather than forcing those actions into a new footer. Native dialog behavior is retained. Class-staff assignment, invoice generation, schedule management, and teaching grading keep their existing business layouts while adopting shared surface tokens/classes.
- Source coverage spans the listed 57 custom dialog templates. Runtime checks are representative; they do not certify every role-specific submit, authorization boundary, payment redirect, unlink, approval action, or screen-reader combination. No live database/payment/authorization acceptance testing was performed.
- The 41 pre-existing test failures and unverified Jira issue details remain visible limitations. This report does not claim the entire repository test suite is green or every browser-controlled popup is standardized.
- Work is left unstaged on `Duy` for the user's visual and functional acceptance. No deployment, commit, push, merge, or PR was performed.

## Modal header icon refinement — 2026-11-25

### Preflight and icon standard

This refinement implements the user's follow-up “Standardize Modal Header Icons” brief within KAN-103. Read `AGENTS.md`, inspected the current shared components, CSS, dependencies, assets, and every scoped modal header. Branch remains `Duy`, HEAD remains `38c7224b742fa08f9a50dc0f807b2f0718173c3a`. The 46 existing unstaged KAN-103 files were preserved. The pre-refinement source snapshot is local at `tmp/kan103/icon-refinement/before-source.json`.

The project has no Lucide dependency. Reused the repository's existing inline-SVG approach, with a single code-native outline family rather than adding a dependency or mixing Bootstrap font weights. Modal header icons now use:

| Property | Standard |
|---|---|
| Style | Outline SVG, `fill="none"` |
| Icon viewport | 20 × 20px |
| Stroke | 2px, round caps/joins, non-scaling stroke |
| Color | `#078444` |
| Container | 36 × 36px; does not shrink with long titles |
| Container surface/radius | `#EAF8F1`, 10px |
| Title gap | 12px |

`ModalIcon.tsx` owns semantic vector geometry. `ModalHeader` takes a typed semantic icon name. Shared CSS tokens own size, container, color, gap, and subtitle alignment. All 57 header templates use the same component, including the 56 headers previously using font icons or CSS fallback glyphs. There are no Bootstrap font icons or pseudo-element glyphs left in these headers; body and page icons are unchanged.

### Updated icons and headers

| Header group | Outline icon |
|---|---|
| Add Student | Graduation cap |
| Add/Edit/Detail Subject | Notebook / pencil for editing |
| Add Parent; assign Teacher/TA | Users |
| Parent–Student Link; Parent Link Student Profile | Chain link |
| Unassign Teacher/TA | Unlink |
| Edit profile, staff account, request, invoice, assignment; student evaluation | Pencil |
| Create/Edit Class; assigned-class details | Open book |
| Add/Edit Grade | Layers |
| Schedule configuration, session creation, native session detail | Calendar |
| Tuition payment, generation, invoice details, cash payment | Receipt |
| Notification compose/preferences | Bell |
| Student/Parent feedback create/edit/detail; staff feedback review | Message square |
| Request creation/details; study-material creation | Document |
| Approval review | Circle check |
| Account/subject/class/grade deactivation and activation | Lock / unlock, preserving the existing conditional state |
| Profile details; staff creation | User |
| Change password | Shield |
| Grade submission | Award |
| AI grading rubric | Sparkles |
| Delete assignment | Alert triangle |
| Export reports | Download |

This covers the **37 component/page files in the migrated-files table above**, plus `Common/ModalSurface.tsx` and both native dialog files (`ComposeNotificationModal.tsx`, `ScheduleSessionDetail.tsx`): 40 existing TSX files changed only in their header presentation/imports. Additional files in this refinement are the new `Common/ModalIcon.tsx`, `assets/css/modal-system.css`, the existing `tests/modalSystem.browser.mjs`, and this existing report. There is no new report or package dependency.

### Close button consistency

All scoped modal headers now use the same neutral `#64748B` 20px outline X with a 2px stroke and a 36 × 36px hit area. Normal state has no border, ring, or shadow. Hover adds the shared mint surface; keyboard focus has a consistent visible green outline. Disabled close controls remain visibly disabled. Existing accessible names, click handlers, Escape behavior, focus restoration, and submission guards are unchanged.

### Visual QA and regression

- Captured 20 **before** screenshots and 20 matching **after** screenshots for 10 representative popups, each at **1440px and 390px**: CM Add Student, Add Subject, Add Parent, Parent–Student Link, CM profile details, AD Add Student, Teacher request, TA request, Student feedback, and Parent feedback.
- Additional mobile long-name link-header capture verifies that the icon container stays 36px and the vector stays 20px when the title wraps. Shared Close normal/hover/focus geometry is checked during visual QA.
- Browser assertions measure one outline SVG per header, absence of mixed font icons, 36px container, 20px vector, 2px stroke, correct mint/green colors, 10px container radius, 36px Close hit area, and no Close border/shadow. Screenshot review includes Add Student versus Add Subject, subtitle alignment, wrapped titles, and six-role desktop/mobile layouts.
- The existing persistent browser suite now also asserts the shared icon/Close contract. All three Add Student workflows, validation, enrollment failures/retry, conflict recovery, double-submit protection, loading guards, keyboard handling, and native notification/schedule dialogs pass. The 21 student POSTs are intercepted fixtures; visual comparison itself performs zero API writes.
- A TypeScript AST comparison against the pre-refinement snapshot confirms that all code outside the header icon presentation is unchanged in the 40 existing TSX files. Every existing header button's attributes, callbacks, and disabled guards are retained. This includes the entire focus/interaction implementation of `ModalSurface`.
- Lint: exit 0 with existing repository warnings; no warnings in the shared icon or updated browser test. Typecheck and production build: pass; the existing large-bundle warning remains. `git diff --check`: pass.
- Full unit/contract suite: **202 tests, 161 pass, 41 fail**, with the same failing-test names as the pre-refinement baseline. No new unit failures; the full suite is not green.

Local comparison artifacts remain ignored:

| Evidence | Path under `tmp/kan103/icon-refinement/` |
|---|---|
| Side-by-side gallery for all 10 groups | `comparison.html` |
| Add Student before/after | `before/center-manager-add-student-{1440,390}.png`, `after/center-manager-add-student-{1440,390}.png` |
| Add Subject before/after | `before/add-subject-{1440,390}.png`, `after/add-subject-{1440,390}.png` |
| Other six-role comparisons | `before/` and `after/` with matching filenames |
| Long mobile title | `after/long-link-title-390.png` |
| Header inventory and semantic mappings | `before-inventory.json`, `after-inventory.json`, `icon-changes.json` |
| Presentation-only scope check | `presentation-only-check.json` |
| Visual measurements | `after/results.json` |
| Checks | `lint.log`, `typecheck.log`, `build.log`, `regression-browser.log`, `unit-tests.log`, `test-comparison.json` |

Known limitations from the original delivery remain: browser-native alerts/confirmations are outside the custom icon system; runtime business QA is representative; 41 baseline unit failures remain. The icon refinement does not change form fields, API calls, validation, submission logic, permissions, authentication, navigation, modal widths, footer structure, or backend/database/migrations. All work remains unstaged for acceptance; no commit, push, merge, or PR was made.

## Modal header subtitle cleanup — 2026-11-25

### Scope and reviewed decisions

Read the follow-up brief and `AGENTS.md`; checked branch, HEAD, and the 47 existing unstaged KAN-103 files before editing. Branch remains `Duy`, HEAD remains `38c7224b742fa08f9a50dc0f807b2f0718173c3a`. Existing work was preserved. Reviewed all 57 scoped header templates, the shared `ModalHeader` definition/call site, paragraphs, small text, spans, category badges, context codes, and native dialog headers. No blanket CSS hiding is used.

The default remains **Outline Icon + Title + Close** with the approved mint styling. Each description was classified by meaning:

| Header | Decision | Content |
|---|---|---|
| Add Student (all three entry points) | Remove | `Create a student profile and optionally enroll in classes.` repeats the form's purpose. Existing optional-enrollment guidance remains next to Class Enrollment. |
| Parent Link Student Profile | Remove | `Choose the most convenient connection method for you` repeats the existing code/request tabs. |
| Notification Preferences | Remove | `Customize the types of notifications you want to receive on the system` repeats the title and preference controls. |
| Add Study Material | Remove | `Attach lecture slides or reference materials` repeats the material fields and file-type choices. |
| Recurring schedule management | Remove redundant category badge | `Schedule Configuration` duplicates `Manage Recurring Schedule & Monthly Generation`; the title, icon, and body remain. |
| Send Notification | Move to Body | `Draft is saved when closed, until sent or account is switched.` remains above the content fields. Its `ntf-compose-hint` ID and the dialog's `aria-describedby` relationship are retained. |
| VNPay Online Tuition Payment | Move to Body | `{period} · Student {studentName}` remains immediately above invoice selection and the amount summary. No payment identity or term information is lost. |
| Profile/request/invoice/subject details, targeted linking | Retain necessary context | Account codes, request codes, invoice codes, selected-user names, and targeted-link titles still identify the record being edited or reviewed. |
| Schedule/payment/destructive workflows | Retain body information | Attendance/completion restrictions, reschedule/delete warnings, full-payment amount, invoice choices, payment gateway instructions, destructive consequences, and loading/error messages remain unchanged. |

Add Subject, Add Parent, Add/Edit Grade, Edit Profile, create/edit class, Teacher/TA requests, and Student/Parent feedback already had no redundant explanatory subtitle and keep their existing headings and fields.

### Shared implementation and changed files

- `ModalHeader` keeps its optional `subtitle` API and conditional rendering. It does not reserve space when no subtitle is supplied; the Add Student call site stops passing the redundant text. The shared component's focus/keyboard/close behavior is byte-for-byte unchanged in this refinement.
- `modal-system.css` adds vertical centering to the existing common header rule. Existing padding, separators, icons, close buttons, shell widths, footer structure, and responsive rules remain. There is no fixed short header height and no `display: none` rule for descriptions.
- Short Add Student headers measure 77px at 1440/768px and 69px at 390px, including the separator. Measurements confirm no empty subtitle row remains. Long titles still wrap naturally without shrinking the icon.
- Seven existing TSX files change only the reviewed text removal/relocation: `AddStudentModal.tsx`, `parent/LinkStudentModal.tsx`, `shared/notifications/ComposeNotificationModal.tsx`, `shared/schedule/ScheduleManagement.tsx`, `student/notifications/NotificationsPreferencesModal.tsx`, `student/tuition/TuitionPaymentModal.tsx`, and `teacher/Teacher/classDetails/AssignmentsSection.tsx` (under `src/GUIs/components/`).
- Additional changed files for this refinement: `src/assets/css/modal-system.css`, the existing `tests/modalSystem.browser.mjs`, and this same consolidated report. No new production file, report, dependency, or backend change.

### Visual and functional verification

- Compared before/after at **1440, 768, and 390px**: Add Student, Add Subject, Add Parent, Parent–Student Link, CM profile details, AD Add Student, Teacher/TA request, Student/Parent feedback, and notification compose.
- Additional isolated fixtures render the **actual production components** for Parent Link Student Profile, payment, preferences, Add Study Material, create/edit class, and schedule detail with its completed/attendance warning. These cover otherwise difficult-to-reach states without changing routes, permissions, APIs, or business logic. They are local QA artifacts, not product pages.
- Captured 54 before screenshots and 55 after screenshots (including an additional long-title mobile case). Inspected compact headers, subtitle removal, preserved payment/draft context, wrapped titles, icon dimensions, close-button alignment, and viewport fit. No measured modal horizontal overflow.
- The persistent KAN-103 browser suite now asserts that Add Student's redundant text is absent rather than moved to Body, and that notification draft guidance is visible in Body while its accessibility relationship remains valid. Existing field/validation, enrollment, error/retry, conflict recovery, double-submit, disabled-close, Cancel, Escape, focus restoration, and notification draft-retention checks pass.
- The component fixtures verify that payment term/name and the full amount remain visible, and that the schedule restriction still appears. No payment submission or live backend mutation was performed.
- Source comparison against the pre-refinement snapshot confirms that the seven TSX changes consist solely of the reviewed descriptions/category badge. Fields, bindings, validation, handlers, callbacks, loading logic, guards, and the shared optional subtitle API are unchanged. The only shared CSS change is header vertical alignment.
- Lint, typecheck, production build, targeted browser tests, and `git diff --check`: pass. Existing lint warnings and the build's large-bundle warning remain.
- Unit/contract suite: **202 tests, 161 pass, the same 41 baseline failures**; no new failing-test names. This does not represent a fully passing repository suite.

### Local evidence and acceptance

All new QA artifacts stay under ignored `tmp/kan103/subtitle-cleanup/`:

| Evidence | Local path |
|---|---|
| Before/after gallery for all viewports | `comparison.html` |
| Add Student before/after | `before/center-manager-add-student-{1440,768,390}.png`, `after/center-manager-add-student-{1440,768,390}.png` |
| Six-role and notification comparisons | Matching filenames in `before/` and `after/` |
| Payment, preferences, parent linking, material, class forms, schedule warning | Matching filenames in `harness-before/` and `harness-after/` |
| Inventory/source preservation | `before-inventory.json`, `before-source.json`, `presentation-only-check.json` |
| Header dimensions and fixture results | `after/results.json`, `harness-after/results.json` |
| Validation logs | `lint.log`, `typecheck.log`, `build.log`, `browser-regression.log`, `unit-tests.log`, `test-comparison.json` |

Known limitations remain unchanged: browser-native alerts/confirmations are outside the custom modal system; live payment/database/authorization testing was not performed; the 41 baseline failures remain. Runtime QA is representative rather than a certification of every role-specific operation. Work remains unstaged on `Duy`; no stage, commit, push, merge, deployment, or PR was performed. Awaiting user acceptance of KAN-103.
