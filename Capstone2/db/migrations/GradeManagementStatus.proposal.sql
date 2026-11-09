-- PROPOSAL ONLY. NOT an applied EF migration. Do not execute without approval.
-- Current Grade Management intentionally works with the existing two-column table.
-- Future activation/deactivation requires corresponding API/model/UI changes first.
-- Preflight: verify target, backup, schema/history and duplicate names under the actual collation.

ALTER TABLE `grades`
    ADD `status` varchar(20) NOT NULL DEFAULT 'active';

-- Optional database-level protection after duplicate-name preflight/normalization:
-- CREATE UNIQUE INDEX `UX_grades_grade_name` ON `grades` (`grade_name`);

-- Expected effect: current grades become active, all IDs and Class FKs remain intact.
-- Historical classes must remain visible for inactive grades. New class selections would
-- use active grades; editing a class may retain its current inactive grade.
-- No UPDATE/DELETE of classes, students, invoices or payments is part of this proposal.
