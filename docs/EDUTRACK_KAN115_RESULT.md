# EduTrack — KAN-115: Clean Up Reports & Analytics Actions

## Scope and preflight

- Date: 2026-11-26 (Asia/Bangkok). Applies to Center Manager and Admin Staff Reports & Analytics.
- Read repository `AGENTS.md`; no existing KAN-115 document was found. This is the single consolidated result report.
- Branch: `Duy`. Starting HEAD: `4132b43a29d03508e5f352f7e787e9ae5d99635e`. Working tree was clean. HEAD equals the locally recorded `origin/main`; no remote fetch was performed, so remote freshness is not independently verified. Local `main` is older and was not checked out or merged.
- Worked on the current local code. No staging, commits, pushes, merges, or pull requests. No teammate changes were overwritten.

## Files changed

| File | Change |
|---|---|
| `Capstone2/frontend/src/GUIs/pages/admin/CenterManager/CenterManagerReportPage.tsx` | Remove Reset/PDF/decorative checkbox; balance filters; simplify Excel confirmation and success/error handling |
| `Capstone2/frontend/src/GUIs/pages/admin/AdminStaff/AdminStaffReportPage.tsx` | Same cleanup for Admin Staff |
| `docs/EDUTRACK_KAN115_RESULT.md` | Consolidated implementation, verification, and remaining findings |

Reviewed without modification: `src/DAL/tuitionDAL.ts`, `src/api/tuitionApi.ts`, backend `Controllers/Management/ReportsController.cs`, report export service/interface, shared modal components/styles, report data hook, and pagination.

## UI before and after

| Area | Before | After |
|---|---|---|
| Filter bar | Five cells including Reset and its blank placeholder label; uneven desktop widths | Four equal fields: search, Report Type, Class, Status; four columns at 1440px, two at 768px, one at 390px |
| Header actions | Export Excel and Export PDF | Export Excel only |
| Confirmation | Excel/PDF format state; Center Manager role suffix in title | Fixed `Export Report Data (Excel)` title for both roles; fixed EXCEL format; `Confirm Download` action |
| Analytics option | Uncontrolled, default-checked checkbox with no effect | Removed after tracing markup, handler, DAL, API, controller, and service |
| Export feedback | PDF closed the modal and falsely claimed success | Success only after awaited Excel download initiation; wording says download started; failed attempts clear any previous success message and show an error |

The checkbox had no `onChange`, state, ref, DOM read, or export request parameter. Both labels used the uncontrolled `includeCharts` input. The backend creates summary rows unconditionally; removing the checkbox does not remove financial summary data.

KAN-103 remains in use through the unchanged `ModalSurface`, outline download `ModalIcon`, Clean Mint styling, focus handling, and responsive modal shell. No shared modal code or global CSS was changed.

## Preserved Excel flow

1. Export Excel opens the existing confirmation modal.
2. Confirm Download sets the loading state and disables confirmation.
3. The handler awaits `tuitionDAL.downloadTuitionExcelReport()` with existing class, status, search, and role values.
4. `tuitionApi.exportTuitionExcel()` calls `GET /api/reports/tuition/export`; `All` class/status values are omitted from query parameters as before. Non-success HTTP responses throw.
5. The DAL receives the response blob, creates an object URL, clicks a download link with the existing `Bao_Cao_Hoc_Phi_EduTrack_YYYYMMDD.xlsx` filename, removes the link, and revokes the URL.
6. After that call resolves, the page closes confirmation and announces `Excel report download started successfully.` This does not claim that the browser finished saving the file.
7. On failure, the existing alert error mechanism is retained, confirmation remains available for retry, and no success is shown. The loading state resets in `finally`.

No endpoint, API contract, backend, authorization, payment calculation, data-fetch hook, KPI calculation, detail workflow, or pagination logic changed. Search/class/status still reset pagination to page 1, and All Classes / All Statuses remain selectable. Report Type retains its existing behavior.

## Validation

Commands run from `Capstone2/frontend` unless noted otherwise. Logs, scripts, baseline source, downloads, screenshots, and JSON results are under Git-ignored `tmp/kan115/`; none belong in commits.

| Check | Result |
|---|---|
| `npm.cmd run lint` | PASS, exit 0; existing repository warnings remain; no warnings for either changed report page |
| `npm.cmd run typecheck` | PASS, exit 0 |
| `npm.cmd run build` | PASS, exit 0 |
| Relevant existing tuition tests | 36 tests: 34 pass, 2 fail; identical failing tests reproduced from original HEAD |
| Report/export browser checks | PASS for both roles with intercepted fixtures |
| Responsive checks | PASS at 1440×1000, 768×1000, 390×1000 for both pages and Excel modals |
| `git diff --check` | PASS |
| Live backend workbook export | NOT VERIFIED; no development backend listening on configured port 5036 |

Existing test command:

```text
node --test --test-force-exit --test-timeout=15000 tests/tuitionMetrics.test.mjs tests/tuitionActions.test.mjs tests/tuitionGeneration.test.mjs tests/tuitionPolicy.test.mjs
```

The same command ran against a copy of original HEAD under `tmp/kan115/baseline/Capstone2/frontend`. Both failures are pre-existing translated-text expectations in `tuitionMetrics.test.mjs`:

- `Vietnam month boundaries are independent of UTC and browser timezone`: expects `Tháng 11/2026`, actual `Month 11/2026`.
- `an invalid paidAt cannot be silently omitted from monthly cash`: expects a Vietnamese error substring, actual error text is English.

Browser command: `node ../../tmp/kan115/reports.browser.mjs`. The local production-build harness intercepts all API requests and rejects API mutations. It verifies:

- No Reset or Export PDF buttons; exactly four equal-width filter cells with the expected 4/2/1 layout.
- No document-level or modal horizontal overflow. The existing wide data table retains its internal horizontal scrolling on smaller screens.
- Excel-only accessible title, no checkbox, outline SVG icon and mint icon background, modal open/cancel, and responsive layout.
- Next-page navigation; page reset after class, status, and search changes; intersected filters; selecting All Classes / All Statuses again.
- Invoice detail still opens; Report Type changes the title while retaining tuition rows.
- Real frontend DAL/API code receives the expected export endpoint and class/status/search/role parameters.
- Held response shows disabled confirmation and no premature success. Successful fixture responses produce browser-completed `.xlsx` downloads whose bytes match the fixture, close the modal, and show success. HTTP 503 after success clears stale success, shows an error, retains the modal, and permits retry.
- Two fixture downloads, four export requests (one success and one failure per role), and no runtime exceptions.

Artifacts: `tmp/kan115/browser/results.json`, `tmp/kan115/browser/*-page.png`, `tmp/kan115/browser/*-modal.png`, `tmp/kan115/browser/downloads/`, and `tmp/kan115/*.log`. Visual inspection sampled the desktop page and mobile confirmation. External Bootstrap icon fonts were blocked in the isolated harness, so some legacy glyphs appear as placeholders in screenshots; the shared outline SVG modal icon renders correctly.

**The downloaded payload is an explicit synthetic fixture, not a valid backend-generated workbook. These tests verify frontend download plumbing, not live export or workbook contents.** Live acceptance still needs a development/test backend: download Excel for both roles, open the resulting workbook, and compare its filtered data and summary.

## Remaining findings outside KAN-115

- Report Type currently changes the displayed report heading/confirmation label only. All choices continue to use tuition invoices, tuition metrics, and the tuition Excel endpoint. Student/Revenue/Class/Teaching datasets were not implemented. Consequently, selecting Revenue Report still exports tuition; this pre-existing behavior remains a separate finding.
- The two existing tests need their translated-text expectations reviewed separately; no financial logic was changed to make them pass.
- Live workbook generation and contents require the development/test environment noted above. No live export PASS is claimed.

Implementation is ready for KAN-115 acceptance; changes remain unstaged and uncommitted.
