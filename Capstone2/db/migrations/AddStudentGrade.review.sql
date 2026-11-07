-- REVIEW ONLY: production database execution has NOT been approved.
-- Apply only after the reviewed read-only preflight, verified backup and explicit approval.
-- MySQL DDL implicitly commits; START TRANSACTION does not provide DDL rollback.
START TRANSACTION;

ALTER TABLE `users` ADD `grade_id` int NULL;

CREATE INDEX `IX_users_grade_id` ON `users` (`grade_id`);

ALTER TABLE `users` ADD CONSTRAINT `FK_users_grades_grade_id` FOREIGN KEY (`grade_id`) REFERENCES `grades` (`grade_id`) ON DELETE RESTRICT;

INSERT INTO `__EFMigrationsHistory` (`MigrationId`, `ProductVersion`)
VALUES ('20261107061101_AddStudentGrade', '8.0.8');

COMMIT;
