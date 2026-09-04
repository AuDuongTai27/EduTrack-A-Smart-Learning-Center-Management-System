-- ============================================================================
-- EduTrack: A Smart Learning Center Management System
-- Database Schema & Sample Data Script
-- Based on: Capstone Project 1 - Báo cáo Lần nộp 5 (CSW480)
-- Authors: Huỳnh Khánh Duy, Âu Dương Tài, Hoàng Quốc Việt
-- Instructor: ThS. Ứng Văn Giàu
-- Database Management System: MySQL 8.0+
-- Encoding: UTF8MB4 (utf8mb4_unicode_ci)
-- Total Tables: 21 Tables (Table 8 to Table 28 in Report)
-- ============================================================================

CREATE DATABASE IF NOT EXISTS edutrack_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE edutrack_db;

SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------------------------------------------------------
-- Drop existing tables if they exist (in reverse dependency order)
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS center_settings;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS approval_requests;
DROP TABLE IF EXISTS payment;
DROP TABLE IF EXISTS tuition_invoices;
DROP TABLE IF EXISTS progress_notes;
DROP TABLE IF EXISTS ai_evaluations;
DROP TABLE IF EXISTS submissions;
DROP TABLE IF EXISTS assignments;
DROP TABLE IF EXISTS attendance;
DROP TABLE IF EXISTS content_units;
DROP TABLE IF EXISTS class_sessions;
DROP TABLE IF EXISTS class_schedules;
DROP TABLE IF EXISTS student_classes;
DROP TABLE IF EXISTS ta_classes;
DROP TABLE IF EXISTS teacher_classes;
DROP TABLE IF EXISTS classes;
DROP TABLE IF EXISTS subjects;
DROP TABLE IF EXISTS user_roles;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================================
-- 1. USER AUTHENTICATION & ROLE MANAGEMENT (RBAC)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Table 8. Users table
-- Centralized entity storing user account credentials, authentication details,
-- and personal profiles for all system roles (Center Managers, Admin Staff,
-- Teachers, Teaching Assistants, and Students/Parents).
-- ----------------------------------------------------------------------------
CREATE TABLE users (
    user_id             INT             NOT NULL AUTO_INCREMENT COMMENT 'Unique internal identifier for the user record',
    user_code           VARCHAR(20)     NOT NULL UNIQUE COMMENT 'Unique account login code / username assigned by Admin (e.g., MGR001, TC001, STU001)',
    full_name           VARCHAR(150)    NOT NULL COMMENT 'Full legal name of the user',
    email               VARCHAR(150)    NULL UNIQUE COMMENT 'User''s email address (can also be used as a login identifier)',
    phone               VARCHAR(20)     NULL COMMENT 'Contact telephone number (can also be used for identification)',
    password_hash       VARCHAR(255)    NOT NULL COMMENT 'Cryptographically hashed password provisioned by Admin',
    avatar_url          VARCHAR(500)    NULL COMMENT 'URL pointing to the user''s profile image',
    date_of_birth       DATE            NULL COMMENT 'Date of birth',
    gender              ENUM('male', 'female', 'other') NULL COMMENT 'Gender of the user',
    specialty           VARCHAR(100)    NULL COMMENT 'Academic subject specialty for teachers (e.g., Mathematics, Physics)',
    enrolled_since      DATE            NULL COMMENT 'Enrollment date for students or hiring date for staff/teachers',
    status              ENUM('active', 'inactive', 'on_hold', 'locked') NOT NULL DEFAULT 'active' COMMENT 'Current operational status of the account',
    created_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Timestamp when the account was provisioned by Admin',
    PRIMARY KEY (user_id),
    INDEX idx_users_user_code (user_code),
    INDEX idx_users_email (email),
    INDEX idx_users_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Table 8. Users table';

-- ----------------------------------------------------------------------------
-- Table 9. Roles table
-- Master lookup table storing system authority roles. It defines the operational
-- scopes for access control.
-- ----------------------------------------------------------------------------
CREATE TABLE roles (
    role_id             INT             NOT NULL AUTO_INCREMENT COMMENT 'Unique internal identifier for the role',
    role_name           VARCHAR(50)     NOT NULL UNIQUE COMMENT 'Name of the role (e.g., center_manager, admin_staff, teacher, teaching_assistant, student)',
    description         TEXT            NULL COMMENT 'Detailed description of the role''s responsibilities and permission scope',
    PRIMARY KEY (role_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Table 9. Roles table';

-- ----------------------------------------------------------------------------
-- Table 10. User_roles table
-- Junction table managing the Many-to-Many (N:M) relationship between users and roles.
-- ----------------------------------------------------------------------------
CREATE TABLE user_roles (
    user_role_id        INT             NOT NULL AUTO_INCREMENT COMMENT 'Unique internal identifier for the role assignment record',
    user_id             INT             NOT NULL COMMENT 'Foreign key referencing the assigned user account',
    role_id             INT             NOT NULL COMMENT 'Foreign key referencing the granted role',
    PRIMARY KEY (user_role_id),
    UNIQUE KEY uq_user_role (user_id, role_id),
    CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_user_roles_role FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Table 10. User_roles table';

-- ============================================================================
-- 2. ACADEMIC STRUCTURE & CLASS ENROLLMENT
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Table 11. Subjects table
-- Lookup table storing distinct academic subject definitions taught across the center.
-- ----------------------------------------------------------------------------
CREATE TABLE subjects (
    subject_id          INT             NOT NULL AUTO_INCREMENT COMMENT 'Unique internal identifier for the subject',
    subject_code        VARCHAR(20)     NOT NULL UNIQUE COMMENT 'Short academic code identifying the subject (e.g., MATH, PHYS, CHEM, ENG)',
    subject_name        VARCHAR(150)    NOT NULL COMMENT 'Full official name of the subject (e.g., Mathematics, Physics)',
    description         TEXT            NULL COMMENT 'Detailed description of the subject curriculum and learning objectives',
    PRIMARY KEY (subject_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Table 11. Subjects table';

-- ----------------------------------------------------------------------------
-- Table 12. Classes table
-- Core instructional grouping entity representing an active cohort for a specific subject.
-- ----------------------------------------------------------------------------
CREATE TABLE classes (
    class_id            INT             NOT NULL AUTO_INCREMENT COMMENT 'Unique identifier for the class section',
    class_name          VARCHAR(100)    NOT NULL COMMENT 'Name of the class (e.g., Class 7 - Mathematics)',
    subject_id          INT             NOT NULL COMMENT 'Identifier of the associated subject',
    room                VARCHAR(50)     NULL COMMENT 'Assigned physical or virtual classroom',
    tuition_fee         DECIMAL(12,2)   NOT NULL DEFAULT 0.00 COMMENT 'Monthly tuition rate in VND',
    start_date          DATE            NULL COMMENT 'Class start date',
    end_date            DATE            NULL COMMENT 'Class end date',
    status              ENUM('active', 'inactive') NOT NULL DEFAULT 'active' COMMENT 'Operational status of the class',
    PRIMARY KEY (class_id),
    CONSTRAINT fk_classes_subject FOREIGN KEY (subject_id) REFERENCES subjects(subject_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_classes_subject (subject_id),
    INDEX idx_classes_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Table 12. Classes table';

-- ----------------------------------------------------------------------------
-- Table 13. Teacher_classes table
-- Junction table mapping primary instructors to their assigned classes.
-- ----------------------------------------------------------------------------
CREATE TABLE teacher_classes (
    teacher_class_id    INT             NOT NULL AUTO_INCREMENT COMMENT 'Unique identifier for the teacher-class assignment',
    teacher_id          INT             NOT NULL COMMENT 'Identifier of the assigned teacher',
    class_id            INT             NOT NULL COMMENT 'Identifier of the assigned class',
    assigned_at         DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Date and time when the teacher was assigned to the class',
    status              ENUM('active', 'inactive') NOT NULL DEFAULT 'active' COMMENT 'Current status of the teacher-class assignment',
    PRIMARY KEY (teacher_class_id),
    UNIQUE KEY uq_teacher_class (teacher_id, class_id),
    CONSTRAINT fk_teacher_classes_teacher FOREIGN KEY (teacher_id) REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_teacher_classes_class FOREIGN KEY (class_id) REFERENCES classes(class_id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_tc_teacher (teacher_id),
    INDEX idx_tc_class (class_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Table 13. Teacher_classes table';

-- ----------------------------------------------------------------------------
-- Table 14. Ta_classes table
-- Junction table assigning teaching assistants to support classes.
-- ----------------------------------------------------------------------------
CREATE TABLE ta_classes (
    ta_class_id         INT             NOT NULL AUTO_INCREMENT COMMENT 'Unique identifier for the teaching assistant-class assignment',
    ta_id               INT             NOT NULL COMMENT 'Identifier of the assigned teaching assistant',
    class_id            INT             NOT NULL COMMENT 'Identifier of the assigned class',
    assigned_at         DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Date and time when the teaching assistant was assigned to the class',
    status              ENUM('active', 'inactive') NOT NULL DEFAULT 'active' COMMENT 'Current status of the teaching assistant-class assignment',
    PRIMARY KEY (ta_class_id),
    UNIQUE KEY uq_ta_class (ta_id, class_id),
    CONSTRAINT fk_ta_classes_ta FOREIGN KEY (ta_id) REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_ta_classes_class FOREIGN KEY (class_id) REFERENCES classes(class_id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_tac_ta (ta_id),
    INDEX idx_tac_class (class_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Table 14. Ta_classes table';

-- ----------------------------------------------------------------------------
-- Table 15. Student_classes table
-- Junction table managing student enrollment in classes.
-- ----------------------------------------------------------------------------
CREATE TABLE student_classes (
    sc_id               INT             NOT NULL AUTO_INCREMENT COMMENT 'Unique identifier for the enrollment record',
    student_id          INT             NOT NULL COMMENT 'Identifier of the enrolled student',
    class_id            INT             NOT NULL COMMENT 'Identifier of the enrolled class',
    enrolled_date       DATE            NULL COMMENT 'Date the student was officially enrolled',
    status              ENUM('active', 'dropped', 'completed') NOT NULL DEFAULT 'active' COMMENT 'Current enrollment status of the student',
    PRIMARY KEY (sc_id),
    UNIQUE KEY uq_student_class (student_id, class_id),
    CONSTRAINT fk_student_classes_student FOREIGN KEY (student_id) REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_student_classes_class FOREIGN KEY (class_id) REFERENCES classes(class_id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_sc_student (student_id),
    INDEX idx_sc_class (class_id),
    INDEX idx_sc_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Table 15. Student_classes table';

-- ============================================================================
-- 3. CLASS SCHEDULING, SESSIONS & ATTENDANCE
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Table 16. Class_schedules table
-- Stores recurring weekly timetable slots for class sections.
-- ----------------------------------------------------------------------------
CREATE TABLE class_schedules (
    schedule_id         INT             NOT NULL AUTO_INCREMENT COMMENT 'Unique identifier for the schedule entry',
    class_id            INT             NOT NULL COMMENT 'Identifier of the scheduled class',
    day_of_week         ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday') NOT NULL COMMENT 'Day of the recurring weekly session',
    start_time          TIME            NOT NULL COMMENT 'Session start time',
    end_time            TIME            NOT NULL COMMENT 'Session end time',
    room                VARCHAR(50)     NULL COMMENT 'Assigned classroom for this specific time slot',
    PRIMARY KEY (schedule_id),
    CONSTRAINT fk_class_schedules_class FOREIGN KEY (class_id) REFERENCES classes(class_id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_schedules_class (class_id),
    INDEX idx_schedules_day (day_of_week)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Table 16. Class_schedules table';

-- ----------------------------------------------------------------------------
-- Table 17. Class_sessions table
-- Represents actual individual teaching sessions occurring on specific calendar dates.
-- ----------------------------------------------------------------------------
CREATE TABLE class_sessions (
    session_id          INT             NOT NULL AUTO_INCREMENT COMMENT 'Unique identifier for the class session',
    class_id            INT             NOT NULL COMMENT 'Identifier of the class',
    schedule_id         INT             NULL COMMENT 'Related recurring schedule of the session',
    session_date        DATE            NOT NULL COMMENT 'Date on which the class session takes place',
    start_time          TIME            NOT NULL COMMENT 'Actual start time of the session',
    end_time            TIME            NOT NULL COMMENT 'Actual end time of the session',
    room                VARCHAR(50)     NULL COMMENT 'Room or location of the session',
    status              ENUM('scheduled', 'completed', 'cancelled') NOT NULL DEFAULT 'scheduled' COMMENT 'Current status of the class session',
    PRIMARY KEY (session_id),
    CONSTRAINT fk_class_sessions_class FOREIGN KEY (class_id) REFERENCES classes(class_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_class_sessions_schedule FOREIGN KEY (schedule_id) REFERENCES class_schedules(schedule_id) ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_sessions_class (class_id),
    INDEX idx_sessions_date (session_date),
    INDEX idx_sessions_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Table 17. Class_sessions table';

-- ----------------------------------------------------------------------------
-- Table 18. Content_units table
-- Stores hierarchical course content modules, syllabus topics, and lesson plans.
-- ----------------------------------------------------------------------------
CREATE TABLE content_units (
    content_unit_id     INT             NOT NULL AUTO_INCREMENT COMMENT 'Unique identifier for the learning content unit',
    class_id            INT             NOT NULL COMMENT 'Identifier of the class that owns the content unit',
    parent_unit_id      INT             NULL COMMENT 'Identifier of the parent content unit in the hierarchy',
    title               VARCHAR(255)    NOT NULL COMMENT 'Title of the learning content unit',
    unit_type           ENUM('chapter', 'lesson', 'topic') NOT NULL COMMENT 'Type of the learning content unit',
    description         TEXT            NULL COMMENT 'Additional description of the learning content',
    order_index         INT             NOT NULL DEFAULT 0 COMMENT 'Display order of the content unit',
    PRIMARY KEY (content_unit_id),
    CONSTRAINT fk_content_units_class FOREIGN KEY (class_id) REFERENCES classes(class_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_content_units_parent FOREIGN KEY (parent_unit_id) REFERENCES content_units(content_unit_id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_content_units_class (class_id),
    INDEX idx_content_units_parent (parent_unit_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Table 18. Content_units table';

-- ----------------------------------------------------------------------------
-- Table 19. Attendance table
-- Operational log tracking presence/absence for enrolled students during sessions.
-- ----------------------------------------------------------------------------
CREATE TABLE attendance (
    attendance_id       INT             NOT NULL AUTO_INCREMENT COMMENT 'Unique identifier for the attendance record',
    session_id          INT             NOT NULL COMMENT 'Identifier of the class session in which attendance is recorded',
    student_id          INT             NOT NULL COMMENT 'Identifier of the student being evaluated',
    status              ENUM('present', 'late', 'absent', 'excuse') NOT NULL COMMENT 'Attendance status',
    note                TEXT            NULL COMMENT 'Justification or note regarding student attendance',
    recorded_by         INT             NOT NULL COMMENT 'Identifier of the staff/teacher who recorded the entry',
    PRIMARY KEY (attendance_id),
    UNIQUE KEY uq_attendance_session_student (session_id, student_id),
    CONSTRAINT fk_attendance_session FOREIGN KEY (session_id) REFERENCES class_sessions(session_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_attendance_student FOREIGN KEY (student_id) REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_attendance_recorded_by FOREIGN KEY (recorded_by) REFERENCES users(user_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_attendance_session (session_id),
    INDEX idx_attendance_student (student_id),
    INDEX idx_attendance_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Table 19. Attendance table';

-- ============================================================================
-- 4. LEARNING CONTENT, ASSIGNMENTS, SUBMISSIONS & AI EVALUATIONS
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Table 20. Assignments table
-- Manages homework, quizzes, exams, and projects issued to classes.
-- ----------------------------------------------------------------------------
CREATE TABLE assignments (
    assignment_id       INT             NOT NULL AUTO_INCREMENT COMMENT 'Unique identifier for the assignment',
    content_unit_id     INT             NULL COMMENT 'Identifier of the related learning content unit',
    class_id            INT             NOT NULL COMMENT 'Identifier of the class receiving the assignment',
    title               VARCHAR(255)    NOT NULL COMMENT 'Title of the assignment',
    description         TEXT            NULL COMMENT 'Detailed instructions and problem descriptions',
    file_url            VARCHAR(500)    NULL COMMENT 'URL pointing to the attached assignment document or resource',
    due_date            DATETIME        NOT NULL COMMENT 'Deadline for submission',
    max_score           DECIMAL(5,2)    NOT NULL DEFAULT 10.00 COMMENT 'Maximum attainable score',
    created_by          INT             NOT NULL COMMENT 'Identifier of the instructor who created the assignment',
    PRIMARY KEY (assignment_id),
    CONSTRAINT fk_assignments_content_unit FOREIGN KEY (content_unit_id) REFERENCES content_units(content_unit_id) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_assignments_class FOREIGN KEY (class_id) REFERENCES classes(class_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_assignments_created_by FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_assignments_class (class_id),
    INDEX idx_assignments_unit (content_unit_id),
    INDEX idx_assignments_due_date (due_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Table 20. Assignments table';

-- ----------------------------------------------------------------------------
-- Table 21. Submissions table
-- Stores student work submissions, grading results, and instructor remarks.
-- ----------------------------------------------------------------------------
CREATE TABLE submissions (
    submission_id       INT             NOT NULL AUTO_INCREMENT COMMENT 'Unique identifier for the submission record',
    assignment_id       INT             NOT NULL COMMENT 'Identifier of the associated assignment',
    student_id          INT             NOT NULL COMMENT 'Identifier of the submitting student',
    file_url            VARCHAR(500)    NULL COMMENT 'URL link pointing to the student''s uploaded solution file',
    submitted_at        DATETIME        NULL COMMENT 'Timestamp of submission',
    score               DECIMAL(5,2)    NULL COMMENT 'Graded score awarded to the submission',
    feedback            TEXT            NULL COMMENT 'Academic comment given by the instructor regarding the student''s work.',
    status              ENUM('submitted', 'graded', 'late') NOT NULL DEFAULT 'submitted' COMMENT 'The current evaluation status of the student''s submission.',
    graded_by           INT             NULL COMMENT 'Identifier of the teacher or teaching assistant who evaluated the submission.',
    PRIMARY KEY (submission_id),
    UNIQUE KEY uq_assignment_student (assignment_id, student_id),
    CONSTRAINT fk_submissions_assignment FOREIGN KEY (assignment_id) REFERENCES assignments(assignment_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_submissions_student FOREIGN KEY (student_id) REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_submissions_graded_by FOREIGN KEY (graded_by) REFERENCES users(user_id) ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_submissions_assignment (assignment_id),
    INDEX idx_submissions_student (student_id),
    INDEX idx_submissions_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Table 21. Submissions table';

-- ----------------------------------------------------------------------------
-- Table 22. AI_evaluations table
-- Holds automated preliminary evaluation scores and suggestions generated by AI.
-- ----------------------------------------------------------------------------
CREATE TABLE ai_evaluations (
    evaluation_id       INT             NOT NULL AUTO_INCREMENT COMMENT 'Unique identifier for the AI evaluation record',
    submission_id       INT             NOT NULL COMMENT 'Identifier of the submission being evaluated',
    requested_by        INT             NOT NULL COMMENT 'Identifier of the teacher who initiated the AI grading',
    ai_score            DECIMAL(5,2)    NULL COMMENT 'Score suggested by the AI model',
    ai_feedback         TEXT            NULL COMMENT 'Qualitative feedback and suggestions generated by AI',
    raw_response        TEXT            NULL COMMENT 'Full response payload returned from the AI API',
    status              VARCHAR(20)     NOT NULL COMMENT 'Execution status (PENDING, SUCCESS, FAILED)',
    created_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Timestamp when the AI evaluation was requested',
    PRIMARY KEY (evaluation_id),
    CONSTRAINT fk_ai_evaluations_submission FOREIGN KEY (submission_id) REFERENCES submissions(submission_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_ai_evaluations_requested_by FOREIGN KEY (requested_by) REFERENCES users(user_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_ai_submission (submission_id),
    INDEX idx_ai_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Table 22. AI_evaluations table';

-- ----------------------------------------------------------------------------
-- Table 23. Progress_notes table
-- Periodic academic feedback, milestones, and behavioural warnings for students.
-- ----------------------------------------------------------------------------
CREATE TABLE progress_notes (
    note_id             INT             NOT NULL AUTO_INCREMENT COMMENT 'Unique identifier for the evaluation entry',
    student_id          INT             NOT NULL COMMENT 'Identifier of the evaluated student',
    class_id            INT             NOT NULL COMMENT 'Identifier of the associated class section',
    written_by          INT             NOT NULL COMMENT 'Identifier of the authoring instructor or assistant',
    content             TEXT            NOT NULL COMMENT 'Qualitative comments and academic evaluation content',
    note_type           ENUM('feedback', 'milestone', 'warning', 'praise') NOT NULL DEFAULT 'feedback' COMMENT 'Classification category of the note',
    created_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Timestamp when the note was recorded',
    PRIMARY KEY (note_id),
    CONSTRAINT fk_progress_notes_student FOREIGN KEY (student_id) REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_progress_notes_class FOREIGN KEY (class_id) REFERENCES classes(class_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_progress_notes_written_by FOREIGN KEY (written_by) REFERENCES users(user_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_notes_student (student_id),
    INDEX idx_notes_class (class_id),
    INDEX idx_notes_type (note_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Table 23. Progress_notes table';

-- ============================================================================
-- 5. TUITION PAYMENT, APPROVAL WORKFLOW & SYSTEM ADMINISTRATION
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Table 24. Tuition_invoices table
-- Monthly billing statements generated for each enrolled student per class.
-- ----------------------------------------------------------------------------
CREATE TABLE tuition_invoices (
    invoice_id          INT             NOT NULL AUTO_INCREMENT COMMENT 'Unique identifier for the tuition invoice',
    student_id          INT             NOT NULL COMMENT 'Identifier of the billed student',
    class_id            INT             NOT NULL COMMENT 'Identifier of the associated class section',
    period_month        TINYINT         NOT NULL COMMENT 'Billing period month (1 - 12)',
    period_year         YEAR            NOT NULL COMMENT 'Billing period year',
    amount_due          DECIMAL(12,2)   NOT NULL COMMENT 'Total payable tuition amount in VND',
    due_date            DATE            NOT NULL COMMENT 'Payment deadline date',
    status              ENUM('unpaid', 'paid', 'overdue', 'pending_adjustment') NOT NULL DEFAULT 'unpaid' COMMENT 'Payment status of the invoice',
    PRIMARY KEY (invoice_id),
    CONSTRAINT chk_invoice_month CHECK (period_month BETWEEN 1 AND 12),
    CONSTRAINT fk_invoices_student FOREIGN KEY (student_id) REFERENCES users(user_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_invoices_class FOREIGN KEY (class_id) REFERENCES classes(class_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_invoices_student (student_id),
    INDEX idx_invoices_class (class_id),
    INDEX idx_invoices_status (status),
    INDEX idx_invoices_due_date (due_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Table 24. Tuition_invoices table';

-- ----------------------------------------------------------------------------
-- Table 25. Payment table
-- Financial ledger of receipts settling tuition invoices.
-- ----------------------------------------------------------------------------
CREATE TABLE payment (
    payment_id          INT             NOT NULL AUTO_INCREMENT COMMENT 'Unique identifier for the payment transaction',
    invoice_id          INT             NOT NULL COMMENT 'Foreign key identifying the tuition invoice associated with this payment.',
    amount              DECIMAL(12,2)   NOT NULL COMMENT 'Actual monetary amount settled',
    payment_method      ENUM('cash', 'bank_transfer', 'vnpay', 'momo') NOT NULL COMMENT 'Channel utilized for payment',
    transaction_code    VARCHAR(100)    NULL COMMENT 'Transaction reference code from banking gateway or digital wallet',
    paid_at             DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Timestamp of payment execution',
    paid_by_user_id     INT             NULL COMMENT 'Identifier of the student who completed payment via online portal',
    recorded_by         INT             NULL COMMENT 'Identifier of the staff member who collected payment at front desk',
    note                VARCHAR(255)    NULL COMMENT 'Additional notes or remarks about the payment transaction.',
    PRIMARY KEY (payment_id),
    CONSTRAINT fk_payment_invoice FOREIGN KEY (invoice_id) REFERENCES tuition_invoices(invoice_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_payment_paid_by FOREIGN KEY (paid_by_user_id) REFERENCES users(user_id) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_payment_recorded_by FOREIGN KEY (recorded_by) REFERENCES users(user_id) ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_payment_invoice (invoice_id),
    INDEX idx_payment_method (payment_method),
    INDEX idx_payment_paid_at (paid_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Table 25. Payment table';

-- ----------------------------------------------------------------------------
-- Table 26. Approval_requests table
-- Exceptions workflow requiring administrative approval by Center Manager.
-- ----------------------------------------------------------------------------
CREATE TABLE approval_requests (
    request_id          INT             NOT NULL AUTO_INCREMENT COMMENT 'Unique identifier for the approval request',
    request_code        VARCHAR(20)     NOT NULL UNIQUE COMMENT 'Human-readable tracking code (e.g., AR0001)',
    request_type        ENUM('tuition_adjustment', 'refund', 'credit', 'due_date_extension', 'leave_request') NOT NULL COMMENT 'Nature of the exception',
    student_id          INT             NULL COMMENT 'Identifier of the associated student',
    invoice_id          INT             NULL COMMENT 'Identifier of the targeted invoice (if applicable)',
    class_id            INT             NULL COMMENT 'Identifier of the targeted class section (if applicable)',
    requested_by        INT             NOT NULL COMMENT 'Identifier of the staff/teacher initiating the request',
    reviewed_by         INT             NULL COMMENT 'Identifier of the manager who reviewed the request',
    priority            ENUM('high', 'medium', 'low') NOT NULL DEFAULT 'medium' COMMENT 'Urgency level of the request',
    status              ENUM('pending', 'approved', 'rejected', 'cancelled') NOT NULL DEFAULT 'pending' COMMENT 'Processing status of the request',
    reason              TEXT            NULL COMMENT 'Detailed explanation and justification for the request',
    PRIMARY KEY (request_id),
    CONSTRAINT fk_approval_student FOREIGN KEY (student_id) REFERENCES users(user_id) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_approval_invoice FOREIGN KEY (invoice_id) REFERENCES tuition_invoices(invoice_id) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_approval_class FOREIGN KEY (class_id) REFERENCES classes(class_id) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_approval_requested_by FOREIGN KEY (requested_by) REFERENCES users(user_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_approval_reviewed_by FOREIGN KEY (reviewed_by) REFERENCES users(user_id) ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_approval_code (request_code),
    INDEX idx_approval_status (status),
    INDEX idx_approval_type (request_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Table 26. Approval_requests table';

-- ----------------------------------------------------------------------------
-- Table 27. Notifications table
-- System broadcast and targeted personal notifications.
-- ----------------------------------------------------------------------------
CREATE TABLE notifications (
    notification_id     INT             NOT NULL AUTO_INCREMENT COMMENT 'Unique identifier for the notification',
    user_id             INT             NULL COMMENT 'Recipient user identifier (NULL indicates a center-wide broadcast)',
    class_id            INT             NULL COMMENT 'Target class identifier (NULL indicates the notification is not restricted to a specific class)',
    title               VARCHAR(255)    NOT NULL COMMENT 'Title of the notification',
    content             TEXT            NULL COMMENT 'Full message content',
    type                ENUM('class', 'system', 'tuition', 'schedule', 'homework', 'feedback') NOT NULL DEFAULT 'system' COMMENT 'Classification category of the notification',
    is_read             BOOLEAN         NOT NULL DEFAULT FALSE COMMENT 'Read status indicator',
    created_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Timestamp when the notification was created',
    PRIMARY KEY (notification_id),
    CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_notifications_class FOREIGN KEY (class_id) REFERENCES classes(class_id) ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_notifications_user (user_id),
    INDEX idx_notifications_class (class_id),
    INDEX idx_notifications_read (is_read),
    INDEX idx_notifications_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Table 27. Notifications table';

-- ----------------------------------------------------------------------------
-- Table 28. Center_settings table
-- Key-value configuration store for application wide operational rules.
-- ----------------------------------------------------------------------------
CREATE TABLE center_settings (
    setting_id          INT             NOT NULL AUTO_INCREMENT COMMENT 'Unique identifier for the setting entry',
    setting_key         VARCHAR(100)    NOT NULL UNIQUE COMMENT 'Unique configuration key (e.g., center_name, academic_year, tuition_due_day)',
    setting_value       TEXT            NULL COMMENT 'Stored configuration value',
    updated_by          INT             NULL COMMENT 'Identifier of the manager who last modified the configuration',
    PRIMARY KEY (setting_id),
    CONSTRAINT fk_center_settings_updated_by FOREIGN KEY (updated_by) REFERENCES users(user_id) ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_settings_key (setting_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Table 28. Center_settings table';

-- ============================================================================
-- 6. SAMPLE SEED DATA (DỮ LIỆU MẪU ĐẦY ĐỦ KIỂM THỬ)
-- ============================================================================

-- 1. Roles
INSERT INTO roles (role_id, role_name, description) VALUES
(1, 'center_manager', 'Highest system authority: center operations, user & role management, financial approvals, settings'),
(2, 'admin_staff', 'Administrative operations: student enrollment, scheduling, attendance oversight, tuition invoicing & payment collection'),
(3, 'teacher', 'Academic instructor: curriculum content, assignments, grading, attendance tracking, student progress notes'),
(4, 'teaching_assistant', 'Academic support: assists grading, attendance logging, student follow-ups'),
(5, 'student', 'Enrolled learner / parent: view schedules, attendance, grades, submit assignments, pay tuition');

-- 2. Users (Passwords hashed with default test pass: 'Password123@' -> dummy bcrypt hash)
INSERT INTO users (user_id, user_code, full_name, email, phone, password_hash, avatar_url, date_of_birth, gender, specialty, enrolled_since, status, created_at) VALUES
(1, 'MGR001', 'Nguyễn Văn Quản Lý', 'manager@edutrack.edu.vn', '0901234567', '$2a$11$N87b.lQp8p9m0Yl4w1e5xe4RzO.B1hO.3r0f7a2.b3c4d5e6f7g8h', 'https://api.dicebear.com/7.x/avataaars/svg?seed=manager', '1985-05-15', 'male', 'Center Administration', '2022-01-01', 'active', NOW()),
(2, 'ADM001', 'Trần Thị Nhân Viên', 'admin@edutrack.edu.vn', '0912345678', '$2a$11$N87b.lQp8p9m0Yl4w1e5xe4RzO.B1hO.3r0f7a2.b3c4d5e6f7g8h', 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin', '1992-08-20', 'female', 'Customer Service & Billing', '2023-03-15', 'active', NOW()),
(3, 'TC001', 'ThS. Hoàng Quốc Việt', 'viet.hoang@edutrack.edu.vn', '0923456789', '$2a$11$N87b.lQp8p9m0Yl4w1e5xe4RzO.B1hO.3r0f7a2.b3c4d5e6f7g8h', 'https://api.dicebear.com/7.x/avataaars/svg?seed=viet', '1990-11-10', 'male', 'Mathematics', '2023-06-01', 'active', NOW()),
(4, 'TC002', 'ThS. Huỳnh Khánh Duy', 'duy.huynh@edutrack.edu.vn', '0934567890', '$2a$11$N87b.lQp8p9m0Yl4w1e5xe4RzO.B1hO.3r0f7a2.b3c4d5e6f7g8h', 'https://api.dicebear.com/7.x/avataaars/svg?seed=duy', '1993-04-25', 'male', 'Physics', '2023-08-01', 'active', NOW()),
(5, 'TA001', 'Âu Dương Tài', 'tai.auduong@edutrack.edu.vn', '0945678901', '$2a$11$N87b.lQp8p9m0Yl4w1e5xe4RzO.B1hO.3r0f7a2.b3c4d5e6f7g8h', 'https://api.dicebear.com/7.x/avataaars/svg?seed=tai', '1998-09-12', 'male', 'Teaching Assistant', '2024-01-10', 'active', NOW()),
(6, 'STU001', 'Lê Văn An', 'an.le@student.edutrack.vn', '0956789012', '$2a$11$N87b.lQp8p9m0Yl4w1e5xe4RzO.B1hO.3r0f7a2.b3c4d5e6f7g8h', 'https://api.dicebear.com/7.x/avataaars/svg?seed=an', '2010-02-14', 'male', NULL, '2025-01-05', 'active', NOW()),
(7, 'STU002', 'Phạm Thị Bích', 'bich.pham@student.edutrack.vn', '0967890123', '$2a$11$N87b.lQp8p9m0Yl4w1e5xe4RzO.B1hO.3r0f7a2.b3c4d5e6f7g8h', 'https://api.dicebear.com/7.x/avataaars/svg?seed=bich', '2010-07-22', 'female', NULL, '2025-01-05', 'active', NOW()),
(8, 'STU003', 'Đặng Minh Cường', 'cuong.dang@student.edutrack.vn', '0978901234', '$2a$11$N87b.lQp8p9m0Yl4w1e5xe4RzO.B1hO.3r0f7a2.b3c4d5e6f7g8h', 'https://api.dicebear.com/7.x/avataaars/svg?seed=cuong', '2010-12-05', 'male', NULL, '2025-01-10', 'active', NOW());

-- 3. User Roles
INSERT INTO user_roles (user_id, role_id) VALUES
(1, 1), -- MGR001 -> center_manager
(2, 2), -- ADM001 -> admin_staff
(3, 3), -- TC001 -> teacher
(4, 3), -- TC002 -> teacher
(5, 4), -- TA001 -> teaching_assistant
(6, 5), -- STU001 -> student
(7, 5), -- STU002 -> student
(8, 5); -- STU003 -> student

-- 4. Subjects
INSERT INTO subjects (subject_id, subject_code, subject_name, description) VALUES
(1, 'MATH', 'Mathematics', 'Core mathematical concepts, algebra, geometry, calculus and logical problem solving.'),
(2, 'PHYS', 'Physics', 'Mechanics, thermodynamics, electromagnetism, and modern physical foundations.'),
(3, 'CHEM', 'Chemistry', 'Inorganic, organic chemistry, reaction stoichiometry, and laboratory techniques.'),
(4, 'ENG', 'English Language', 'Grammar, reading comprehension, writing proficiency, and IELTS foundation.');

-- 5. Classes
INSERT INTO classes (class_id, class_name, subject_id, room, tuition_fee, start_date, end_date, status) VALUES
(1, 'Class 9 - Advanced Mathematics', 1, 'Room 201', 1500000.00, '2026-09-01', '2026-12-31', 'active'),
(2, 'Class 9 - Intensive Physics', 2, 'Room 202', 1400000.00, '2026-09-01', '2026-12-31', 'active'),
(3, 'Class 8 - English Foundation', 4, 'Lab 101', 1800000.00, '2026-09-15', '2027-01-15', 'active');

-- 6. Teacher Classes
INSERT INTO teacher_classes (teacher_id, class_id, assigned_at, status) VALUES
(3, 1, NOW(), 'active'), -- Hoang Quoc Viet teaches Advanced Math
(4, 2, NOW(), 'active'); -- Huynh Khanh Duy teaches Intensive Physics

-- 7. TA Classes
INSERT INTO ta_classes (ta_id, class_id, assigned_at, status) VALUES
(5, 1, NOW(), 'active'), -- Au Duong Tai assists Advanced Math
(5, 2, NOW(), 'active'); -- Au Duong Tai assists Intensive Physics

-- 8. Student Classes
INSERT INTO student_classes (student_id, class_id, enrolled_date, status) VALUES
(6, 1, '2026-09-01', 'active'),
(7, 1, '2026-09-01', 'active'),
(8, 1, '2026-09-02', 'active'),
(6, 2, '2026-09-01', 'active'),
(7, 2, '2026-09-01', 'active');

-- 9. Class Schedules
INSERT INTO class_schedules (schedule_id, class_id, day_of_week, start_time, end_time, room) VALUES
(1, 1, 'monday', '18:00:00', '20:00:00', 'Room 201'),
(2, 1, 'wednesday', '18:00:00', '20:00:00', 'Room 201'),
(3, 2, 'tuesday', '18:00:00', '20:00:00', 'Room 202'),
(4, 2, 'thursday', '18:00:00', '20:00:00', 'Room 202');

-- 10. Class Sessions
INSERT INTO class_sessions (session_id, class_id, schedule_id, session_date, start_time, end_time, room, status) VALUES
(1, 1, 1, '2026-09-08', '18:00:00', '20:00:00', 'Room 201', 'completed'),
(2, 1, 2, '2026-09-10', '18:00:00', '20:00:00', 'Room 201', 'completed'),
(3, 1, 1, '2026-09-15', '18:00:00', '20:00:00', 'Room 201', 'scheduled'),
(4, 2, 3, '2026-09-09', '18:00:00', '20:00:00', 'Room 202', 'completed'),
(5, 2, 4, '2026-09-11', '18:00:00', '20:00:00', 'Room 202', 'scheduled');

-- 11. Content Units
INSERT INTO content_units (content_unit_id, class_id, parent_unit_id, title, unit_type, description, order_index) VALUES
(1, 1, NULL, 'Chapter 1: Quadratic Equations & Systems', 'chapter', 'Fundamental concepts of quadratic forms, discriminant analysis and Vieta theorem', 1),
(2, 1, 1, 'Lesson 1.1: Solving Quadratic Equations', 'lesson', 'Factoring methods and standard quadratic formula application', 1),
(3, 1, 1, 'Lesson 1.2: Vieta''s Formulas and Applications', 'lesson', 'Relationships between roots and polynomial coefficients', 2),
(4, 1, NULL, 'Chapter 2: Plane Trigonometry', 'chapter', 'Trigonometric ratios, sine and cosine laws', 2),
(5, 2, NULL, 'Chapter 1: Kinematics and Motion', 'chapter', 'Linear kinematics, speed, velocity, acceleration and vectors', 1);

-- 12. Attendance
INSERT INTO attendance (session_id, student_id, status, note, recorded_by) VALUES
(1, 6, 'present', 'On time and engaged', 3),
(1, 7, 'present', 'Active in class discussions', 3),
(1, 8, 'late', 'Arrived 15 minutes late with notice', 5),
(2, 6, 'present', NULL, 3),
(2, 7, 'absent', 'Sick leave approved', 5),
(2, 8, 'present', NULL, 3);

-- 13. Assignments
INSERT INTO assignments (assignment_id, content_unit_id, class_id, title, description, file_url, due_date, max_score, created_by) VALUES
(1, 2, 1, 'Homework 01: Quadratic Equations Problem Set', 'Complete problems 1 to 15 from textbook page 42. Show all calculation steps.', 'https://storage.edutrack.edu.vn/assignments/hw01_math9.pdf', '2026-09-14 23:59:00', 10.00, 3),
(2, 3, 1, 'Quiz 01: Applications of Vieta Theorem', 'Solve 5 advanced theorem problems regarding symmetric expressions.', 'https://storage.edutrack.edu.vn/assignments/quiz01_math9.pdf', '2026-09-20 23:59:00', 10.00, 3),
(3, 5, 2, 'Lab Report: Uniform Acceleration Experiment', 'Analyze data captured from motion sensor track.', 'https://storage.edutrack.edu.vn/assignments/lab01_phys9.pdf', '2026-09-18 23:59:00', 10.00, 4);

-- 14. Submissions
INSERT INTO submissions (submission_id, assignment_id, student_id, file_url, submitted_at, score, feedback, status, graded_by) VALUES
(1, 1, 6, 'https://storage.edutrack.edu.vn/submissions/stu001_hw01.pdf', '2026-09-13 20:30:00', 9.50, 'Excellent work! Detailed derivations and clean presentation.', 'graded', 3),
(2, 1, 7, 'https://storage.edutrack.edu.vn/submissions/stu002_hw01.pdf', '2026-09-14 22:15:00', 8.00, 'Good attempt. Check signs in problem 12.', 'graded', 5),
(3, 1, 8, 'https://storage.edutrack.edu.vn/submissions/stu003_hw01.pdf', '2026-09-15 08:10:00', NULL, NULL, 'late', NULL);

-- 15. AI Evaluations
INSERT INTO ai_evaluations (evaluation_id, submission_id, requested_by, ai_score, ai_feedback, raw_response, status, created_at) VALUES
(1, 1, 3, 9.50, 'High accuracy across all 15 solutions. Clear step-by-step logic. Minor syntax abbreviation in problem 8.', '{"model":"gemini-2.5-flash","score":9.5,"confidence":0.96}', 'SUCCESS', NOW()),
(2, 2, 3, 7.80, 'Correct methodology for items 1-11. Calculation sign mistake detected in item 12.', '{"model":"gemini-2.5-flash","score":7.8,"confidence":0.92}', 'SUCCESS', NOW());

-- 16. Progress Notes
INSERT INTO progress_notes (note_id, student_id, class_id, written_by, content, note_type, created_at) VALUES
(1, 6, 1, 3, 'An exhibits outstanding mathematical intuition. Consistently achieves top marks.', 'praise', NOW()),
(2, 7, 1, 5, 'Bich missed session 2 due to illness. Followed up and shared lecture slides.', 'feedback', NOW()),
(3, 8, 1, 3, 'Cuong submitted homework 1 late. Needs to manage timetable and deadline alerts.', 'warning', NOW());

-- 17. Tuition Invoices
INSERT INTO tuition_invoices (invoice_id, student_id, class_id, period_month, period_year, amount_due, due_date, status) VALUES
(1, 6, 1, 9, 2026, 1500000.00, '2026-09-10', 'paid'),
(2, 7, 1, 9, 2026, 1500000.00, '2026-09-10', 'paid'),
(3, 8, 1, 9, 2026, 1500000.00, '2026-09-10', 'overdue'),
(4, 6, 2, 9, 2026, 1400000.00, '2026-09-10', 'paid'),
(5, 7, 2, 9, 2026, 1400000.00, '2026-09-10', 'unpaid');

-- 18. Payment
INSERT INTO payment (payment_id, invoice_id, amount, payment_method, transaction_code, paid_at, paid_by_user_id, recorded_by, note) VALUES
(1, 1, 1500000.00, 'vnpay', 'VNP202609051029384', '2026-09-05 10:29:38', 6, NULL, 'Settled via VNPay Student Online Portal'),
(2, 2, 1500000.00, 'bank_transfer', 'MBVCB.789123456', '2026-09-06 14:20:00', NULL, 2, 'Received via Vietcombank, verified at front desk'),
(3, 4, 1400000.00, 'momo', 'MOMO992817263', '2026-09-07 09:15:22', 6, NULL, 'Settled via MoMo e-wallet');

-- 19. Approval Requests
INSERT INTO approval_requests (request_id, request_code, request_type, student_id, invoice_id, class_id, requested_by, reviewed_by, priority, status, reason) VALUES
(1, 'AR0001', 'due_date_extension', 8, 3, 1, 2, 1, 'medium', 'approved', 'Student family had sudden medical emergency, requested 10 days extension for invoice #3.'),
(2, 'AR0002', 'tuition_adjustment', 7, 5, 2, 2, NULL, 'high', 'pending', 'Sibling discount policy (10% off for 2nd enrolled subject). Needs manager sign-off.'),
(3, 'AR0003', 'leave_request', 7, NULL, 1, 5, 1, 'low', 'approved', 'Medical leave for session on 2026-09-10 with valid doctor confirmation.');

-- 20. Notifications
INSERT INTO notifications (notification_id, user_id, class_id, title, content, type, is_read, created_at) VALUES
(1, NULL, NULL, 'EduTrack System Welcome', 'Welcome to EduTrack! Please complete your profile information.', 'system', FALSE, NOW()),
(2, 6, 1, 'Homework 01 Graded', 'Your submission for Homework 01 has been graded: 9.5/10.0', 'homework', TRUE, NOW()),
(3, 7, 1, 'Leave Request Approved', 'Your leave request for Session 2 has been approved by the Center Manager.', 'class', FALSE, NOW()),
(4, 8, 1, 'Tuition Due Reminder', 'Tuition invoice for Class 9 Advanced Mathematics is overdue. Please settle promptly.', 'tuition', FALSE, NOW()),
(5, NULL, 1, 'Class Room Update', 'Session on 2026-09-15 will start 15 mins earlier for test review.', 'schedule', FALSE, NOW());

-- 21. Center Settings
INSERT INTO center_settings (setting_id, setting_key, setting_value, updated_by) VALUES
(1, 'center_name', 'EduTrack Smart Learning Center', 1),
(2, 'center_address', '123 Nguyen Van Cu, District 5, Ho Chi Minh City', 1),
(3, 'center_hotline', '1900 6868', 1),
(4, 'academic_year', '2026 - 2027', 1),
(5, 'tuition_due_day', '10', 1),
(6, 'ai_evaluation_enabled', 'true', 1),
(7, 'currency', 'VND', 1);

-- ============================================================================
-- 7. HELPER VIEWS FOR SYSTEM REPORTING
-- ============================================================================

-- View: Class Enrollment Summary
CREATE OR REPLACE VIEW vw_class_enrollment_summary AS
SELECT 
    c.class_id,
    c.class_name,
    s.subject_name,
    c.room,
    c.tuition_fee,
    c.status AS class_status,
    COUNT(DISTINCT sc.student_id) AS total_students,
    GROUP_CONCAT(DISTINCT tu.full_name SEPARATOR ', ') AS teachers,
    GROUP_CONCAT(DISTINCT tau.full_name SEPARATOR ', ') AS teaching_assistants
FROM classes c
LEFT JOIN subjects s ON c.subject_id = s.subject_id
LEFT JOIN student_classes sc ON c.class_id = sc.class_id AND sc.status = 'active'
LEFT JOIN teacher_classes tc ON c.class_id = tc.class_id AND tc.status = 'active'
LEFT JOIN users tu ON tc.teacher_id = tu.user_id
LEFT JOIN ta_classes tac ON c.class_id = tac.class_id AND tac.status = 'active'
LEFT JOIN users tau ON tac.ta_id = tau.user_id
GROUP BY c.class_id, c.class_name, s.subject_name, c.room, c.tuition_fee, c.status;

-- View: Student Invoice & Payment Balance
CREATE OR REPLACE VIEW vw_invoice_payment_summary AS
SELECT 
    i.invoice_id,
    u.user_code AS student_code,
    u.full_name AS student_name,
    c.class_name,
    i.period_month,
    i.period_year,
    i.amount_due,
    COALESCE(SUM(p.amount), 0.00) AS total_paid,
    (i.amount_due - COALESCE(SUM(p.amount), 0.00)) AS balance_remaining,
    i.due_date,
    i.status AS invoice_status
FROM tuition_invoices i
JOIN users u ON i.student_id = u.user_id
JOIN classes c ON i.class_id = c.class_id
LEFT JOIN payment p ON i.invoice_id = p.invoice_id
GROUP BY i.invoice_id, u.user_code, u.full_name, c.class_name, i.period_month, i.period_year, i.amount_due, i.due_date, i.status;

-- ============================================================================
-- END OF SCRIPT
-- ============================================================================
