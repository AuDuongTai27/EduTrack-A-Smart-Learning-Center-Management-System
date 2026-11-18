# Repository conventions

## KAN documentation

- Keep exactly one consolidated documentation file per KAN task in `docs/`.
- Find and update the existing task document before creating a new one. Do not create separate documents for each round, audit, visual refinement, or QA run of the same KAN.
- A document already shared by related KAN tasks may remain their single consolidated document; preserve relevant information for each task.
- Keep generated screenshots, logs, preview scripts, and other local QA artifacts outside `docs/` and out of commits unless the user explicitly requests them.
- Ask for the Jira KAN code before creating task documentation if none was provided; never invent a KAN code.
- Multiple KAN tasks implemented together may share one consolidated report. Update that report for subsequent implementation, QA, and review rounds; do not create separate reports for those phases.
- Do not remove unrelated older documents. Keep local QA screenshots, logs, and temporary scripts in `tmp/` and exclude them from commits.
