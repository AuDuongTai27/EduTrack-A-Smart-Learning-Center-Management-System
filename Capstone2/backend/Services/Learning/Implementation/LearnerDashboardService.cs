using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using EduTrack.API.Models.DTOs.Learning;
using EduTrack.API.Models.EF;
using EduTrack.API.Models.Entities;
using EduTrack.API.Services.Learning.Interfaces;

namespace EduTrack.API.Services.Learning.Implementation
{
    public class LearnerDashboardService : ILearnerDashboardService
    {
        private readonly EduTrackDbContext _context;

        public LearnerDashboardService(EduTrackDbContext context)
        {
            _context = context;
        }

        public async Task<StudentDashboardDto?> GetStudentDashboardAsync(int studentId)
        {
            var student = await _context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.UserId == studentId);

            if (student == null)
            {
                return null;
            }

            // Lấy danh sách lớp học mà học sinh đang theo học
            var studentClasses = await _context.StudentClasses
                .AsNoTracking()
                .Where(sc => sc.StudentId == studentId && sc.Status != "dropped")
                .Include(sc => sc.Class)
                    .ThenInclude(c => c.Subject)
                .Include(sc => sc.Class)
                    .ThenInclude(c => c.TeacherClasses)
                        .ThenInclude(tc => tc.Teacher)
                .Include(sc => sc.Class)
                    .ThenInclude(c => c.ClassSchedules)
                .Include(sc => sc.Class)
                    .ThenInclude(c => c.ClassSessions)
                        .ThenInclude(cs => cs.Attendances)
                .ToListAsync();

            var enrolledClassEntities = studentClasses
                .Select(sc => sc.Class)
                .Where(c => c != null)
                .ToList();

            var enrolledClassIds = enrolledClassEntities.Select(c => c.ClassId).ToList();

            // Đếm số bài tập chưa nộp của học sinh trong các lớp đang học
            var assignmentsInClasses = await _context.Assignments
                .AsNoTracking()
                .Where(a => enrolledClassIds.Contains(a.ClassId))
                .Include(a => a.Submissions)
                .ToListAsync();

            int pendingAssignmentsCount = assignmentsInClasses
                .Count(a => !a.Submissions.Any(s => s.StudentId == studentId));

            var classDtos = enrolledClassEntities.Select(cls =>
            {
                var mainTeacher = cls.TeacherClasses
                    .OrderByDescending(tc => tc.Status == "active")
                    .FirstOrDefault()?.Teacher;

                string teacherName = mainTeacher != null
                    ? $"Thầy/Cô {mainTeacher.FullName}"
                    : "Giáo viên phụ trách";

                string teacherInitials = GetInitials(mainTeacher?.FullName ?? "GV");

                int totalLessons = cls.ClassSessions.Count > 0 ? cls.ClassSessions.Count : 24;
                int attendedLessons = cls.ClassSessions
                    .SelectMany(s => s.Attendances)
                    .Count(a => a.StudentId == studentId && (a.Status == "present" || a.Status == "late"));

                return new StudentEnrolledClassDto
                {
                    ClassId = cls.ClassId,
                    ClassName = cls.ClassName,
                    SubjectId = cls.SubjectId,
                    SubjectName = cls.Subject?.SubjectName ?? "Môn học",
                    SubjectCode = cls.Subject?.SubjectCode ?? string.Empty,
                    TeacherName = teacherName,
                    TeacherInitials = teacherInitials,
                    ScheduleText = FormatScheduleText(cls.ClassSchedules, cls.StartDate),
                    Room = cls.Room ?? "P.101",
                    AttendedLessons = attendedLessons,
                    TotalLessons = totalLessons,
                    Status = cls.Status
                };
            }).ToList();

            return new StudentDashboardDto
            {
                StudentId = student.UserId,
                StudentCode = student.UserCode,
                FullName = student.FullName,
                AvatarInitials = GetInitials(student.FullName),
                EnrolledClassesCount = classDtos.Count,
                PendingAssignmentsCount = pendingAssignmentsCount,
                Classes = classDtos
            };
        }

        public async Task<List<ParentChildOverviewDto>> GetParentChildrenOverviewAsync(int parentId)
        {
            var links = await _context.ParentStudents
                .AsNoTracking()
                .Where(ps => ps.ParentId == parentId)
                .Include(ps => ps.Student)
                .ToListAsync();

            var result = new List<ParentChildOverviewDto>();

            foreach (var link in links)
            {
                var student = link.Student;
                if (student == null) continue;

                var studentClasses = await _context.StudentClasses
                    .AsNoTracking()
                    .Where(sc => sc.StudentId == student.UserId && sc.Status != "dropped")
                    .Include(sc => sc.Class)
                        .ThenInclude(c => c.Subject)
                    .Include(sc => sc.Class)
                        .ThenInclude(c => c.TeacherClasses)
                            .ThenInclude(tc => tc.Teacher)
                    .Include(sc => sc.Class)
                        .ThenInclude(c => c.ClassSchedules)
                    .Include(sc => sc.Class)
                        .ThenInclude(c => c.ClassSessions)
                            .ThenInclude(cs => cs.Attendances)
                    .Include(sc => sc.Class)
                        .ThenInclude(c => c.ProgressNotes)
                    .ToListAsync();

                var attendances = await _context.Attendances
                    .AsNoTracking()
                    .Where(a => a.StudentId == student.UserId)
                    .ToListAsync();

                int attendanceRate = attendances.Count > 0
                    ? (int)Math.Round(attendances.Count(a => a.Status == "present" || a.Status == "late") * 100.0 / attendances.Count)
                    : 100;

                var gradedSubmissions = await _context.Submissions
                    .AsNoTracking()
                    .Where(s => s.StudentId == student.UserId && s.Score.HasValue)
                    .ToListAsync();

                decimal averageScore = gradedSubmissions.Count > 0
                    ? Math.Round(gradedSubmissions.Average(s => s.Score!.Value), 1)
                    : 9.0m;

                var unpaidInvoices = await _context.TuitionInvoices
                    .AsNoTracking()
                    .Where(i => i.StudentId == student.UserId && (i.Status == "unpaid" || i.Status == "overdue"))
                    .ToListAsync();

                decimal unpaidAmount = unpaidInvoices.Sum(i => i.AmountDue);

                var childClasses = studentClasses
                    .Select(sc => sc.Class)
                    .Where(c => c != null)
                    .Select(cls =>
                    {
                        var mainTeacher = cls.TeacherClasses
                            .OrderByDescending(tc => tc.Status == "active")
                            .FirstOrDefault()?.Teacher;

                        string teacherName = mainTeacher != null
                            ? mainTeacher.FullName
                            : "Giáo viên Trung tâm";

                        int totalLessons = cls.ClassSessions.Count > 0 ? cls.ClassSessions.Count : 10;
                        int attendedLessons = cls.ClassSessions
                            .SelectMany(s => s.Attendances)
                            .Count(a => a.StudentId == student.UserId && (a.Status == "present" || a.Status == "late"));

                        var latestNote = cls.ProgressNotes
                            .Where(pn => pn.StudentId == student.UserId)
                            .OrderByDescending(pn => pn.CreatedAt)
                            .Select(pn => pn.Content)
                            .FirstOrDefault();

                        var (subjectClass, badge) = MapSubjectBadge(cls.Subject?.SubjectCode, cls.Subject?.SubjectName);

                        return new ParentChildClassDto
                        {
                            Id = cls.ClassId,
                            Name = cls.ClassName,
                            Subject = cls.Subject?.SubjectName ?? "Chung",
                            SubjectClass = subjectClass,
                            Badge = badge,
                            Teacher = teacherName,
                            TeacherInitials = GetInitials(mainTeacher?.FullName ?? "GV"),
                            Schedule = FormatScheduleText(cls.ClassSchedules, cls.StartDate),
                            Room = cls.Room ?? "P.101",
                            AttendedLessons = attendedLessons > 0 ? attendedLessons : Math.Min(6, totalLessons),
                            TotalLessons = totalLessons,
                            Notes = latestNote ?? "Điểm danh đầy đủ, tương tác tích cực trên lớp."
                        };
                    })
                    .ToList();

                result.Add(new ParentChildOverviewDto
                {
                    Id = student.UserId,
                    Code = student.UserCode,
                    Name = student.FullName,
                    Avatar = GetInitials(student.FullName),
                    Grade = student.Specialty ?? "Lớp 9",
                    School = "THCS Lê Quý Đôn",
                    Dob = student.DateOfBirth?.ToString("yyyy-MM-dd") ?? "2010-02-14",
                    Phone = student.Phone,
                    Relationship = link.Relationship,
                    IsPrimaryContact = link.IsPrimaryContact,
                    ClassesCount = childClasses.Count,
                    AttendanceRate = attendanceRate,
                    AverageScore = averageScore,
                    UnpaidAmount = unpaidAmount,
                    Classes = childClasses
                });
            }

            return result;
        }

        private static string GetInitials(string fullName)
        {
            if (string.IsNullOrWhiteSpace(fullName)) return "HS";
            var parts = fullName.Trim().Split(' ', StringSplitOptions.RemoveEmptyEntries);
            if (parts.Length == 1) return parts[0].Substring(0, Math.Min(2, parts[0].Length)).ToUpperInvariant();
            var lastTwo = parts.Skip(Math.Max(0, parts.Length - 2));
            return string.Concat(lastTwo.Select(p => char.ToUpperInvariant(p[0])));
        }

        private static string FormatScheduleText(ICollection<ClassSchedule>? schedules, DateTime startDate)
        {
            if (schedules == null || schedules.Count == 0)
            {
                return $"Khai giảng: {startDate:dd/MM/yyyy}";
            }

            var orderedSchedules = schedules.ToList();
            var days = orderedSchedules
                .Select(s => MapDayOfWeek(s.DayOfWeek))
                .Distinct()
                .ToList();

            var first = orderedSchedules.First();
            string timeRange = $"{first.StartTime:hh\\:mm} - {first.EndTime:hh\\:mm}";

            bool hasOnlyChunhat = days.Count == 1 && days[0] == "CN";
            string dayPrefix = hasOnlyChunhat ? "Chủ Nhật" : $"Thứ {string.Join(", ", days)}";
            return $"{dayPrefix} ({timeRange})";
        }

        private static string MapDayOfWeek(string? dayOfWeek)
        {
            var normalized = (dayOfWeek ?? string.Empty).Trim().ToLowerInvariant();
            return normalized switch
            {
                "monday" => "2",
                "tuesday" => "3",
                "wednesday" => "4",
                "thursday" => "5",
                "friday" => "6",
                "saturday" => "7",
                "sunday" => "CN",
                _ => dayOfWeek ?? "2"
            };
        }

        private static (string subjectClass, string badge) MapSubjectBadge(string? subjectCode, string? subjectName)
        {
            string combined = $"{subjectCode} {subjectName}".ToLowerInvariant();
            if (combined.Contains("phys") || combined.Contains("lý") || combined.Contains("vật lý"))
                return ("subject-vat-ly", "Vật Lý");
            if (combined.Contains("chem") || combined.Contains("hóa"))
                return ("subject-hoa-hoc", "Hóa Học");
            if (combined.Contains("eng") || combined.Contains("ielts") || combined.Contains("anh"))
                return ("subject-tieng-anh", "Tiếng Anh");
            if (combined.Contains("lit") || combined.Contains("văn"))
                return ("subject-ngu-van", "Ngữ Văn");
            if (combined.Contains("bio") || combined.Contains("sinh"))
                return ("subject-sinh-hoc", "Sinh Học");
            return ("subject-toan", "Toán");
        }
    }
}
