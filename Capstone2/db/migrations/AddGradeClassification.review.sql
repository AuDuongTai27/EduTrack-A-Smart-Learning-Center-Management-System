START TRANSACTION;

ALTER TABLE `classes` ADD `grade_id` int NULL;

CREATE TABLE `grades` (
    `grade_id` int NOT NULL,
    `grade_name` varchar(50) CHARACTER SET utf8mb4 NOT NULL,
    CONSTRAINT `PK_grades` PRIMARY KEY (`grade_id`)
) CHARACTER SET=utf8mb4;

INSERT INTO `grades` (`grade_id`, `grade_name`)
VALUES (1, 'Khối 1'),
(2, 'Khối 2'),
(3, 'Khối 3'),
(4, 'Khối 4'),
(5, 'Khối 5'),
(6, 'Khối 6'),
(7, 'Khối 7'),
(8, 'Khối 8'),
(9, 'Khối 9'),
(10, 'Khối 10'),
(11, 'Khối 11'),
(12, 'Khối 12');

CREATE INDEX `IX_classes_grade_id` ON `classes` (`grade_id`);

ALTER TABLE `classes` ADD CONSTRAINT `FK_classes_grades_grade_id` FOREIGN KEY (`grade_id`) REFERENCES `grades` (`grade_id`) ON DELETE RESTRICT;

INSERT INTO `__EFMigrationsHistory` (`MigrationId`, `ProductVersion`)
VALUES ('20261107002822_AddGradeClassification', '8.0.8');

COMMIT;

