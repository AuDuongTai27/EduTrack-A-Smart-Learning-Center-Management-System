-- PROPOSAL ONLY. NOT approved for development execution.
-- Preflight (read-only): run separately before any approved maintenance.
SELECT student_id, class_id, period_month, period_year, COUNT(*) AS duplicate_count
FROM tuition_invoices
GROUP BY student_id, class_id, period_month, period_year HAVING COUNT(*) > 1;
-- Do not delete/merge duplicates automatically: they may have Payments or approvals.
-- Review all writers (including learner GET auto-generation) before applying.
-- Proposed DDL only, after explicit approval and a tested full backup:
-- CREATE UNIQUE INDEX UX_tuition_student_class_period
-- ON tuition_invoices(student_id, class_id, period_month, period_year);
-- No EF model/migration is changed by Task04. No DDL is executed by this file.
