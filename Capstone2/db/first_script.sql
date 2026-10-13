-- ============================================================================
-- EduTrack: A Smart Learning Center Management System
-- Database Schema & Sample Data Script (Capstone 2 - Master Version)
-- Based on: Capstone Project 1 - Báo cáo Lần nộp 5 (CSW480) & EduTrack_Final_Conflict_Resolution.md
-- Authors: Huỳnh Khánh Duy, Âu Dương Tài, Hoàng Quốc Việt
-- Instructor: ThS. Ứng Văn Giàu
-- Database Management System: MySQL 8.0+
-- Encoding: UTF8MB4 (utf8mb4_unicode_ci)
-- Total Tables: 22 Tables (21 Bảng gốc + 1 Bảng mới parent_students)
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
DROP TABLE IF EXISTS parent_students;
DROP TABLE IF EXISTS user_roles;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================================
-- 1. USER AUTHENTICATION, RBAC & PARENT-STUDENT LINKAGE
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Table 1. Users table (Table 8 in Report)
-- Centralized entity storing user account credentials, authentication details,
-- password lifecycle, and personal profiles for all system roles.
-- [C-05] Thêm must_change_password và password_changed_at quản lý vòng đời mật khẩu.
-- ----------------------------------------------------------------------------
CREATE TABLE users (
    user_id             INT             NOT NULL AUTO_INCREMENT COMMENT 'Unique internal identifier for the user record',
    user_code           VARCHAR(20)     NOT NULL UNIQUE COMMENT 'Unique account login code (e.g., MGR001, TC001, TA001, STU001, PAR001)',
    full_name           VARCHAR(150)    NOT NULL COMMENT 'Full legal name of the user',
    email               VARCHAR(150)    NULL UNIQUE COMMENT 'User email address (used for login and password recovery)',
    phone               VARCHAR(20)     NULL COMMENT 'Contact telephone number',
    password_hash       VARCHAR(255)    NOT NULL COMMENT 'Cryptographically hashed password provisioned by Admin',
    avatar_url          VARCHAR(500)    NULL COMMENT 'URL pointing to the user profile avatar image',
    date_of_birth       DATE            NULL COMMENT 'Date of birth',
    gender              ENUM('male', 'female', 'other') NULL COMMENT 'Gender of the user',
    specialty           VARCHAR(100)    NULL COMMENT 'Academic subject specialty for teachers (e.g., Mathematics, Physics)',
    enrolled_since      DATE            NULL COMMENT 'Enrollment date for students or hiring date for staff/teachers',
    status              ENUM('active', 'inactive', 'on_hold', 'locked') NOT NULL DEFAULT 'active' COMMENT 'Current operational status of account',
    created_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Timestamp when the account was provisioned by Admin',
    PRIMARY KEY (user_id),
    INDEX idx_users_user_code (user_code),
    INDEX idx_users_email (email),
    INDEX idx_users_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Table 1 (Table 8). Users table';

-- ----------------------------------------------------------------------------
-- Table 2. Roles table (Table 9 in Report)
-- Master lookup table storing system authority roles.
-- [C-02] Bổ sung vai trò parent phục vụ tách tài khoản Phụ huynh độc lập.
-- ----------------------------------------------------------------------------
CREATE TABLE roles (
    role_id             INT             NOT NULL AUTO_INCREMENT COMMENT 'Unique internal identifier for the role',
    role_name           VARCHAR(50)     NOT NULL UNIQUE COMMENT 'Role name: center_manager, admin_staff, teacher, teaching_assistant, student, parent',
    description         TEXT            NULL COMMENT 'Detailed description of the role responsibilities and permission scope',
    PRIMARY KEY (role_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Table 2 (Table 9). Roles table';

-- ----------------------------------------------------------------------------
-- Table 3. User_roles table (Table 10 in Report)
-- Junction table managing Many-to-Many (N:M) relationship between users and roles.
-- ----------------------------------------------------------------------------
CREATE TABLE user_roles (
    user_role_id        INT             NOT NULL AUTO_INCREMENT COMMENT 'Unique internal identifier for role assignment record',
    user_id             INT             NOT NULL COMMENT 'Foreign key referencing the assigned user account',
    role_id             INT             NOT NULL COMMENT 'Foreign key referencing the granted role',
    PRIMARY KEY (user_role_id),
    UNIQUE KEY uq_user_role (user_id, role_id),
    CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_user_roles_role FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Table 3 (Table 10). User_roles table';

-- ----------------------------------------------------------------------------
-- Table 4. Parent_students table [BẢNG MỚI DUY NHẤT - C-02 THEO FILE DUY HKD]
-- Bảng quan hệ N:1 giữa Phụ huynh và Học sinh.
-- 1 Phụ huynh quản lý nhiều Học sinh; mỗi Học sinh có 1 Phụ huynh chính nhận hóa đơn.
-- ----------------------------------------------------------------------------
CREATE TABLE parent_students (
    parent_id           INT             NOT NULL COMMENT 'Foreign key referencing user account with parent role',
    student_id          INT             NOT NULL COMMENT 'Foreign key referencing user account with student role',
    relationship        VARCHAR(50)     NOT NULL DEFAULT 'Parent' COMMENT 'Relationship type (Father, Mother, Guardian)',
    is_primary_contact  BOOLEAN         NOT NULL DEFAULT TRUE COMMENT 'Indicates if this parent is the primary contact for notifications and billing',
    created_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Timestamp when parent-student linkage was established',
    PRIMARY KEY (parent_id, student_id),
    CONSTRAINT fk_parent_students_parent FOREIGN KEY (parent_id) REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_parent_students_student FOREIGN KEY (student_id) REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_ps_parent (parent_id),
    INDEX idx_ps_student (student_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Table 4. Parent_students relationship junction table';

-- ============================================================================
-- 2. ACADEMIC STRUCTURE, CLASSES & ENROLLMENT
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Table 5. Subjects table (Table 11 in Report)
-- Master catalog of academic disciplines offered at the learning center.
-- ----------------------------------------------------------------------------
CREATE TABLE subjects (
    subject_id          INT             NOT NULL AUTO_INCREMENT COMMENT 'Unique identifier for the subject',
    subject_code        VARCHAR(20)     NOT NULL UNIQUE COMMENT 'Short unique code representing the subject (e.g., MATH, PHYS, CHEM, ENG)',
    subject_name        VARCHAR(100)    NOT NULL COMMENT 'Full title of the subject curriculum',
    description         TEXT            NULL COMMENT 'Summary of the learning objectives and scope covered',
    PRIMARY KEY (subject_id),
    INDEX idx_subjects_code (subject_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Table 5 (Table 11). Subjects table';

-- ----------------------------------------------------------------------------
-- Table 6. Classes table (Table 12 in Report)
-- Specific academic class sections scheduled for a semester/term.
-- ----------------------------------------------------------------------------
CREATE TABLE classes (
    class_id            INT             NOT NULL AUTO_INCREMENT COMMENT 'Unique identifier for the class section',
    class_name          VARCHAR(150)    NOT NULL COMMENT 'Display name of the class (e.g., Class 9 - Advanced Mathematics)',
    subject_id          INT             NOT NULL COMMENT 'Identifier of the underlying academic subject curriculum',
    room                VARCHAR(50)     NULL COMMENT 'Default physical classroom assigned for this section',
    tuition_fee         DECIMAL(12,2)   NOT NULL DEFAULT 0.00 COMMENT 'Standard monthly tuition fee charged for this class',
    start_date          DATE            NOT NULL COMMENT 'Date when instruction officially begins',
    end_date            DATE            NULL COMMENT 'Date when instruction concludes for the term',
    status              ENUM('active', 'inactive') NOT NULL DEFAULT 'active' COMMENT 'Lifecycle status of the class section',
    PRIMARY KEY (class_id),
    CONSTRAINT fk_classes_subject FOREIGN KEY (subject_id) REFERENCES subjects(subject_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_classes_subject (subject_id),
    INDEX idx_classes_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Table 6 (Table 12). Classes table';

-- ----------------------------------------------------------------------------
-- Table 7. Teacher_classes table (Table 13 in Report)
-- Junction entity assigning primary academic instructors to class sections.
-- ----------------------------------------------------------------------------
CREATE TABLE teacher_classes (
    teacher_class_id    INT             NOT NULL AUTO_INCREMENT COMMENT 'Unique identifier for the assignment record',
    teacher_id          INT             NOT NULL COMMENT 'Identifier of the assigned instructor',
    class_id            INT             NOT NULL COMMENT 'Identifier of the assigned class section',
    assigned_at         DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Timestamp when the teacher assignment was approved',
    status              ENUM('active', 'inactive') NOT NULL DEFAULT 'active' COMMENT 'Assignment status',
    PRIMARY KEY (teacher_class_id),
    UNIQUE KEY uq_teacher_class (teacher_id, class_id),
    CONSTRAINT fk_teacher_classes_teacher FOREIGN KEY (teacher_id) REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_teacher_classes_class FOREIGN KEY (class_id) REFERENCES classes(class_id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_tc_teacher (teacher_id),
    INDEX idx_tc_class (class_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Table 7 (Table 13). Teacher_classes table';

-- ----------------------------------------------------------------------------
-- Table 8. TA_classes table (Table 14 in Report)
-- Junction entity assigning Teaching Assistants (TA) to class sections.
-- ----------------------------------------------------------------------------
CREATE TABLE ta_classes (
    ta_class_id         INT             NOT NULL AUTO_INCREMENT COMMENT 'Unique identifier for the TA assignment record',
    ta_id               INT             NOT NULL COMMENT 'Identifier of the assigned teaching assistant',
    class_id            INT             NOT NULL COMMENT 'Identifier of the assigned class section',
    assigned_at         DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Timestamp when the TA assignment was recorded',
    status              ENUM('active', 'inactive') NOT NULL DEFAULT 'active' COMMENT 'TA assignment status',
    PRIMARY KEY (ta_class_id),
    UNIQUE KEY uq_ta_class (ta_id, class_id),
    CONSTRAINT fk_ta_classes_ta FOREIGN KEY (ta_id) REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_ta_classes_class FOREIGN KEY (class_id) REFERENCES classes(class_id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_tac_ta (ta_id),
    INDEX idx_tac_class (class_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Table 8 (Table 14). TA_classes table';

-- ----------------------------------------------------------------------------
-- Table 9. Student_classes table (Table 15 in Report)
-- Junction table managing student enrollment in classes.
-- [C-03] Thêm dropped_at và drop_reason phục vụ Transaction chuyển lớp.
-- ----------------------------------------------------------------------------
CREATE TABLE student_classes (
    sc_id               INT             NOT NULL AUTO_INCREMENT COMMENT 'Unique identifier for the enrollment record',
    student_id          INT             NOT NULL COMMENT 'Identifier of the enrolled student',
    class_id            INT             NOT NULL COMMENT 'Identifier of the enrolled class',
    enrolled_date       DATE            NULL COMMENT 'Date the student was officially enrolled',
    status              ENUM('active', 'dropped', 'completed') NOT NULL DEFAULT 'active' COMMENT 'Current enrollment status',
    dropped_at          DATE            NULL COMMENT '[C-03] Date when student dropped or transferred out',
    drop_reason         TEXT            NULL COMMENT '[C-03] Reason for dropping or transferring class',
    PRIMARY KEY (sc_id),
    UNIQUE KEY uq_student_class (student_id, class_id),
    CONSTRAINT fk_student_classes_student FOREIGN KEY (student_id) REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_student_classes_class FOREIGN KEY (class_id) REFERENCES classes(class_id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_sc_student (student_id),
    INDEX idx_sc_class (class_id),
    INDEX idx_sc_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Table 9 (Table 15). Student_classes table';

-- ============================================================================
-- 3. CLASS SCHEDULING, SESSIONS & ATTENDANCE
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Table 10. Class_schedules table (Table 16 in Report)
-- Stores recurring weekly timetable slots for class sections.
-- ----------------------------------------------------------------------------
CREATE TABLE class_schedules (
    schedule_id         INT             NOT NULL AUTO_INCREMENT COMMENT 'Unique identifier for schedule entry',
    class_id            INT             NOT NULL COMMENT 'Identifier of scheduled class',
    day_of_week         ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday') NOT NULL COMMENT 'Day of recurring weekly session',
    start_time          TIME            NOT NULL COMMENT 'Session start time',
    end_time            TIME            NOT NULL COMMENT 'Session end time',
    room                VARCHAR(50)     NULL COMMENT 'Assigned room for this specific time slot',
    PRIMARY KEY (schedule_id),
    CONSTRAINT fk_class_schedules_class FOREIGN KEY (class_id) REFERENCES classes(class_id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_schedules_class (class_id),
    INDEX idx_schedules_day (day_of_week)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Table 10 (Table 16). Class_schedules table';

-- ----------------------------------------------------------------------------
-- Table 11. Class_sessions table (Table 17 in Report)
-- Concrete instances of class meetings occurring on specific calendar dates.
-- [C-04] Hỗ trợ query my-schedule cho Teacher/TA/Student/Parent qua class_id & teacher_classes.
-- ----------------------------------------------------------------------------
CREATE TABLE class_sessions (
    session_id          INT             NOT NULL AUTO_INCREMENT COMMENT 'Unique identifier for the session meeting',
    class_id            INT             NOT NULL COMMENT 'Identifier of the class being conducted',
    schedule_id         INT             NULL COMMENT 'Reference to the recurring schedule rule that generated this session',
    session_date        DATE            NOT NULL COMMENT 'Calendar date on which this session occurs',
    start_time          TIME            NOT NULL COMMENT 'Actual start time',
    end_time            TIME            NOT NULL COMMENT 'Actual end time',
    room                VARCHAR(50)     NULL COMMENT 'Actual room used',
    status              ENUM('scheduled', 'completed', 'cancelled') NOT NULL DEFAULT 'scheduled' COMMENT 'Operational state of session',
    PRIMARY KEY (session_id),
    CONSTRAINT fk_class_sessions_class FOREIGN KEY (class_id) REFERENCES classes(class_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_class_sessions_schedule FOREIGN KEY (schedule_id) REFERENCES class_schedules(schedule_id) ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_sessions_class (class_id),
    INDEX idx_sessions_date (session_date),
    INDEX idx_sessions_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Table 11 (Table 17). Class_sessions table';

-- ----------------------------------------------------------------------------
-- Table 12. Content_units table (Table 18 in Report)
-- Hierarchical course curriculum syllabus structure (Chapters, Lessons).
-- ----------------------------------------------------------------------------
CREATE TABLE content_units (
    content_unit_id     INT             NOT NULL AUTO_INCREMENT COMMENT 'Unique identifier for the curriculum unit',
    class_id            INT             NOT NULL COMMENT 'Identifier of the associated class',
    parent_unit_id      INT             NULL COMMENT 'Self-referencing pointer to parent chapter (NULL if root chapter)',
    title               VARCHAR(200)    NOT NULL COMMENT 'Title of the chapter or lesson',
    unit_type           ENUM('chapter', 'lesson') NOT NULL DEFAULT 'lesson' COMMENT 'Structural hierarchy level',
    description         TEXT            NULL COMMENT 'Summary of learning content and objectives',
    order_index         INT             NOT NULL DEFAULT 1 COMMENT 'Sequential position for curriculum display',
    PRIMARY KEY (content_unit_id),
    CONSTRAINT fk_content_units_class FOREIGN KEY (class_id) REFERENCES classes(class_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_content_units_parent FOREIGN KEY (parent_unit_id) REFERENCES content_units(content_unit_id) ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_content_units_class (class_id),
    INDEX idx_content_units_parent (parent_unit_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Table 12 (Table 18). Content_units table';

-- ----------------------------------------------------------------------------
-- Table 13. Attendance table (Table 19 in Report)
-- Records student presence, tardiness, or excused absence for each session.
-- ----------------------------------------------------------------------------
CREATE TABLE attendance (
    attendance_id       INT             NOT NULL AUTO_INCREMENT COMMENT 'Unique identifier for the attendance entry',
    session_id          INT             NOT NULL COMMENT 'Identifier of the class session',
    student_id          INT             NOT NULL COMMENT 'Identifier of the student',
    status              ENUM('present', 'absent', 'late', 'excused') NOT NULL DEFAULT 'present' COMMENT 'Attendance status',
    note                VARCHAR(255)    NULL COMMENT 'Contextual remark (e.g., Late 15m, Sick leave approved)',
    recorded_by         INT             NOT NULL COMMENT 'Identifier of the staff/teacher who took attendance',
    recorded_at         DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Timestamp when attendance was saved',
    PRIMARY KEY (attendance_id),
    UNIQUE KEY uq_session_student (session_id, student_id),
    CONSTRAINT fk_attendance_session FOREIGN KEY (session_id) REFERENCES class_sessions(session_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_attendance_student FOREIGN KEY (student_id) REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_attendance_recorded_by FOREIGN KEY (recorded_by) REFERENCES users(user_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_attendance_session (session_id),
    INDEX idx_attendance_student (student_id),
    INDEX idx_attendance_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Table 13 (Table 19). Attendance table';

-- ============================================================================
-- 4. ASSIGNMENTS, SUBMISSIONS & AI GRADING (TC-07 & RUBRIC LIFECYCLE)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Table 14. Assignments table (Table 20 in Report)
-- Academic exercises, quizzes, homework sets, and projects.
-- [TC-07] Bổ sung Rubric JSON, Đáp án mẫu (Answer Key) và cờ bật/tắt AI Grading.
-- ----------------------------------------------------------------------------
CREATE TABLE assignments (
    assignment_id       INT             NOT NULL AUTO_INCREMENT COMMENT 'Unique identifier for assignment',
    content_unit_id     INT             NULL COMMENT 'Associated curriculum unit (optional link)',
    class_id            INT             NOT NULL COMMENT 'Target class section required to complete the assignment',
    title               VARCHAR(200)    NOT NULL COMMENT 'Assignment title',
    description         TEXT            NULL COMMENT 'Detailed instructions, problem statement, or prompt',
    file_url            VARCHAR(500)    NULL COMMENT 'URL pointing to attached assignment document or PDF resource',
    due_date            DATETIME        NOT NULL COMMENT 'Deadline for submission',
    max_score           DECIMAL(5,2)    NOT NULL DEFAULT 10.00 COMMENT 'Maximum attainable score',
    created_by          INT             NOT NULL COMMENT 'Identifier of instructor who created assignment',
    answer_key_text     TEXT            NULL COMMENT '[TC-07] Lời giải chi tiết hoặc đáp án chuẩn của GV (ẩn với HS, nạp cho AI)',
    answer_key_file_url VARCHAR(500)    NULL COMMENT '[TC-07] File đề cương/đáp án mẫu PDF đính kèm',
    rubric_json         JSON            NULL COMMENT '[TC-07] Bảng tiêu chí chấm điểm (Rubric) dạng JSON schema',
    is_ai_grading_enabled BOOLEAN       NOT NULL DEFAULT TRUE COMMENT '[TC-07] Cho phép kích hoạt AI chấm bài tự động',
    PRIMARY KEY (assignment_id),
    CONSTRAINT fk_assignments_content_unit FOREIGN KEY (content_unit_id) REFERENCES content_units(content_unit_id) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_assignments_class FOREIGN KEY (class_id) REFERENCES classes(class_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_assignments_created_by FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_assignments_class (class_id),
    INDEX idx_assignments_unit (content_unit_id),
    INDEX idx_assignments_due_date (due_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Table 14 (Table 20). Assignments table';

-- ----------------------------------------------------------------------------
-- Table 15. Submissions table (Table 21 in Report)
-- Stores student work submissions, grading results, AI scores, and instructor remarks.
-- [TC-07] Bổ sung ai_score, ai_feedback_json và mở rộng enum status.
-- ----------------------------------------------------------------------------
CREATE TABLE submissions (
    submission_id       INT             NOT NULL AUTO_INCREMENT COMMENT 'Unique identifier for submission record',
    assignment_id       INT             NOT NULL COMMENT 'Identifier of associated assignment',
    student_id          INT             NOT NULL COMMENT 'Identifier of submitting student',
    file_url            VARCHAR(500)    NULL COMMENT 'URL pointing to student uploaded solution file (PDF/Image/Word)',
    submitted_at        DATETIME        NULL COMMENT 'Timestamp of submission',
    score               DECIMAL(5,2)    NULL COMMENT 'Final approved score awarded to submission',
    feedback            TEXT            NULL COMMENT 'Instructor qualitative comments and pedagogical advice',
    ai_score            DECIMAL(5,2)    NULL COMMENT '[TC-07] Điểm số sơ bộ do mô hình AI đề xuất',
    ai_feedback_json    JSON            NULL COMMENT '[TC-07] Phân tích điểm chi tiết từng tiêu chí và nhận xét từ AI',
    status              ENUM('submitted', 'queued', 'ai_graded', 'graded', 'late') NOT NULL DEFAULT 'submitted' COMMENT 'Evaluation status',
    graded_by           INT             NULL COMMENT 'Identifier of teacher who evaluated/approved submission',
    PRIMARY KEY (submission_id),
    UNIQUE KEY uq_assignment_student (assignment_id, student_id),
    CONSTRAINT fk_submissions_assignment FOREIGN KEY (assignment_id) REFERENCES assignments(assignment_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_submissions_student FOREIGN KEY (student_id) REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_submissions_graded_by FOREIGN KEY (graded_by) REFERENCES users(user_id) ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_submissions_assignment (assignment_id),
    INDEX idx_submissions_student (student_id),
    INDEX idx_submissions_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Table 15 (Table 21). Submissions table';

-- ----------------------------------------------------------------------------
-- Table 16. AI_evaluations table (Table 22 in Report)
-- Historical audit trail of AI evaluation runs (model version, latency, raw payload).
-- ----------------------------------------------------------------------------
CREATE TABLE ai_evaluations (
    evaluation_id       INT             NOT NULL AUTO_INCREMENT COMMENT 'Unique identifier for AI evaluation run',
    submission_id       INT             NOT NULL COMMENT 'Identifier of target submission',
    requested_by        INT             NOT NULL COMMENT 'Identifier of instructor who triggered AI grading',
    ai_score            DECIMAL(5,2)    NULL COMMENT 'Score suggested by AI model',
    ai_feedback         TEXT            NULL COMMENT 'Qualitative feedback generated by AI',
    raw_response        TEXT            NULL COMMENT 'Full JSON response payload returned from AI LLM API',
    status              VARCHAR(20)     NOT NULL COMMENT 'Execution status (PENDING, SUCCESS, FAILED)',
    created_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Timestamp when AI evaluation was triggered',
    PRIMARY KEY (evaluation_id),
    CONSTRAINT fk_ai_evaluations_submission FOREIGN KEY (submission_id) REFERENCES submissions(submission_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_ai_evaluations_requested_by FOREIGN KEY (requested_by) REFERENCES users(user_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_ai_submission (submission_id),
    INDEX idx_ai_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Table 16 (Table 22). AI_evaluations table';

-- ----------------------------------------------------------------------------
-- Table 17. Progress_notes table (Table 23 in Report)
-- Periodic academic feedback, milestones, and behavioural warnings for students.
-- ----------------------------------------------------------------------------
CREATE TABLE progress_notes (
    note_id             INT             NOT NULL AUTO_INCREMENT COMMENT 'Unique identifier for progress note',
    student_id          INT             NOT NULL COMMENT 'Identifier of student',
    class_id            INT             NOT NULL COMMENT 'Identifier of class context',
    written_by          INT             NOT NULL COMMENT 'Identifier of instructor/TA authoring the note',
    content             TEXT            NOT NULL COMMENT 'Body text of observation or feedback',
    note_type           ENUM('praise', 'warning', 'feedback', 'milestone') NOT NULL DEFAULT 'feedback' COMMENT 'Classification of observation',
    created_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Timestamp when note was published',
    PRIMARY KEY (note_id),
    CONSTRAINT fk_progress_notes_student FOREIGN KEY (student_id) REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_progress_notes_class FOREIGN KEY (class_id) REFERENCES classes(class_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_progress_notes_written_by FOREIGN KEY (written_by) REFERENCES users(user_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_progress_student (student_id),
    INDEX idx_progress_class (class_id),
    INDEX idx_progress_type (note_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Table 17 (Table 23). Progress_notes table';

-- ============================================================================
-- 5. FINANCIAL BILLING, TUITION & INVOICING
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Table 18. Tuition_invoices table (Table 24 in Report)
-- Monthly billing statements generated for enrolled students in class sections.
-- ----------------------------------------------------------------------------
CREATE TABLE tuition_invoices (
    invoice_id          INT             NOT NULL AUTO_INCREMENT COMMENT 'Unique identifier for tuition invoice',
    student_id          INT             NOT NULL COMMENT 'Identifier of student billed',
    class_id            INT             NOT NULL COMMENT 'Identifier of class section for which tuition is billed',
    period_month        TINYINT         NOT NULL COMMENT 'Billing calendar month (1 to 12)',
    period_year         SMALLINT        NOT NULL COMMENT 'Billing calendar year (e.g., 2026)',
    amount_due          DECIMAL(12,2)   NOT NULL COMMENT 'Total billed tuition amount in VND',
    due_date            DATE            NOT NULL COMMENT 'Payment deadline date',
    status              ENUM('unpaid', 'paid', 'overdue', 'pending_adjustment') NOT NULL DEFAULT 'unpaid' COMMENT 'Current invoice status',
    PRIMARY KEY (invoice_id),
    CONSTRAINT fk_tuition_invoices_student FOREIGN KEY (student_id) REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_tuition_invoices_class FOREIGN KEY (class_id) REFERENCES classes(class_id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_invoices_student (student_id),
    INDEX idx_invoices_class (class_id),
    INDEX idx_invoices_status (status),
    INDEX idx_invoices_period (period_year, period_month)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Table 18 (Table 24). Tuition_invoices table';

-- ----------------------------------------------------------------------------
-- Table 19. Payment table (Table 25 in Report)
-- Settled monetary transactions recorded against issued tuition invoices.
-- [C-06] Ưu tiên Cash và Bank Transfer tại quầy; VNPay/MoMo đánh dấu Optional Phase 2.
-- ----------------------------------------------------------------------------
CREATE TABLE payment (
    payment_id          INT             NOT NULL AUTO_INCREMENT COMMENT 'Unique identifier for payment transaction',
    invoice_id          INT             NOT NULL COMMENT 'Identifier of settled invoice',
    amount              DECIMAL(12,2)   NOT NULL COMMENT 'Amount paid in VND',
    payment_method      ENUM('bank_transfer', 'vnpay', 'momo') NOT NULL DEFAULT 'bank_transfer' COMMENT 'Online settlement channel',
    transaction_code    VARCHAR(100)    NULL COMMENT 'Bank transfer reference or gateway transaction ID',
    paid_at             DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Payment settlement timestamp',
    paid_by_user_id     INT             NULL COMMENT 'User identifier of student or parent who made payment',
    recorded_by         INT             NULL COMMENT 'Admin staff who acknowledged cash or bank transfer at counter',
    note                TEXT            NULL COMMENT 'Auditing notes',
    PRIMARY KEY (payment_id),
    CONSTRAINT fk_payment_invoice FOREIGN KEY (invoice_id) REFERENCES tuition_invoices(invoice_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_payment_paid_by FOREIGN KEY (paid_by_user_id) REFERENCES users(user_id) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_payment_recorded_by FOREIGN KEY (recorded_by) REFERENCES users(user_id) ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_payment_invoice (invoice_id),
    INDEX idx_payment_method (payment_method),
    INDEX idx_payment_date (paid_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Table 19 (Table 25). Payment table';

-- ============================================================================
-- 6. EXCEPTIONS, APPROVALS, FEEDBACK & NOTIFICATIONS
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Table 20. Approval_requests table (Table 26 in Report)
-- Exceptions workflow requiring administrative approval by Center Manager or Admin Staff.
-- [C-01] Xử lý phản hồi (Feedback) cho Student, Parent, Teacher, TA định tuyến tới Admin Staff.
-- [C-07] Mở rộng ENUM request_type thêm 'class_transfer' và 'feedback'.
-- ----------------------------------------------------------------------------
CREATE TABLE approval_requests (
    request_id          INT             NOT NULL AUTO_INCREMENT COMMENT 'Unique identifier for approval request',
    request_code        VARCHAR(20)     NOT NULL UNIQUE COMMENT 'Human-readable tracking code (e.g., AR0001)',
    request_type        ENUM(
                            'tuition_adjustment', 
                            'refund', 
                            'credit', 
                            'due_date_extension', 
                            'leave_request', 
                            'class_transfer', 
                            'feedback'
                        ) NOT NULL COMMENT '[C-01 & C-07] Loại yêu cầu phê duyệt hoặc phản hồi đóng góp ý kiến',
    title               VARCHAR(255)    NULL COMMENT 'Tiêu đề yêu cầu / phản hồi',
    description         TEXT            NULL COMMENT 'Mô tả chi tiết nội dung yêu cầu / phản hồi',
    student_id          INT             NULL COMMENT 'Identifier of associated student (if applicable)',
    invoice_id          INT             NULL COMMENT 'Identifier of targeted invoice (if applicable)',
    class_id            INT             NULL COMMENT 'Identifier of targeted class section (if applicable)',
    requested_by        INT             NOT NULL COMMENT 'Identifier of user initiating request (Student, Parent, Teacher, TA, Staff)',
    reviewed_by         INT             NULL COMMENT 'Identifier of Manager or Admin Staff reviewing request/feedback',
    priority            ENUM('high', 'medium', 'low') NOT NULL DEFAULT 'medium' COMMENT 'Urgency level',
    status              ENUM('pending', 'approved', 'rejected', 'cancelled') NOT NULL DEFAULT 'pending' COMMENT 'Processing status',
    reason              TEXT            NULL COMMENT 'Detailed justification, application content, or feedback body text',
    created_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Timestamp when request was submitted',
    reviewed_at         DATETIME        NULL COMMENT 'Timestamp when reviewed/responded',
    review_notes        TEXT            NULL COMMENT 'Response or explanation remarks from reviewer',
    PRIMARY KEY (request_id),
    CONSTRAINT fk_approval_student FOREIGN KEY (student_id) REFERENCES users(user_id) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_approval_invoice FOREIGN KEY (invoice_id) REFERENCES tuition_invoices(invoice_id) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_approval_class FOREIGN KEY (class_id) REFERENCES classes(class_id) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_approval_requested_by FOREIGN KEY (requested_by) REFERENCES users(user_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_approval_reviewed_by FOREIGN KEY (reviewed_by) REFERENCES users(user_id) ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_approval_code (request_code),
    INDEX idx_approval_status (status),
    INDEX idx_approval_type (request_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Table 20 (Table 26). Approval_requests & Feedback table';

-- ----------------------------------------------------------------------------
-- Table 21. Notifications table (Table 27 in Report)
-- System broadcast and targeted personal notifications.
-- ----------------------------------------------------------------------------
CREATE TABLE notifications (
    notification_id     INT             NOT NULL AUTO_INCREMENT COMMENT 'Unique identifier for notification',
    user_id             INT             NULL COMMENT 'Target recipient user ID (NULL for broadcast announcements)',
    class_id            INT             NULL COMMENT 'Target class section for class-wide broadcasts',
    title               VARCHAR(200)    NOT NULL COMMENT 'Headline of notification',
    content             TEXT            NOT NULL COMMENT 'Full message content body',
    type                ENUM('system', 'homework', 'attendance', 'tuition', 'schedule', 'class') NOT NULL DEFAULT 'system' COMMENT 'Category of notification',
    is_read             BOOLEAN         NOT NULL DEFAULT FALSE COMMENT 'Whether recipient has marked notification as read',
    created_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Timestamp when notification was issued',
    PRIMARY KEY (notification_id),
    CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_notifications_class FOREIGN KEY (class_id) REFERENCES classes(class_id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_notifications_user (user_id),
    INDEX idx_notifications_class (class_id),
    INDEX idx_notifications_type (type),
    INDEX idx_notifications_read (is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Table 21 (Table 27). Notifications table';

-- ----------------------------------------------------------------------------
-- Table 22. Center_settings table (Table 28 in Report)
-- Center-wide global operational configuration key-value storage.
-- ----------------------------------------------------------------------------
CREATE TABLE center_settings (
    setting_id          INT             NOT NULL AUTO_INCREMENT COMMENT 'Unique identifier for setting entry',
    setting_key         VARCHAR(100)    NOT NULL UNIQUE COMMENT 'Unique configuration key',
    setting_value       TEXT            NULL COMMENT 'Stored configuration value',
    updated_by          INT             NULL COMMENT 'Identifier of manager who last modified setting',
    PRIMARY KEY (setting_id),
    CONSTRAINT fk_center_settings_updated_by FOREIGN KEY (updated_by) REFERENCES users(user_id) ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_settings_key (setting_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Table 22 (Table 28). Center_settings table';

-- ============================================================================
-- 7. SAMPLE SEED DATA (DỮ LIỆU MẪU KIỂM THỬ ĐẦY ĐỦ CHO CAPSTONE 2)
-- ============================================================================

-- 1. Roles (Thêm role parent theo C-02)
INSERT INTO roles (role_id, role_name, description) VALUES
(1, 'center_manager', 'Highest system authority: center operations, user & role management, financial approvals, settings'),
(2, 'admin_staff', 'Administrative operations: student enrollment, scheduling, attendance oversight, tuition invoicing & payment collection, feedback response'),
(3, 'teacher', 'Academic instructor: curriculum content, assignments, grading, attendance tracking, student progress notes'),
(4, 'teaching_assistant', 'Academic support: assists grading, attendance logging, student follow-ups'),
(5, 'student', 'Enrolled learner: view schedules, attendance, grades, submit assignments, pay tuition, submit feedback'),
(6, 'parent', 'Parent / Legal guardian: view children progress, schedules, attendance, grades, tuition, and submit feedback');

-- 2. Users (Tạo tài khoản theo chuẩn Capstone 1 & bổ sung Parent theo C-02)
INSERT INTO users (user_id, user_code, full_name, email, phone, password_hash, avatar_url, date_of_birth, gender, specialty, enrolled_since, status, created_at) VALUES
(1, 'MGR001', 'Nguyễn Văn Quản Lý', 'manager@edutrack.edu.vn', '0901234567', '$2a$11$N87b.lQp8p9m0Yl4w1e5xe4RzO.B1hO.3r0f7a2.b3c4d5e6f7g8h', 'https://api.dicebear.com/7.x/avataaars/svg?seed=manager', '1985-05-15', 'male', 'Center Administration', '2022-01-01', 'active', NOW()),
(2, 'ADM001', 'Trần Thị Nhân Viên', 'admin@edutrack.edu.vn', '0912345678', '$2a$11$N87b.lQp8p9m0Yl4w1e5xe4RzO.B1hO.3r0f7a2.b3c4d5e6f7g8h', 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin', '1992-08-20', 'female', 'Customer Service & Billing', '2023-03-15', 'active', NOW()),
(3, 'TC001', 'ThS. Hoàng Quốc Việt', 'viet.hoang@edutrack.edu.vn', '0923456789', '$2a$11$N87b.lQp8p9m0Yl4w1e5xe4RzO.B1hO.3r0f7a2.b3c4d5e6f7g8h', 'https://api.dicebear.com/7.x/avataaars/svg?seed=viet', '1990-11-10', 'male', 'Mathematics', '2023-06-01', 'active', NOW()),
(4, 'TC002', 'ThS. Huỳnh Khánh Duy', 'duy.huynh@edutrack.edu.vn', '0934567890', '$2a$11$N87b.lQp8p9m0Yl4w1e5xe4RzO.B1hO.3r0f7a2.b3c4d5e6f7g8h', 'https://api.dicebear.com/7.x/avataaars/svg?seed=duy', '1993-04-25', 'male', 'Physics', '2023-08-01', 'active', NOW()),
(5, 'TA001', 'Âu Dương Tài', 'tai.auduong@edutrack.edu.vn', '0945678901', '$2a$11$N87b.lQp8p9m0Yl4w1e5xe4RzO.B1hO.3r0f7a2.b3c4d5e6f7g8h', 'https://api.dicebear.com/7.x/avataaars/svg?seed=tai', '1998-09-12', 'male', 'Teaching Assistant', '2024-01-10', 'active', NOW()),
(6, 'STU001', 'Lê Văn An', 'an.le@student.edutrack.vn', '0956789012', '$2a$11$N87b.lQp8p9m0Yl4w1e5xe4RzO.B1hO.3r0f7a2.b3c4d5e6f7g8h', 'https://api.dicebear.com/7.x/avataaars/svg?seed=an', '2010-02-14', 'male', NULL, '2025-01-05', 'active', NOW()),
(7, 'STU002', 'Phạm Thị Bích', 'bich.pham@student.edutrack.vn', '0967890123', '$2a$11$N87b.lQp8p9m0Yl4w1e5xe4RzO.B1hO.3r0f7a2.b3c4d5e6f7g8h', 'https://api.dicebear.com/7.x/avataaars/svg?seed=bich', '2010-07-22', 'female', NULL, '2025-01-05', 'active', NOW()),
(8, 'STU003', 'Đặng Minh Cường', 'cuong.dang@student.edutrack.vn', '0978901234', '$2a$11$N87b.lQp8p9m0Yl4w1e5xe4RzO.B1hO.3r0f7a2.b3c4d5e6f7g8h', 'https://api.dicebear.com/7.x/avataaars/svg?seed=cuong', '2010-12-05', 'male', NULL, '2025-01-10', 'active', NOW()),
(9, 'PAR001', 'Lê Văn Nam', 'nam.le@parent.edutrack.vn', '0981112233', '$2a$11$N87b.lQp8p9m0Yl4w1e5xe4RzO.B1hO.3r0f7a2.b3c4d5e6f7g8h', 'https://api.dicebear.com/7.x/avataaars/svg?seed=parent1', '1980-04-12', 'male', 'Phụ huynh em Lê Văn An', '2025-01-05', 'active', NOW()),
(10, 'PAR002', 'Phạm Thị Mai', 'mai.pham@parent.edutrack.vn', '0982223344', '$2a$11$N87b.lQp8p9m0Yl4w1e5xe4RzO.B1hO.3r0f7a2.b3c4d5e6f7g8h', 'https://api.dicebear.com/7.x/avataaars/svg?seed=parent2', '1982-09-18', 'female', 'Phụ huynh em Phạm Thị Bích', '2025-01-05', 'active', NOW());

-- 3. User Roles
INSERT INTO user_roles (user_id, role_id) VALUES
(1, 1), -- MGR001 -> center_manager
(2, 2), -- ADM001 -> admin_staff
(3, 3), -- TC001 -> teacher
(4, 3), -- TC002 -> teacher
(5, 4), -- TA001 -> teaching_assistant
(6, 5), -- STU001 -> student
(7, 5), -- STU002 -> student
(8, 5), -- STU003 -> student
(9, 6), -- PAR001 -> parent
(10, 6); -- PAR002 -> parent

-- 4. Parent Students (Liên kết phụ huynh - học sinh theo C-02)
INSERT INTO parent_students (parent_id, student_id, relationship, is_primary_contact, created_at) VALUES
(9, 6, 'Father', TRUE, NOW()),  -- Lê Văn Nam là bố của Lê Văn An
(10, 7, 'Mother', TRUE, NOW()); -- Phạm Thị Mai là mẹ của Phạm Thị Bích

-- 5. Subjects
INSERT INTO subjects (subject_id, subject_code, subject_name, description) VALUES
(1, 'MATH', 'Mathematics', 'Core mathematical concepts, algebra, geometry, calculus and logical problem solving.'),
(2, 'PHYS', 'Physics', 'Mechanics, thermodynamics, electromagnetism, and modern physical foundations.'),
(3, 'CHEM', 'Chemistry', 'Inorganic, organic chemistry, reaction stoichiometry, and laboratory techniques.'),
(4, 'ENG', 'English Language', 'Grammar, reading comprehension, writing proficiency, and IELTS foundation.');

-- 6. Classes
INSERT INTO classes (class_id, class_name, subject_id, room, tuition_fee, start_date, end_date, status) VALUES
(1, 'Class 9 - Advanced Mathematics', 1, 'Room 201', 1500000.00, '2026-09-01', '2026-12-31', 'active'),
(2, 'Class 9 - Intensive Physics', 2, 'Room 202', 1400000.00, '2026-09-01', '2026-12-31', 'active'),
(3, 'Class 8 - English Foundation', 4, 'Lab 101', 1800000.00, '2026-09-15', '2027-01-15', 'active');

-- 7. Teacher Classes
INSERT INTO teacher_classes (teacher_id, class_id, assigned_at, status) VALUES
(3, 1, NOW(), 'active'), -- Hoang Quoc Viet teaches Advanced Math
(4, 2, NOW(), 'active'); -- Huynh Khanh Duy teaches Intensive Physics

-- 8. TA Classes
INSERT INTO ta_classes (ta_id, class_id, assigned_at, status) VALUES
(5, 1, NOW(), 'active'), -- Au Duong Tai assists Advanced Math
(5, 2, NOW(), 'active'); -- Au Duong Tai assists Intensive Physics

-- 9. Student Classes
INSERT INTO student_classes (student_id, class_id, enrolled_date, status, dropped_at, drop_reason) VALUES
(6, 1, '2026-09-01', 'active', NULL, NULL),
(7, 1, '2026-09-01', 'active', NULL, NULL),
(8, 1, '2026-09-02', 'active', NULL, NULL),
(6, 2, '2026-09-01', 'active', NULL, NULL),
(7, 2, '2026-09-01', 'active', NULL, NULL);

-- 10. Class Schedules
INSERT INTO class_schedules (schedule_id, class_id, day_of_week, start_time, end_time, room) VALUES
(1, 1, 'monday', '18:00:00', '20:00:00', 'Room 201'),
(2, 1, 'wednesday', '18:00:00', '20:00:00', 'Room 201'),
(3, 2, 'tuesday', '18:00:00', '20:00:00', 'Room 202'),
(4, 2, 'thursday', '18:00:00', '20:00:00', 'Room 202');

-- 11. Class Sessions
INSERT INTO class_sessions (session_id, class_id, schedule_id, session_date, start_time, end_time, room, status) VALUES
(1, 1, 1, '2026-09-08', '18:00:00', '20:00:00', 'Room 201', 'completed'),
(2, 1, 2, '2026-09-10', '18:00:00', '20:00:00', 'Room 201', 'completed'),
(3, 1, 1, '2026-09-15', '18:00:00', '20:00:00', 'Room 201', 'scheduled'),
(4, 2, 3, '2026-09-09', '18:00:00', '20:00:00', 'Room 202', 'completed'),
(5, 2, 4, '2026-09-11', '18:00:00', '20:00:00', 'Room 202', 'scheduled');

-- 12. Content Units
INSERT INTO content_units (content_unit_id, class_id, parent_unit_id, title, unit_type, description, order_index) VALUES
(1, 1, NULL, 'Chapter 1: Quadratic Equations & Systems', 'chapter', 'Fundamental concepts of quadratic forms, discriminant analysis and Vieta theorem', 1),
(2, 1, 1, 'Lesson 1.1: Solving Quadratic Equations', 'lesson', 'Factoring methods and standard quadratic formula application', 1),
(3, 1, 1, 'Lesson 1.2: Vieta Formulas and Applications', 'lesson', 'Relationships between roots and polynomial coefficients', 2),
(4, 1, NULL, 'Chapter 2: Plane Trigonometry', 'chapter', 'Trigonometric ratios, sine and cosine laws', 2),
(5, 2, NULL, 'Chapter 1: Kinematics and Motion', 'chapter', 'Linear kinematics, speed, velocity, acceleration and vectors', 1);

-- 13. Attendance
INSERT INTO attendance (session_id, student_id, status, note, recorded_by) VALUES
(1, 6, 'present', 'On time and engaged', 3),
(1, 7, 'present', 'Active in class discussions', 3),
(1, 8, 'late', 'Arrived 15 minutes late with notice', 5),
(2, 6, 'present', NULL, 3),
(2, 7, 'absent', 'Sick leave approved', 5),
(2, 8, 'present', NULL, 3);

-- 14. Assignments (Thêm Rubric JSON, Answer Key và cờ AI Grading theo TC-07)
INSERT INTO assignments (assignment_id, content_unit_id, class_id, title, description, file_url, due_date, max_score, created_by, answer_key_text, answer_key_file_url, rubric_json, is_ai_grading_enabled) VALUES
(1, 2, 1, 'Homework 01: Quadratic Equations Problem Set', 'Complete problems 1 to 15 from textbook page 42. Show all calculation steps.', 'https://storage.edutrack.edu.vn/assignments/hw01_math9.pdf', '2026-09-14 23:59:00', 10.00, 3, 'Đáp án: Câu 1 x={2,3}; Câu 2 x={-1,5}; Câu 3 vô nghiệm; Câu 4 delta=16, x=4; Câu 5 x=0 hoặc x=2.', NULL, '[{"id": "crit_1", "name": "Tính chính xác của kết quả", "maxScore": 5.0, "weight": 0.5, "description": "Đúng kết quả các bài toán biến đổi"}, {"id": "crit_2", "name": "Phương pháp giải & Lập luận", "maxScore": 3.0, "weight": 0.3, "description": "Áp dụng đúng định lý Viète và công thức nghiệm"}, {"id": "crit_3", "name": "Trình bày & Ký hiệu", "maxScore": 2.0, "weight": 0.2, "description": "Các bước biến đổi rõ ràng, sạch sẽ"}]', TRUE),
(2, 3, 1, 'Quiz 01: Applications of Vieta Theorem', 'Solve 5 advanced theorem problems regarding symmetric expressions.', 'https://storage.edutrack.edu.vn/assignments/quiz01_math9.pdf', '2026-09-20 23:59:00', 10.00, 3, 'Đáp án biểu thức đối xứng x1^2 + x2^2 = S^2 - 2P.', NULL, '[{"id": "crit_1", "name": "Tính chính xác", "maxScore": 6.0, "weight": 0.6}, {"id": "crit_2", "name": "Lập luận logic", "maxScore": 4.0, "weight": 0.4}]', TRUE),
(3, 5, 2, 'Lab Report: Uniform Acceleration Experiment', 'Analyze data captured from motion sensor track.', 'https://storage.edutrack.edu.vn/assignments/lab01_phys9.pdf', '2026-09-18 23:59:00', 10.00, 4, 'Báo cáo tính toán gia tốc a = 2.45 m/s^2, sai số không quá 5%.', NULL, '[{"id": "crit_1", "name": "Số liệu thí nghiệm", "maxScore": 5.0, "weight": 0.5}, {"id": "crit_2", "name": "Phân tích đồ thị", "maxScore": 5.0, "weight": 0.5}]', TRUE);

-- 15. Submissions (Thêm ai_score, ai_feedback_json theo TC-07)
INSERT INTO submissions (submission_id, assignment_id, student_id, file_url, submitted_at, score, feedback, ai_score, ai_feedback_json, status, graded_by) VALUES
(1, 1, 6, 'https://storage.edutrack.edu.vn/submissions/stu001_hw01.pdf', '2026-09-13 20:30:00', 9.50, 'Excellent work! Detailed derivations and clean presentation.', 9.50, '{"suggestedScore": 9.5, "criteriaScores": [{"criterionId": "crit_1", "score": 5.0}, {"criterionId": "crit_2", "score": 2.8}, {"criterionId": "crit_3", "score": 1.7}]}', 'graded', 3),
(2, 1, 7, 'https://storage.edutrack.edu.vn/submissions/stu002_hw01.pdf', '2026-09-14 22:15:00', 8.00, 'Good attempt. Check signs in problem 12.', 7.80, '{"suggestedScore": 7.8, "criteriaScores": [{"criterionId": "crit_1", "score": 4.0}, {"criterionId": "crit_2", "score": 2.3}, {"criterionId": "crit_3", "score": 1.5}]}', 'graded', 5),
(3, 1, 8, 'https://storage.edutrack.edu.vn/submissions/stu003_hw01.pdf', '2026-09-15 08:10:00', NULL, NULL, NULL, NULL, 'late', NULL);

-- 16. AI Evaluations (Audit trail)
INSERT INTO ai_evaluations (evaluation_id, submission_id, requested_by, ai_score, ai_feedback, raw_response, status, created_at) VALUES
(1, 1, 3, 9.50, 'High accuracy across all 15 solutions. Clear step-by-step logic. Minor syntax abbreviation in problem 8.', '{"model":"gemini-1.5-flash","score":9.5,"confidence":0.96}', 'SUCCESS', NOW()),
(2, 2, 3, 7.80, 'Correct methodology for items 1-11. Calculation sign mistake detected in item 12.', '{"model":"gemini-1.5-flash","score":7.8,"confidence":0.92}', 'SUCCESS', NOW());

-- 17. Progress Notes
INSERT INTO progress_notes (note_id, student_id, class_id, written_by, content, note_type, created_at) VALUES
(1, 6, 1, 3, 'An exhibits outstanding mathematical intuition. Consistently achieves top marks.', 'praise', NOW()),
(2, 7, 1, 5, 'Bich missed session 2 due to illness. Followed up and shared lecture slides.', 'feedback', NOW()),
(3, 8, 1, 3, 'Cuong submitted homework 1 late. Needs to manage timetable and deadline alerts.', 'warning', NOW());

-- 18. Tuition Invoices
INSERT INTO tuition_invoices (invoice_id, student_id, class_id, period_month, period_year, amount_due, due_date, status) VALUES
(1, 6, 1, 9, 2026, 1500000.00, '2026-09-10', 'paid'),
(2, 7, 1, 9, 2026, 1500000.00, '2026-09-10', 'paid'),
(3, 8, 1, 9, 2026, 1500000.00, '2026-09-10', 'overdue'),
(4, 6, 2, 9, 2026, 1400000.00, '2026-09-10', 'paid'),
(5, 7, 2, 9, 2026, 1400000.00, '2026-09-10', 'unpaid');

-- 19. Payment
INSERT INTO payment (payment_id, invoice_id, amount, payment_method, transaction_code, paid_at, paid_by_user_id, recorded_by, note) VALUES
(1, 1, 1500000.00, 'bank_transfer', 'MBVCB.789123456', '2026-09-05 10:29:38', 9, 2, 'Settled via Vietcombank transfer by Parent Le Van Nam (PAR001)'),
(2, 2, 1500000.00, 'vnpay', 'VNPAY20260906001', '2026-09-06 14:20:00', 10, 2, 'Settled via VNPay portal by Parent Pham Thi Mai (PAR002)'),
(3, 4, 1400000.00, 'bank_transfer', 'MBTCB.992817263', '2026-09-07 09:15:22', 9, 2, 'Settled via Techcombank transfer by Parent Le Van Nam (PAR001)');

-- 20. Approval Requests (Bổ sung class_transfer & feedback theo C-01, C-07)
INSERT INTO approval_requests (request_id, request_code, request_type, title, description, student_id, invoice_id, class_id, requested_by, reviewed_by, priority, status, reason, created_at, reviewed_at, review_notes) VALUES
(1, 'AR0001', 'due_date_extension', 'Xin gia hạn nộp học phí', 'Student family had sudden medical emergency, requested 10 days extension for invoice #3.', 8, 3, 1, 2, 1, 'medium', 'approved', 'Student family had sudden medical emergency, requested 10 days extension for invoice #3.', NOW(), NOW(), 'Approved for 10-day extension until Sept 20.'),
(2, 'AR0002', 'tuition_adjustment', 'Đề xuất giảm học phí anh chị em', 'Sibling discount policy (10% off for 2nd enrolled subject). Needs manager sign-off.', 7, 5, 2, 2, NULL, 'high', 'pending', 'Sibling discount policy (10% off for 2nd enrolled subject). Needs manager sign-off.', NOW(), NULL, NULL),
(3, 'AR0003', 'leave_request', 'Xin nghỉ học buổi 2', 'Medical leave for session on 2026-09-10 with valid doctor confirmation.', 7, NULL, 1, 5, 1, 'low', 'approved', 'Medical leave for session on 2026-09-10 with valid doctor confirmation.', NOW(), NOW(), 'Approved by Manager.'),
(4, 'AR0004', 'class_transfer', 'Xin chuyển lớp Toán 9A sang 9B', '[C-03, C-07] Học sinh Đặng Minh Cường xin chuyển từ lớp Toán 9A sang lớp Toán 9B do trùng lịch trường.', 8, NULL, 1, 2, 1, 'high', 'approved', '[C-03, C-07] Học sinh Đặng Minh Cường xin chuyển từ lớp Toán 9A sang lớp Toán 9B do trùng lịch trường.', NOW(), NOW(), 'Duyệt chuyển lớp. Admin Staff thực hiện cập nhật student_classes.'),
(5, 'AR0005', 'feedback', 'Góp ý điều hòa phòng học 201', '[C-01, C-07] Em thấy phòng học 201 điều hòa bị chảy nước và hơi lạnh trong buổi học tối qua.', 6, NULL, 1, 6, 2, 'medium', 'approved', '[C-01, C-07] Em thấy phòng học 201 điều hòa bị chảy nước và hơi lạnh trong buổi học tối qua.', NOW(), NOW(), 'Trung tâm đã ghi nhận và cho bộ phận kỹ thuật bảo trì điều hòa sáng nay. Cảm ơn em!');

-- 21. Notifications
INSERT INTO notifications (notification_id, user_id, class_id, title, content, type, is_read, created_at) VALUES
(1, NULL, NULL, 'EduTrack System Welcome', 'Welcome to EduTrack! Please complete your profile information.', 'system', FALSE, NOW()),
(2, 6, 1, 'Homework 01 Graded', 'Your submission for Homework 01 has been graded: 9.5/10.0', 'homework', TRUE, NOW()),
(3, 7, 1, 'Leave Request Approved', 'Your leave request for Session 2 has been approved by the Center Manager.', 'class', FALSE, NOW()),
(4, 8, 1, 'Tuition Due Reminder', 'Tuition invoice for Class 9 Advanced Mathematics is overdue. Please settle promptly.', 'tuition', FALSE, NOW()),
(5, NULL, 1, 'Class Room Update', 'Session on 2026-09-15 will start 15 mins earlier for test review.', 'schedule', FALSE, NOW()),
(6, 9, 1, 'Tuition Receipt Acknowledged', 'Tuition for Le Van An (Class 9 Advanced Math) has been successfully recorded.', 'tuition', TRUE, NOW());

-- 22. Center Settings
INSERT INTO center_settings (setting_id, setting_key, setting_value, updated_by) VALUES
(1, 'center_name', 'EduTrack Smart Learning Center', 1),
(2, 'center_address', '123 Nguyen Van Cu, District 5, Ho Chi Minh City', 1),
(3, 'center_hotline', '1900 6868', 1),
(4, 'academic_year', '2026 - 2027', 1),
(5, 'tuition_due_day', '10', 1),
(6, 'ai_evaluation_enabled', 'true', 1),
(7, 'currency', 'VND', 1);

-- ============================================================================
-- 8. HELPER VIEWS FOR SYSTEM REPORTING
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

-- View: Parent-Children Linkage Summary [C-02]
CREATE OR REPLACE VIEW vw_parent_children_summary AS
SELECT 
    p.user_id AS parent_id,
    p.user_code AS parent_code,
    p.full_name AS parent_name,
    p.phone AS parent_phone,
    p.email AS parent_email,
    s.user_id AS student_id,
    s.user_code AS student_code,
    s.full_name AS student_name,
    ps.relationship,
    ps.is_primary_contact
FROM parent_students ps
JOIN users p ON ps.parent_id = p.user_id
JOIN users s ON ps.student_id = s.user_id;

-- ============================================================================
-- END OF SCRIPT
-- ============================================================================
