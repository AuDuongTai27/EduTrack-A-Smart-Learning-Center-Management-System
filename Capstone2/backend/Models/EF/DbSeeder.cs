using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using EduTrack.API.Models.Entities;

namespace EduTrack.API.Models.EF
{
    public static class DbSeeder
    {
        public static async Task SeedAsync(EduTrackDbContext context)
        {
            // 1. Roles
            if (!await context.Roles.AnyAsync())
            {
                var roles = new List<Role>
                {
                    new Role { RoleId = 1, RoleName = "center_manager", Description = "Highest system authority: center operations, user & role management, financial approvals, settings" },
                    new Role { RoleId = 2, RoleName = "admin_staff", Description = "Administrative operations: student enrollment, scheduling, attendance oversight, tuition invoicing & payment collection, feedback response" },
                    new Role { RoleId = 3, RoleName = "teacher", Description = "Academic instructor: curriculum content, assignments, grading, attendance tracking, student progress notes" },
                    new Role { RoleId = 4, RoleName = "teaching_assistant", Description = "Academic support: assists grading, attendance logging, student follow-ups" },
                    new Role { RoleId = 5, RoleName = "student", Description = "Enrolled learner: view schedules, attendance, grades, submit assignments, pay tuition, submit feedback" },
                    new Role { RoleId = 6, RoleName = "parent", Description = "Parent / Legal guardian: view children progress, schedules, attendance, grades, tuition, and submit feedback" }
                };
                await context.Roles.AddRangeAsync(roles);
                await context.SaveChangesAsync();
            }

            // 2. Users (10 users matching Capstone 1 Report + Parent C-02)
            if (!await context.Users.AnyAsync())
            {
                var users = new List<User>
                {
                    new User
                    {
                        UserId = 1,
                        UserCode = "MGR001",
                        FullName = "Nguyễn Văn Quản Lý",
                        Email = "manager@edutrack.edu.vn",
                        Phone = "0901234567",
                        PasswordHash = "$2a$11$N87b.lQp8p9m0Yl4w1e5xe4RzO.B1hO.3r0f7a2.b3c4d5e6f7g8h",
                        AvatarUrl = "https://api.dicebear.com/7.x/avataaars/svg?seed=manager",
                        DateOfBirth = new DateTime(1985, 5, 15),
                        Gender = "male",
                        Specialty = "Center Administration",
                        EnrolledSince = new DateTime(2022, 1, 1),
                        Status = "active",
                        CreatedAt = DateTime.UtcNow
                    },
                    new User
                    {
                        UserId = 2,
                        UserCode = "ADM001",
                        FullName = "Trần Thị Nhân Viên",
                        Email = "admin@edutrack.edu.vn",
                        Phone = "0912345678",
                        PasswordHash = "$2a$11$N87b.lQp8p9m0Yl4w1e5xe4RzO.B1hO.3r0f7a2.b3c4d5e6f7g8h",
                        AvatarUrl = "https://api.dicebear.com/7.x/avataaars/svg?seed=admin",
                        DateOfBirth = new DateTime(1992, 8, 20),
                        Gender = "female",
                        Specialty = "Customer Service & Billing",
                        EnrolledSince = new DateTime(2023, 3, 15),
                        Status = "active",
                        CreatedAt = DateTime.UtcNow
                    },
                    new User
                    {
                        UserId = 3,
                        UserCode = "TC001",
                        FullName = "ThS. Hoàng Quốc Việt",
                        Email = "viet.hoang@edutrack.edu.vn",
                        Phone = "0923456789",
                        PasswordHash = "$2a$11$N87b.lQp8p9m0Yl4w1e5xe4RzO.B1hO.3r0f7a2.b3c4d5e6f7g8h",
                        AvatarUrl = "https://api.dicebear.com/7.x/avataaars/svg?seed=viet",
                        DateOfBirth = new DateTime(1990, 11, 10),
                        Gender = "male",
                        Specialty = "Mathematics",
                        EnrolledSince = new DateTime(2023, 6, 1),
                        Status = "active",
                        CreatedAt = DateTime.UtcNow
                    },
                    new User
                    {
                        UserId = 4,
                        UserCode = "TC002",
                        FullName = "ThS. Huỳnh Khánh Duy",
                        Email = "duy.huynh@edutrack.edu.vn",
                        Phone = "0934567890",
                        PasswordHash = "$2a$11$N87b.lQp8p9m0Yl4w1e5xe4RzO.B1hO.3r0f7a2.b3c4d5e6f7g8h",
                        AvatarUrl = "https://api.dicebear.com/7.x/avataaars/svg?seed=duy",
                        DateOfBirth = new DateTime(1993, 4, 25),
                        Gender = "male",
                        Specialty = "Physics",
                        EnrolledSince = new DateTime(2023, 8, 1),
                        Status = "active",
                        CreatedAt = DateTime.UtcNow
                    },
                    new User
                    {
                        UserId = 5,
                        UserCode = "TA001",
                        FullName = "Âu Dương Tài",
                        Email = "tai.auduong@edutrack.edu.vn",
                        Phone = "0945678901",
                        PasswordHash = "$2a$11$N87b.lQp8p9m0Yl4w1e5xe4RzO.B1hO.3r0f7a2.b3c4d5e6f7g8h",
                        AvatarUrl = "https://api.dicebear.com/7.x/avataaars/svg?seed=tai",
                        DateOfBirth = new DateTime(1998, 9, 12),
                        Gender = "male",
                        Specialty = "Teaching Assistant",
                        EnrolledSince = new DateTime(2024, 1, 10),
                        Status = "active",
                        CreatedAt = DateTime.UtcNow
                    },
                    new User
                    {
                        UserId = 6,
                        UserCode = "STU001",
                        FullName = "Lê Văn An",
                        Email = "an.le@student.edutrack.vn",
                        Phone = "0956789012",
                        PasswordHash = "$2a$11$N87b.lQp8p9m0Yl4w1e5xe4RzO.B1hO.3r0f7a2.b3c4d5e6f7g8h",
                        AvatarUrl = "https://api.dicebear.com/7.x/avataaars/svg?seed=an",
                        DateOfBirth = new DateTime(2010, 2, 14),
                        Gender = "male",
                        Specialty = null,
                        EnrolledSince = new DateTime(2025, 1, 5),
                        Status = "active",
                        CreatedAt = DateTime.UtcNow
                    },
                    new User
                    {
                        UserId = 7,
                        UserCode = "STU002",
                        FullName = "Phạm Thị Bích",
                        Email = "bich.pham@student.edutrack.vn",
                        Phone = "0967890123",
                        PasswordHash = "$2a$11$N87b.lQp8p9m0Yl4w1e5xe4RzO.B1hO.3r0f7a2.b3c4d5e6f7g8h",
                        AvatarUrl = "https://api.dicebear.com/7.x/avataaars/svg?seed=bich",
                        DateOfBirth = new DateTime(2010, 7, 22),
                        Gender = "female",
                        Specialty = null,
                        EnrolledSince = new DateTime(2025, 1, 5),
                        Status = "active",
                        CreatedAt = DateTime.UtcNow
                    },
                    new User
                    {
                        UserId = 8,
                        UserCode = "STU003",
                        FullName = "Đặng Minh Cường",
                        Email = "cuong.dang@student.edutrack.vn",
                        Phone = "0978901234",
                        PasswordHash = "$2a$11$N87b.lQp8p9m0Yl4w1e5xe4RzO.B1hO.3r0f7a2.b3c4d5e6f7g8h",
                        AvatarUrl = "https://api.dicebear.com/7.x/avataaars/svg?seed=cuong",
                        DateOfBirth = new DateTime(2010, 12, 5),
                        Gender = "male",
                        Specialty = null,
                        EnrolledSince = new DateTime(2025, 1, 10),
                        Status = "active",
                        CreatedAt = DateTime.UtcNow
                    },
                    new User
                    {
                        UserId = 9,
                        UserCode = "PAR001",
                        FullName = "Lê Văn Nam",
                        Email = "nam.le@parent.edutrack.vn",
                        Phone = "0981112233",
                        PasswordHash = "$2a$11$N87b.lQp8p9m0Yl4w1e5xe4RzO.B1hO.3r0f7a2.b3c4d5e6f7g8h",
                        AvatarUrl = "https://api.dicebear.com/7.x/avataaars/svg?seed=parent1",
                        DateOfBirth = new DateTime(1980, 4, 12),
                        Gender = "male",
                        Specialty = "Phụ huynh em Lê Văn An",
                        EnrolledSince = new DateTime(2025, 1, 5),
                        Status = "active",
                        CreatedAt = DateTime.UtcNow
                    },
                    new User
                    {
                        UserId = 10,
                        UserCode = "PAR002",
                        FullName = "Phạm Thị Mai",
                        Email = "mai.pham@parent.edutrack.vn",
                        Phone = "0982223344",
                        PasswordHash = "$2a$11$N87b.lQp8p9m0Yl4w1e5xe4RzO.B1hO.3r0f7a2.b3c4d5e6f7g8h",
                        AvatarUrl = "https://api.dicebear.com/7.x/avataaars/svg?seed=parent2",
                        DateOfBirth = new DateTime(1982, 9, 18),
                        Gender = "female",
                        Specialty = "Phụ huynh em Phạm Thị Bích",
                        EnrolledSince = new DateTime(2025, 1, 5),
                        Status = "active",
                        CreatedAt = DateTime.UtcNow
                    }
                };
                await context.Users.AddRangeAsync(users);
                await context.SaveChangesAsync();
            }

            // 3. User Roles
            if (!await context.UserRoles.AnyAsync())
            {
                var userRoles = new List<UserRole>
                {
                    new UserRole { UserRoleId = 1, UserId = 1, RoleId = 1 }, // MGR001 -> center_manager
                    new UserRole { UserRoleId = 2, UserId = 2, RoleId = 2 }, // ADM001 -> admin_staff
                    new UserRole { UserRoleId = 3, UserId = 3, RoleId = 3 }, // TC001 -> teacher
                    new UserRole { UserRoleId = 4, UserId = 4, RoleId = 3 }, // TC002 -> teacher
                    new UserRole { UserRoleId = 5, UserId = 5, RoleId = 4 }, // TA001 -> teaching_assistant
                    new UserRole { UserRoleId = 6, UserId = 6, RoleId = 5 }, // STU001 -> student
                    new UserRole { UserRoleId = 7, UserId = 7, RoleId = 5 }, // STU002 -> student
                    new UserRole { UserRoleId = 8, UserId = 8, RoleId = 5 }, // STU003 -> student
                    new UserRole { UserRoleId = 9, UserId = 9, RoleId = 6 }, // PAR001 -> parent
                    new UserRole { UserRoleId = 10, UserId = 10, RoleId = 6 } // PAR002 -> parent
                };
                await context.UserRoles.AddRangeAsync(userRoles);
                await context.SaveChangesAsync();
            }

            // 4. Parent Students (C-02)
            if (!await context.ParentStudents.AnyAsync())
            {
                var parentStudents = new List<ParentStudent>
                {
                    new ParentStudent { ParentId = 9, StudentId = 6, Relationship = "Father", IsPrimaryContact = true, CreatedAt = DateTime.UtcNow },
                    new ParentStudent { ParentId = 10, StudentId = 7, Relationship = "Mother", IsPrimaryContact = true, CreatedAt = DateTime.UtcNow }
                };
                await context.ParentStudents.AddRangeAsync(parentStudents);
                await context.SaveChangesAsync();
            }

            // 5. Subjects
            if (!await context.Subjects.AnyAsync())
            {
                var subjects = new List<Subject>
                {
                    new Subject { SubjectId = 1, SubjectCode = "MATH", SubjectName = "Mathematics", Description = "Core mathematical concepts, algebra, geometry, calculus and logical problem solving." },
                    new Subject { SubjectId = 2, SubjectCode = "PHYS", SubjectName = "Physics", Description = "Mechanics, thermodynamics, electromagnetism, and modern physical foundations." },
                    new Subject { SubjectId = 3, SubjectCode = "CHEM", SubjectName = "Chemistry", Description = "Inorganic, organic chemistry, reaction stoichiometry, and laboratory techniques." },
                    new Subject { SubjectId = 4, SubjectCode = "ENG", SubjectName = "English Language", Description = "Grammar, reading comprehension, writing proficiency, and IELTS foundation." }
                };
                await context.Subjects.AddRangeAsync(subjects);
                await context.SaveChangesAsync();
            }

            // 6. Classes
            if (!await context.Classes.AnyAsync())
            {
                var classes = new List<Class>
                {
                    new Class { ClassId = 1, ClassName = "Class 9 - Advanced Mathematics", SubjectId = 1, Room = "Room 201", TuitionFee = 1500000.00m, StartDate = new DateTime(2026, 9, 1), EndDate = new DateTime(2026, 12, 31), Status = "active" },
                    new Class { ClassId = 2, ClassName = "Class 9 - Intensive Physics", SubjectId = 2, Room = "Room 202", TuitionFee = 1400000.00m, StartDate = new DateTime(2026, 9, 1), EndDate = new DateTime(2026, 12, 31), Status = "active" },
                    new Class { ClassId = 3, ClassName = "Class 8 - English Foundation", SubjectId = 4, Room = "Lab 101", TuitionFee = 1800000.00m, StartDate = new DateTime(2026, 9, 15), EndDate = new DateTime(2027, 1, 15), Status = "active" }
                };
                await context.Classes.AddRangeAsync(classes);
                await context.SaveChangesAsync();
            }

            // 7. Teacher Classes
            if (!await context.TeacherClasses.AnyAsync())
            {
                var teacherClasses = new List<TeacherClass>
                {
                    new TeacherClass { TeacherClassId = 1, TeacherId = 3, ClassId = 1, AssignedAt = DateTime.UtcNow, Status = "active" },
                    new TeacherClass { TeacherClassId = 2, TeacherId = 4, ClassId = 2, AssignedAt = DateTime.UtcNow, Status = "active" }
                };
                await context.TeacherClasses.AddRangeAsync(teacherClasses);
                await context.SaveChangesAsync();
            }

            // 8. TA Classes
            if (!await context.TaClasses.AnyAsync())
            {
                var taClasses = new List<TaClass>
                {
                    new TaClass { TaClassId = 1, TaId = 5, ClassId = 1, AssignedAt = DateTime.UtcNow, Status = "active" },
                    new TaClass { TaClassId = 2, TaId = 5, ClassId = 2, AssignedAt = DateTime.UtcNow, Status = "active" }
                };
                await context.TaClasses.AddRangeAsync(taClasses);
                await context.SaveChangesAsync();
            }

            // 9. Student Classes
            if (!await context.StudentClasses.AnyAsync())
            {
                var studentClasses = new List<StudentClass>
                {
                    new StudentClass { ScId = 1, StudentId = 6, ClassId = 1, EnrolledDate = new DateTime(2026, 9, 1), Status = "active", DroppedAt = null, DropReason = null },
                    new StudentClass { ScId = 2, StudentId = 7, ClassId = 1, EnrolledDate = new DateTime(2026, 9, 1), Status = "active", DroppedAt = null, DropReason = null },
                    new StudentClass { ScId = 3, StudentId = 8, ClassId = 1, EnrolledDate = new DateTime(2026, 9, 2), Status = "active", DroppedAt = null, DropReason = null },
                    new StudentClass { ScId = 4, StudentId = 6, ClassId = 2, EnrolledDate = new DateTime(2026, 9, 1), Status = "active", DroppedAt = null, DropReason = null },
                    new StudentClass { ScId = 5, StudentId = 7, ClassId = 2, EnrolledDate = new DateTime(2026, 9, 1), Status = "active", DroppedAt = null, DropReason = null }
                };
                await context.StudentClasses.AddRangeAsync(studentClasses);
                await context.SaveChangesAsync();
            }

            // 10. Class Schedules
            if (!await context.ClassSchedules.AnyAsync())
            {
                var schedules = new List<ClassSchedule>
                {
                    new ClassSchedule { ScheduleId = 1, ClassId = 1, DayOfWeek = "monday", StartTime = new TimeSpan(18, 0, 0), EndTime = new TimeSpan(20, 0, 0), Room = "Room 201" },
                    new ClassSchedule { ScheduleId = 2, ClassId = 1, DayOfWeek = "wednesday", StartTime = new TimeSpan(18, 0, 0), EndTime = new TimeSpan(20, 0, 0), Room = "Room 201" },
                    new ClassSchedule { ScheduleId = 3, ClassId = 2, DayOfWeek = "tuesday", StartTime = new TimeSpan(18, 0, 0), EndTime = new TimeSpan(20, 0, 0), Room = "Room 202" },
                    new ClassSchedule { ScheduleId = 4, ClassId = 2, DayOfWeek = "thursday", StartTime = new TimeSpan(18, 0, 0), EndTime = new TimeSpan(20, 0, 0), Room = "Room 202" }
                };
                await context.ClassSchedules.AddRangeAsync(schedules);
                await context.SaveChangesAsync();
            }

            // 11. Class Sessions
            if (!await context.ClassSessions.AnyAsync())
            {
                var sessions = new List<ClassSession>
                {
                    new ClassSession { SessionId = 1, ClassId = 1, ScheduleId = 1, SessionDate = new DateTime(2026, 9, 8), StartTime = new TimeSpan(18, 0, 0), EndTime = new TimeSpan(20, 0, 0), Room = "Room 201", Status = "completed" },
                    new ClassSession { SessionId = 2, ClassId = 1, ScheduleId = 2, SessionDate = new DateTime(2026, 9, 10), StartTime = new TimeSpan(18, 0, 0), EndTime = new TimeSpan(20, 0, 0), Room = "Room 201", Status = "completed" },
                    new ClassSession { SessionId = 3, ClassId = 1, ScheduleId = 1, SessionDate = new DateTime(2026, 9, 15), StartTime = new TimeSpan(18, 0, 0), EndTime = new TimeSpan(20, 0, 0), Room = "Room 201", Status = "scheduled" },
                    new ClassSession { SessionId = 4, ClassId = 2, ScheduleId = 3, SessionDate = new DateTime(2026, 9, 9), StartTime = new TimeSpan(18, 0, 0), EndTime = new TimeSpan(20, 0, 0), Room = "Room 202", Status = "completed" },
                    new ClassSession { SessionId = 5, ClassId = 2, ScheduleId = 4, SessionDate = new DateTime(2026, 9, 11), StartTime = new TimeSpan(18, 0, 0), EndTime = new TimeSpan(20, 0, 0), Room = "Room 202", Status = "scheduled" }
                };
                await context.ClassSessions.AddRangeAsync(sessions);
                await context.SaveChangesAsync();
            }

            // 12. Content Units
            if (!await context.ContentUnits.AnyAsync())
            {
                var units = new List<ContentUnit>
                {
                    new ContentUnit { ContentUnitId = 1, ClassId = 1, ParentUnitId = null, Title = "Chapter 1: Quadratic Equations & Systems", UnitType = "chapter", Description = "Fundamental concepts of quadratic forms, discriminant analysis and Vieta theorem", OrderIndex = 1 },
                    new ContentUnit { ContentUnitId = 2, ClassId = 1, ParentUnitId = 1, Title = "Lesson 1.1: Solving Quadratic Equations", UnitType = "lesson", Description = "Factoring methods and standard quadratic formula application", OrderIndex = 1 },
                    new ContentUnit { ContentUnitId = 3, ClassId = 1, ParentUnitId = 1, Title = "Lesson 1.2: Vieta Formulas and Applications", UnitType = "lesson", Description = "Relationships between roots and polynomial coefficients", OrderIndex = 2 },
                    new ContentUnit { ContentUnitId = 4, ClassId = 1, ParentUnitId = null, Title = "Chapter 2: Plane Trigonometry", UnitType = "chapter", Description = "Trigonometric ratios, sine and cosine laws", OrderIndex = 2 },
                    new ContentUnit { ContentUnitId = 5, ClassId = 2, ParentUnitId = null, Title = "Chapter 1: Kinematics and Motion", UnitType = "chapter", Description = "Linear kinematics, speed, velocity, acceleration and vectors", OrderIndex = 1 }
                };
                await context.ContentUnits.AddRangeAsync(units);
                await context.SaveChangesAsync();
            }

            // 13. Attendance
            if (!await context.Attendances.AnyAsync())
            {
                var attendances = new List<Attendance>
                {
                    new Attendance { AttendanceId = 1, SessionId = 1, StudentId = 6, Status = "present", Note = "On time and engaged", RecordedBy = 3, RecordedAt = DateTime.UtcNow },
                    new Attendance { AttendanceId = 2, SessionId = 1, StudentId = 7, Status = "present", Note = "Active in class discussions", RecordedBy = 3, RecordedAt = DateTime.UtcNow },
                    new Attendance { AttendanceId = 3, SessionId = 1, StudentId = 8, Status = "late", Note = "Arrived 15 minutes late with notice", RecordedBy = 5, RecordedAt = DateTime.UtcNow },
                    new Attendance { AttendanceId = 4, SessionId = 2, StudentId = 6, Status = "present", Note = null, RecordedBy = 3, RecordedAt = DateTime.UtcNow },
                    new Attendance { AttendanceId = 5, SessionId = 2, StudentId = 7, Status = "absent", Note = "Sick leave approved", RecordedBy = 5, RecordedAt = DateTime.UtcNow },
                    new Attendance { AttendanceId = 6, SessionId = 2, StudentId = 8, Status = "present", Note = null, RecordedBy = 3, RecordedAt = DateTime.UtcNow }
                };
                await context.Attendances.AddRangeAsync(attendances);
                await context.SaveChangesAsync();
            }

            // 14. Assignments (TC-07 Rubric)
            if (!await context.Assignments.AnyAsync())
            {
                var assignments = new List<Assignment>
                {
                    new Assignment
                    {
                        AssignmentId = 1,
                        ContentUnitId = 2,
                        ClassId = 1,
                        Title = "Homework 01: Quadratic Equations Problem Set",
                        Description = "Complete problems 1 to 15 from textbook page 42. Show all calculation steps.",
                        FileUrl = "https://storage.edutrack.edu.vn/assignments/hw01_math9.pdf",
                        DueDate = new DateTime(2026, 9, 14, 23, 59, 0),
                        MaxScore = 10.00m,
                        CreatedBy = 3,
                        AnswerKeyText = "Đáp án: Câu 1 x={2,3}; Câu 2 x={-1,5}; Câu 3 vô nghiệm; Câu 4 delta=16, x=4; Câu 5 x=0 hoặc x=2.",
                        AnswerKeyFileUrl = null,
                        RubricJson = "[{\"id\": \"crit_1\", \"name\": \"Tính chính xác của kết quả\", \"maxScore\": 5.0, \"weight\": 0.5, \"description\": \"Đúng kết quả các bài toán biến đổi\"}, {\"id\": \"crit_2\", \"name\": \"Phương pháp giải & Lập luận\", \"maxScore\": 3.0, \"weight\": 0.3, \"description\": \"Áp dụng đúng định lý Viète và công thức nghiệm\"}, {\"id\": \"crit_3\", \"name\": \"Trình bày & Ký hiệu\", \"maxScore\": 2.0, \"weight\": 0.2, \"description\": \"Các bước biến đổi rõ ràng, sạch sẽ\"}]",
                        IsAiGradingEnabled = true
                    },
                    new Assignment
                    {
                        AssignmentId = 2,
                        ContentUnitId = 3,
                        ClassId = 1,
                        Title = "Quiz 01: Applications of Vieta Theorem",
                        Description = "Solve 5 advanced theorem problems regarding symmetric expressions.",
                        FileUrl = "https://storage.edutrack.edu.vn/assignments/quiz01_math9.pdf",
                        DueDate = new DateTime(2026, 9, 20, 23, 59, 0),
                        MaxScore = 10.00m,
                        CreatedBy = 3,
                        AnswerKeyText = "Đáp án biểu thức đối xứng x1^2 + x2^2 = S^2 - 2P.",
                        AnswerKeyFileUrl = null,
                        RubricJson = "[{\"id\": \"crit_1\", \"name\": \"Tính chính xác\", \"maxScore\": 6.0, \"weight\": 0.6}, {\"id\": \"crit_2\", \"name\": \"Lập luận logic\", \"maxScore\": 4.0, \"weight\": 0.4}]",
                        IsAiGradingEnabled = true
                    },
                    new Assignment
                    {
                        AssignmentId = 3,
                        ContentUnitId = 5,
                        ClassId = 2,
                        Title = "Lab Report: Uniform Acceleration Experiment",
                        Description = "Analyze data captured from motion sensor track.",
                        FileUrl = "https://storage.edutrack.edu.vn/assignments/lab01_phys9.pdf",
                        DueDate = new DateTime(2026, 9, 18, 23, 59, 0),
                        MaxScore = 10.00m,
                        CreatedBy = 4,
                        AnswerKeyText = "Báo cáo tính toán gia tốc a = 2.45 m/s^2, sai số không quá 5%.",
                        AnswerKeyFileUrl = null,
                        RubricJson = "[{\"id\": \"crit_1\", \"name\": \"Số liệu thí nghiệm\", \"maxScore\": 5.0, \"weight\": 0.5}, {\"id\": \"crit_2\", \"name\": \"Phân tích đồ thị\", \"maxScore\": 5.0, \"weight\": 0.5}]",
                        IsAiGradingEnabled = true
                    }
                };
                await context.Assignments.AddRangeAsync(assignments);
                await context.SaveChangesAsync();
            }

            // 15. Submissions
            if (!await context.Submissions.AnyAsync())
            {
                var submissions = new List<Submission>
                {
                    new Submission
                    {
                        SubmissionId = 1,
                        AssignmentId = 1,
                        StudentId = 6,
                        FileUrl = "https://storage.edutrack.edu.vn/submissions/stu001_hw01.pdf",
                        SubmittedAt = new DateTime(2026, 9, 13, 20, 30, 0),
                        Score = 9.50m,
                        Feedback = "Excellent work! Detailed derivations and clean presentation.",
                        AiScore = 9.50m,
                        AiFeedbackJson = "{\"suggestedScore\": 9.5, \"criteriaScores\": [{\"criterionId\": \"crit_1\", \"score\": 5.0}, {\"criterionId\": \"crit_2\", \"score\": 2.8}, {\"criterionId\": \"crit_3\", \"score\": 1.7}]}",
                        Status = "graded",
                        GradedBy = 3
                    },
                    new Submission
                    {
                        SubmissionId = 2,
                        AssignmentId = 1,
                        StudentId = 7,
                        FileUrl = "https://storage.edutrack.edu.vn/submissions/stu002_hw01.pdf",
                        SubmittedAt = new DateTime(2026, 9, 14, 22, 15, 0),
                        Score = 8.00m,
                        Feedback = "Good attempt. Check signs in problem 12.",
                        AiScore = 7.80m,
                        AiFeedbackJson = "{\"suggestedScore\": 7.8, \"criteriaScores\": [{\"criterionId\": \"crit_1\", \"score\": 4.0}, {\"criterionId\": \"crit_2\", \"score\": 2.3}, {\"criterionId\": \"crit_3\", \"score\": 1.5}]}",
                        Status = "graded",
                        GradedBy = 5
                    },
                    new Submission
                    {
                        SubmissionId = 3,
                        AssignmentId = 1,
                        StudentId = 8,
                        FileUrl = "https://storage.edutrack.edu.vn/submissions/stu003_hw01.pdf",
                        SubmittedAt = new DateTime(2026, 9, 15, 8, 10, 0),
                        Score = null,
                        Feedback = null,
                        AiScore = null,
                        AiFeedbackJson = null,
                        Status = "late",
                        GradedBy = null
                    }
                };
                await context.Submissions.AddRangeAsync(submissions);
                await context.SaveChangesAsync();
            }

            // 16. AI Evaluations
            if (!await context.AiEvaluations.AnyAsync())
            {
                var evaluations = new List<AiEvaluation>
                {
                    new AiEvaluation
                    {
                        EvaluationId = 1,
                        SubmissionId = 1,
                        RequestedBy = 3,
                        AiScore = 9.50m,
                        AiFeedback = "High accuracy across all 15 solutions. Clear step-by-step logic. Minor syntax abbreviation in problem 8.",
                        RawResponse = "{\"model\":\"gemini-1.5-flash\",\"score\":9.5,\"confidence\":0.96}",
                        Status = "SUCCESS",
                        CreatedAt = DateTime.UtcNow
                    },
                    new AiEvaluation
                    {
                        EvaluationId = 2,
                        SubmissionId = 2,
                        RequestedBy = 3,
                        AiScore = 7.80m,
                        AiFeedback = "Correct methodology for items 1-11. Calculation sign mistake detected in item 12.",
                        RawResponse = "{\"model\":\"gemini-1.5-flash\",\"score\":7.8,\"confidence\":0.92}",
                        Status = "SUCCESS",
                        CreatedAt = DateTime.UtcNow
                    }
                };
                await context.AiEvaluations.AddRangeAsync(evaluations);
                await context.SaveChangesAsync();
            }

            // 17. Progress Notes
            if (!await context.ProgressNotes.AnyAsync())
            {
                var notes = new List<ProgressNote>
                {
                    new ProgressNote { NoteId = 1, StudentId = 6, ClassId = 1, WrittenBy = 3, Content = "An exhibits outstanding mathematical intuition. Consistently achieves top marks.", NoteType = "praise", CreatedAt = DateTime.UtcNow },
                    new ProgressNote { NoteId = 2, StudentId = 7, ClassId = 1, WrittenBy = 5, Content = "Bich missed session 2 due to illness. Followed up and shared lecture slides.", NoteType = "feedback", CreatedAt = DateTime.UtcNow },
                    new ProgressNote { NoteId = 3, StudentId = 8, ClassId = 1, WrittenBy = 3, Content = "Cuong submitted homework 1 late. Needs to manage timetable and deadline alerts.", NoteType = "warning", CreatedAt = DateTime.UtcNow }
                };
                await context.ProgressNotes.AddRangeAsync(notes);
                await context.SaveChangesAsync();
            }

            // 18. Tuition Invoices
            if (!await context.TuitionInvoices.AnyAsync())
            {
                var invoices = new List<TuitionInvoice>
                {
                    new TuitionInvoice { InvoiceId = 1, StudentId = 6, ClassId = 1, PeriodMonth = 9, PeriodYear = 2026, AmountDue = 1500000.00m, DueDate = new DateTime(2026, 9, 10), Status = "paid" },
                    new TuitionInvoice { InvoiceId = 2, StudentId = 7, ClassId = 1, PeriodMonth = 9, PeriodYear = 2026, AmountDue = 1500000.00m, DueDate = new DateTime(2026, 9, 10), Status = "paid" },
                    new TuitionInvoice { InvoiceId = 3, StudentId = 8, ClassId = 1, PeriodMonth = 9, PeriodYear = 2026, AmountDue = 1500000.00m, DueDate = new DateTime(2026, 9, 10), Status = "overdue" },
                    new TuitionInvoice { InvoiceId = 4, StudentId = 6, ClassId = 2, PeriodMonth = 9, PeriodYear = 2026, AmountDue = 1400000.00m, DueDate = new DateTime(2026, 9, 10), Status = "paid" },
                    new TuitionInvoice { InvoiceId = 5, StudentId = 7, ClassId = 2, PeriodMonth = 9, PeriodYear = 2026, AmountDue = 1400000.00m, DueDate = new DateTime(2026, 9, 10), Status = "unpaid" }
                };
                await context.TuitionInvoices.AddRangeAsync(invoices);
                await context.SaveChangesAsync();
            }

            // 19. Payments (Online methods: bank_transfer, vnpay, momo)
            if (!await context.Payments.AnyAsync())
            {
                var payments = new List<Payment>
                {
                    new Payment { PaymentId = 1, InvoiceId = 1, Amount = 1500000.00m, PaymentMethod = "bank_transfer", TransactionCode = "MBVCB.789123456", PaidAt = new DateTime(2026, 9, 5, 10, 29, 38), PaidByUserId = 9, RecordedBy = 2, Note = "Settled via Vietcombank transfer by Parent Le Van Nam (PAR001)" },
                    new Payment { PaymentId = 2, InvoiceId = 2, Amount = 1500000.00m, PaymentMethod = "vnpay", TransactionCode = "VNPAY20260906001", PaidAt = new DateTime(2026, 9, 6, 14, 20, 0), PaidByUserId = 10, RecordedBy = 2, Note = "Settled via VNPay portal by Parent Pham Thi Mai (PAR002)" },
                    new Payment { PaymentId = 3, InvoiceId = 4, Amount = 1400000.00m, PaymentMethod = "bank_transfer", TransactionCode = "MBTCB.992817263", PaidAt = new DateTime(2026, 9, 7, 9, 15, 22), PaidByUserId = 9, RecordedBy = 2, Note = "Settled via Techcombank transfer by Parent Le Van Nam (PAR001)" }
                };
                await context.Payments.AddRangeAsync(payments);
                await context.SaveChangesAsync();
            }

            // 20. Approval Requests (C-01, C-03, C-07)
            if (!await context.ApprovalRequests.AnyAsync())
            {
                var requests = new List<ApprovalRequest>
                {
                    new ApprovalRequest
                    {
                        RequestId = 1,
                        RequestCode = "AR0001",
                        RequestType = "due_date_extension",
                        Title = "Xin gia hạn nộp học phí",
                        Description = "Student family had sudden medical emergency, requested 10 days extension for invoice #3.",
                        StudentId = 8,
                        InvoiceId = 3,
                        ClassId = 1,
                        RequestedBy = 2,
                        ReviewedBy = 1,
                        Priority = "medium",
                        Status = "approved",
                        Reason = "Student family had sudden medical emergency, requested 10 days extension for invoice #3.",
                        CreatedAt = DateTime.UtcNow,
                        ReviewedAt = DateTime.UtcNow,
                        ReviewNotes = "Approved for 10-day extension until Sept 20."
                    },
                    new ApprovalRequest
                    {
                        RequestId = 2,
                        RequestCode = "AR0002",
                        RequestType = "tuition_adjustment",
                        Title = "Đề xuất giảm học phí anh chị em",
                        Description = "Sibling discount policy (10% off for 2nd enrolled subject). Needs manager sign-off.",
                        StudentId = 7,
                        InvoiceId = 5,
                        ClassId = 2,
                        RequestedBy = 2,
                        ReviewedBy = null,
                        Priority = "high",
                        Status = "pending",
                        Reason = "Sibling discount policy (10% off for 2nd enrolled subject). Needs manager sign-off.",
                        CreatedAt = DateTime.UtcNow,
                        ReviewedAt = null,
                        ReviewNotes = null
                    },
                    new ApprovalRequest
                    {
                        RequestId = 3,
                        RequestCode = "AR0003",
                        RequestType = "leave_request",
                        Title = "Xin nghỉ học buổi 2",
                        Description = "Medical leave for session on 2026-09-10 with valid doctor confirmation.",
                        StudentId = 7,
                        InvoiceId = null,
                        ClassId = 1,
                        RequestedBy = 5,
                        ReviewedBy = 1,
                        Priority = "low",
                        Status = "approved",
                        Reason = "Medical leave for session on 2026-09-10 with valid doctor confirmation.",
                        CreatedAt = DateTime.UtcNow,
                        ReviewedAt = DateTime.UtcNow,
                        ReviewNotes = "Approved by Manager."
                    },
                    new ApprovalRequest
                    {
                        RequestId = 4,
                        RequestCode = "AR0004",
                        RequestType = "class_transfer",
                        Title = "Xin chuyển lớp Toán 9A sang 9B",
                        Description = "Học sinh Đặng Minh Cường xin chuyển từ lớp Toán 9A sang lớp Toán 9B do trùng lịch trường.",
                        StudentId = 8,
                        InvoiceId = null,
                        ClassId = 1,
                        RequestedBy = 2,
                        ReviewedBy = 1,
                        Priority = "high",
                        Status = "approved",
                        Reason = "[C-03, C-07] Học sinh Đặng Minh Cường xin chuyển từ lớp Toán 9A sang lớp Toán 9B do trùng lịch trường.",
                        CreatedAt = DateTime.UtcNow,
                        ReviewedAt = DateTime.UtcNow,
                        ReviewNotes = "Duyệt chuyển lớp. Admin Staff thực hiện cập nhật student_classes."
                    },
                    new ApprovalRequest
                    {
                        RequestId = 5,
                        RequestCode = "AR0005",
                        RequestType = "feedback",
                        Title = "Góp ý điều hòa phòng học 201",
                        Description = "Em thấy phòng học 201 điều hòa bị chảy nước và hơi lạnh trong buổi học tối qua.",
                        StudentId = 6,
                        InvoiceId = null,
                        ClassId = 1,
                        RequestedBy = 6,
                        ReviewedBy = 2,
                        Priority = "medium",
                        Status = "approved",
                        Reason = "[C-01, C-07] Em thấy phòng học 201 điều hòa bị chảy nước và hơi lạnh trong buổi học tối qua.",
                        CreatedAt = DateTime.UtcNow,
                        ReviewedAt = DateTime.UtcNow,
                        ReviewNotes = "Trung tâm đã ghi nhận và cho bộ phận kỹ thuật bảo trì điều hòa sáng nay. Cảm ơn em!"
                    }
                };
                await context.ApprovalRequests.AddRangeAsync(requests);
                await context.SaveChangesAsync();
            }

            // 21. Notifications
            if (!await context.Notifications.AnyAsync())
            {
                var notifications = new List<Notification>
                {
                    new Notification { NotificationId = 1, UserId = null, ClassId = null, Title = "EduTrack System Welcome", Content = "Welcome to EduTrack! Please complete your profile information.", Type = "system", IsRead = false, CreatedAt = DateTime.UtcNow },
                    new Notification { NotificationId = 2, UserId = 6, ClassId = 1, Title = "Homework 01 Graded", Content = "Your submission for Homework 01 has been graded: 9.5/10.0", Type = "homework", IsRead = true, CreatedAt = DateTime.UtcNow },
                    new Notification { NotificationId = 3, UserId = 7, ClassId = 1, Title = "Leave Request Approved", Content = "Your leave request for Session 2 has been approved by the Center Manager.", Type = "class", IsRead = false, CreatedAt = DateTime.UtcNow },
                    new Notification { NotificationId = 4, UserId = 8, ClassId = 1, Title = "Tuition Due Reminder", Content = "Tuition invoice for Class 9 Advanced Mathematics is overdue. Please settle promptly.", Type = "tuition", IsRead = false, CreatedAt = DateTime.UtcNow },
                    new Notification { NotificationId = 5, UserId = null, ClassId = 1, Title = "Class Room Update", Content = "Session on 2026-09-15 will start 15 mins earlier for test review.", Type = "schedule", IsRead = false, CreatedAt = DateTime.UtcNow },
                    new Notification { NotificationId = 6, UserId = 9, ClassId = 1, Title = "Tuition Receipt Acknowledged", Content = "Tuition for Le Van An (Class 9 Advanced Math) has been successfully recorded.", Type = "tuition", IsRead = true, CreatedAt = DateTime.UtcNow }
                };
                await context.Notifications.AddRangeAsync(notifications);
                await context.SaveChangesAsync();
            }

            // 22. Center Settings
            if (!await context.CenterSettings.AnyAsync())
            {
                var settings = new List<CenterSetting>
                {
                    new CenterSetting { SettingId = 1, SettingKey = "center_name", SettingValue = "EduTrack Smart Learning Center", UpdatedBy = 1 },
                    new CenterSetting { SettingId = 2, SettingKey = "center_address", SettingValue = "123 Nguyen Van Cu, District 5, Ho Chi Minh City", UpdatedBy = 1 },
                    new CenterSetting { SettingId = 3, SettingKey = "center_hotline", SettingValue = "1900 6868", UpdatedBy = 1 },
                    new CenterSetting { SettingId = 4, SettingKey = "academic_year", SettingValue = "2026 - 2027", UpdatedBy = 1 },
                    new CenterSetting { SettingId = 5, SettingKey = "tuition_due_day", SettingValue = "10", UpdatedBy = 1 },
                    new CenterSetting { SettingId = 6, SettingKey = "ai_evaluation_enabled", SettingValue = "true", UpdatedBy = 1 },
                    new CenterSetting { SettingId = 7, SettingKey = "currency", SettingValue = "VND", UpdatedBy = 1 }
                };
                await context.CenterSettings.AddRangeAsync(settings);
                await context.SaveChangesAsync();
            }
        }
    }
}
