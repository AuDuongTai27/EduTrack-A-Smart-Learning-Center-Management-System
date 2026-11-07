-- READ ONLY. Review the output; this script never applies a migration.
-- Run again inside the approved maintenance window before any DDL.
-- Expected target: the explicitly approved local/application schema, not a guessed host.
SET SESSION TRANSACTION READ ONLY;
START TRANSACTION READ ONLY;

SELECT DATABASE() AS database_name, @@hostname AS server_hostname, @@port AS server_port,
       @@server_uuid AS server_uuid, VERSION() AS mysql_version;

SELECT MigrationId, ProductVersion FROM __EFMigrationsHistory ORDER BY MigrationId;
SELECT CASE WHEN COUNT(*) = 6
  AND SUM(MigrationId IN (
    '20261012134022_InitialCreate',
    '20261019061116_AddTitleAndDescriptionToApprovalRequests',
    '20261101011722_AddPaymentAdditionalCharges',
    '20261102032813_AddNotificationRecipientsAndSender',
    '20261102045221_AddNotificationRecipientDeletedAt',
    '20261107002822_AddGradeClassification')) = 6
  THEN 'PASS: exact reviewed migration baseline'
  ELSE 'BLOCK: migration history differs; review before applying anything' END AS migration_baseline
FROM __EFMigrationsHistory;

SELECT TABLE_NAME, ENGINE FROM information_schema.TABLES
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME IN ('users', 'grades');
SELECT CASE WHEN COUNT(*) = 2 THEN 'PASS: required InnoDB tables exist'
  ELSE 'BLOCK: required tables/engines differ' END AS engine_compatibility
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME IN ('users', 'grades') AND ENGINE = 'InnoDB';
SELECT TABLE_NAME, COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_KEY
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND ((TABLE_NAME = 'users' AND COLUMN_NAME IN ('user_id', 'grade_id', 'specialty'))
    OR (TABLE_NAME = 'grades' AND COLUMN_NAME = 'grade_id'));

SELECT CASE WHEN COUNT(*) = 2 THEN 'PASS: signed INT primary keys'
  ELSE 'BLOCK: unexpected User/Grade key type' END AS key_compatibility
FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE()
  AND COLUMN_TYPE = 'int' AND COLUMN_KEY = 'PRI' AND IS_NULLABLE = 'NO'
  AND ((TABLE_NAME = 'users' AND COLUMN_NAME = 'user_id')
    OR (TABLE_NAME = 'grades' AND COLUMN_NAME = 'grade_id'));

SELECT CASE WHEN COUNT(*) = 0 THEN 'PASS: users.grade_id is absent'
  ELSE 'BLOCK: Grade column already exists; do not rerun DDL' END AS column_guard
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'grade_id';
SELECT CASE WHEN COUNT(*) = 0 THEN 'PASS: Grade index name is available'
  ELSE 'BLOCK: Grade index already exists' END AS index_guard
FROM information_schema.STATISTICS
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND INDEX_NAME = 'IX_users_grade_id';
SELECT CASE WHEN COUNT(*) = 0 THEN 'PASS: Grade FK name is available'
  ELSE 'BLOCK: Grade FK already exists' END AS foreign_key_guard
FROM information_schema.TABLE_CONSTRAINTS
WHERE CONSTRAINT_SCHEMA = DATABASE() AND CONSTRAINT_NAME = 'FK_users_grades_grade_id';

-- Counts describe this snapshot only. They are not proof of an application write freeze.
SELECT 'users' AS table_name, COUNT(*) AS row_count FROM users
UNION ALL SELECT 'grades', COUNT(*) FROM grades
UNION ALL SELECT 'student_classes', COUNT(*) FROM student_classes
UNION ALL SELECT 'tuition_invoices', COUNT(*) FROM tuition_invoices
UNION ALL SELECT 'payment', COUNT(*) FROM payment;
ROLLBACK;
