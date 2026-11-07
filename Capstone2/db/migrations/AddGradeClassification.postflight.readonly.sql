-- Publication template: fill the approved preflight UUID before use. Leave this guard enabled.
-- READ ONLY: run after the reviewed migration, before reopening application writes.
-- Select localhost:3306/edutrack_db in the client; use UTF-8 (utf8mb4).
-- Expected baseline: preflight on 2026-11-07. Revalidate if deployment is delayed.
-- Stop the deployment if any check fails. This file contains no repair commands.

START TRANSACTION WITH CONSISTENT SNAPSHOT, READ ONLY;

-- 1. Verify the exact server/database before interpreting any following result.
SELECT CASE
    WHEN DATABASE() = 'edutrack_db'
     AND @@port = 3306
     AND @@server_uuid = 'REPLACE_WITH_APPROVED_SERVER_UUID'
    THEN 'PASS' ELSE 'STOP_WRONG_TARGET'
END AS target_check,
DATABASE() AS database_name, @@hostname AS hostname, @@port AS port,
@@server_uuid AS server_uuid, VERSION() AS mysql_version,
@@foreign_key_checks AS foreign_key_checks;

-- 2. Inspect the new objects and original class columns.
SELECT TABLE_NAME, ENGINE, TABLE_COLLATION
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME IN ('classes', 'grades');

SELECT TABLE_NAME, COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT, EXTRA
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND ((TABLE_NAME = 'classes' AND COLUMN_NAME IN ('class_id', 'subject_id', 'tuition_fee', 'grade_id'))
    OR TABLE_NAME = 'grades')
ORDER BY TABLE_NAME, ORDINAL_POSITION;

SHOW CREATE TABLE classes;
SHOW CREATE TABLE grades;

-- 3. Exactly 12 stable Grade IDs/names; no automatic classification of old classes.
SELECT CASE WHEN COUNT(*) = 12 AND MIN(grade_id) = 1 AND MAX(grade_id) = 12
                 AND SUM(grade_name = CONCAT('Khối ', grade_id)) = 12
            THEN 'PASS' ELSE 'FAIL_GRADE_CATALOGUE' END AS catalogue_check,
       COUNT(*) AS grade_count
FROM grades;
SELECT grade_id, grade_name FROM grades ORDER BY grade_id;

SELECT CASE WHEN COUNT(*) = 3 AND SUM(grade_id IS NULL) = 3
            THEN 'PASS' ELSE 'FAIL_LEGACY_CLASS_CLASSIFICATION' END AS legacy_check,
       COUNT(*) AS class_count,
       SUM(grade_id IS NULL) AS unclassified_count,
       SUM(grade_id IS NOT NULL) AS classified_count
FROM classes;

SELECT c.class_id, c.grade_id
FROM classes c LEFT JOIN grades g ON g.grade_id = c.grade_id
WHERE c.grade_id IS NOT NULL AND g.grade_id IS NULL;
-- Expected: no rows.

-- 4. New index and FK; all pre-existing indexes/FKs must also match the preflight audit.
SELECT INDEX_NAME, SEQ_IN_INDEX, COLUMN_NAME, NON_UNIQUE, INDEX_TYPE
FROM information_schema.STATISTICS
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'classes'
  AND INDEX_NAME = 'IX_classes_grade_id';

SELECT k.CONSTRAINT_NAME, k.TABLE_NAME, k.COLUMN_NAME,
       k.REFERENCED_TABLE_SCHEMA, k.REFERENCED_TABLE_NAME, k.REFERENCED_COLUMN_NAME,
       r.UPDATE_RULE, r.DELETE_RULE
FROM information_schema.KEY_COLUMN_USAGE k
JOIN information_schema.REFERENTIAL_CONSTRAINTS r
  ON r.CONSTRAINT_SCHEMA = k.CONSTRAINT_SCHEMA
 AND r.CONSTRAINT_NAME = k.CONSTRAINT_NAME AND r.TABLE_NAME = k.TABLE_NAME
WHERE k.TABLE_SCHEMA = DATABASE() AND k.TABLE_NAME = 'classes'
  AND k.CONSTRAINT_NAME = 'FK_classes_grades_grade_id';
-- Expected: grade_id -> grades.grade_id, DELETE_RULE = RESTRICT.

-- 5. Exactly one new migration-history row, in addition to the original five.
SELECT MigrationId, ProductVersion
FROM __EFMigrationsHistory ORDER BY MigrationId;
SELECT CASE WHEN COUNT(*) = 6
                 AND SUM(MigrationId = '20261107002822_AddGradeClassification') = 1
            THEN 'PASS' ELSE 'FAIL_MIGRATION_HISTORY' END AS history_check
FROM __EFMigrationsHistory;

-- 6. Original business table counts: all must match the preflight baseline.
SELECT table_name, actual_count, expected_count,
       CASE WHEN actual_count = expected_count THEN 'PASS' ELSE 'FAIL_COUNT' END AS count_check
FROM (
    SELECT 'classes' AS table_name, COUNT(*) AS actual_count, 3 AS expected_count FROM classes
    UNION ALL SELECT 'subjects', COUNT(*), 4 FROM subjects
    UNION ALL SELECT 'users', COUNT(*), 11 FROM users
    UNION ALL SELECT 'student_classes', COUNT(*), 5 FROM student_classes
    UNION ALL SELECT 'teacher_classes', COUNT(*), 4 FROM teacher_classes
    UNION ALL SELECT 'ta_classes', COUNT(*), 3 FROM ta_classes
    UNION ALL SELECT 'class_schedules', COUNT(*), 4 FROM class_schedules
    UNION ALL SELECT 'class_sessions', COUNT(*), 5 FROM class_sessions
    UNION ALL SELECT 'tuition_invoices', COUNT(*), 11 FROM tuition_invoices
    UNION ALL SELECT 'payment', COUNT(*), 9 FROM payment
    UNION ALL SELECT 'ai_evaluations', COUNT(*), 2 FROM ai_evaluations
    UNION ALL SELECT 'approval_requests', COUNT(*), 7 FROM approval_requests
    UNION ALL SELECT 'assignments', COUNT(*), 3 FROM assignments
    UNION ALL SELECT 'attendance', COUNT(*), 6 FROM attendance
    UNION ALL SELECT 'center_settings', COUNT(*), 10 FROM center_settings
    UNION ALL SELECT 'content_units', COUNT(*), 5 FROM content_units
    UNION ALL SELECT 'notification_recipients', COUNT(*), 43 FROM notification_recipients
    UNION ALL SELECT 'notifications', COUNT(*), 11 FROM notifications
    UNION ALL SELECT 'parent_students', COUNT(*), 3 FROM parent_students
    UNION ALL SELECT 'progress_notes', COUNT(*), 3 FROM progress_notes
    UNION ALL SELECT 'roles', COUNT(*), 6 FROM roles
    UNION ALL SELECT 'submissions', COUNT(*), 3 FROM submissions
    UNION ALL SELECT 'user_roles', COUNT(*), 11 FROM user_roles
) counts ORDER BY table_name;

-- 7. Inspect original class values and financial totals, then compare full-column
-- SHA-256 fingerprints of all 23 original business tables with preflight evidence.
-- Counts/totals alone are insufficient to establish unchanged data.
SELECT class_id, class_name, subject_id, room, tuition_fee,
       start_date, end_date, status, grade_id
FROM classes ORDER BY class_id;

SELECT COUNT(*) AS invoice_count, COALESCE(SUM(amount_due), 0) AS total_amount_due
FROM tuition_invoices;
SELECT COUNT(*) AS payment_count, COALESCE(SUM(amount), 0) AS total_amount,
       COALESCE(SUM(additional_charge_amount), 0) AS total_additional_charge
FROM payment;

-- 8. Existing critical relationships must have no new orphans.
SELECT 'student_classes -> classes' AS relationship, COUNT(*) AS orphan_count
FROM student_classes sc LEFT JOIN classes c ON c.class_id = sc.class_id
WHERE c.class_id IS NULL
UNION ALL
SELECT 'tuition_invoices -> classes', COUNT(*)
FROM tuition_invoices ti LEFT JOIN classes c ON c.class_id = ti.class_id
WHERE c.class_id IS NULL
UNION ALL
SELECT 'payment -> tuition_invoices', COUNT(*)
FROM payment p LEFT JOIN tuition_invoices ti ON ti.invoice_id = p.invoice_id
WHERE ti.invoice_id IS NULL;

ROLLBACK;
