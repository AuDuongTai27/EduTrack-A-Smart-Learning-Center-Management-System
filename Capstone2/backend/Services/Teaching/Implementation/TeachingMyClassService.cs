using EduTrack.API.Services.Schedule;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using EduTrack.API.Models.DTOs.Teaching;
using EduTrack.API.Models.EF;
using EduTrack.API.Models.Entities;
using EduTrack.API.Services.Teaching.Interfaces;

namespace EduTrack.API.Services.Teaching.Implementation
{
    public class TeachingMyClassService : ITeachingMyClassService
    {
        private readonly EduTrackDbContext _context;

        public TeachingMyClassService(EduTrackDbContext context)
        {
            _context = context;
        }

        public async Task<List<TeachingClassItemDto>> GetMyClassesAsync(int userId)
        {
            var user = await _context.Users
                .AsNoTracking()
                .Include(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                .FirstOrDefaultAsync(u => u.UserId == userId);

            if (user == null)
            {
                return new List<TeachingClassItemDto>();
            }

            var roleNames = user.UserRoles
                .Select(ur => ur.Role?.RoleName?.ToLower())
                .Where(r => r != null)
                .ToList();

            bool isOnlyTa = (roleNames.Contains("teaching_assistant") || roleNames.Contains("ta")) && !roleNames.Contains("teacher");

            var teacherClassesList = await _context.TeacherClasses
                .AsNoTracking()
                .Where(tc => tc.TeacherId == userId && tc.Status == "active")
                .Include(tc => tc.Class).ThenInclude(c => c.Subject)
                .Include(tc => tc.Class).ThenInclude(c => c.ClassSchedules).ThenInclude(s => s.Versions)
                .Include(tc => tc.Class).ThenInclude(c => c.StudentClasses)
                .Include(tc => tc.Class).ThenInclude(c => c.TeacherClasses).ThenInclude(tc => tc.Teacher)
                .Include(tc => tc.Class).ThenInclude(c => c.TaClasses).ThenInclude(tac => tac.Ta)
                .Select(tc => tc.Class)
                .Where(c => c != null)
                .ToListAsync();

            var taClassesList = await _context.TaClasses
                .AsNoTracking()
                .Where(tac => tac.TaId == userId && tac.Status == "active")
                .Include(tac => tac.Class).ThenInclude(c => c.Subject)
                .Include(tac => tac.Class).ThenInclude(c => c.ClassSchedules).ThenInclude(s => s.Versions)
                .Include(tac => tac.Class).ThenInclude(c => c.StudentClasses)
                .Include(tac => tac.Class).ThenInclude(c => c.TeacherClasses).ThenInclude(tc => tc.Teacher)
                .Include(tac => tac.Class).ThenInclude(c => c.TaClasses).ThenInclude(tac => tac.Ta)
                .Select(tac => tac.Class)
                .Where(c => c != null)
                .ToListAsync();

            var teacherClassIds = teacherClassesList.Select(c => c.ClassId).ToHashSet();
            var taClassIds = taClassesList.Select(c => c.ClassId).ToHashSet();

            var assignedClasses = teacherClassesList
                .Concat(taClassesList)
                .GroupBy(c => c.ClassId)
                .Select(g => g.First())
                .ToList();

            var result = assignedClasses.Select(cls =>
            {
                var teacherName = cls.TeacherClasses?.FirstOrDefault(tc => tc.Status == "active")?.Teacher?.FullName ?? "Chưa phân công";
                var taName = cls.TaClasses?.FirstOrDefault(tac => tac.Status == "active")?.Ta?.FullName ?? "Chưa phân công";
                var studentCount = cls.StudentClasses?.Count(sc => sc.Status == "active") ?? 0;
                bool isTeacherOfThisClass = teacherClassIds.Contains(cls.ClassId) || (!taClassIds.Contains(cls.ClassId) && !isOnlyTa);

                var schedules = ScheduleTimeline.At(cls.ClassSchedules, ScheduleTimeline.ListingDate(cls.StartDate))
                    .OrderBy(cs => cs.DayOfWeek)
                    .ThenBy(cs => cs.StartTime)
                    .ToList();

                string scheduleSummary = "Chưa xếp lịch học";
                if (schedules != null && schedules.Any())
                {
                    var days = schedules.Select(s => CapitalizeDayOfWeek(s.DayOfWeek)).Distinct();
                    var time = schedules.FirstOrDefault();
                    var timeStr = time != null
                        ? $" ({time.StartTime:hh\\:mm} - {time.EndTime:hh\\:mm})"
                        : "";
                    scheduleSummary = $"{string.Join(", ", days)}{timeStr}";
                }

                return new TeachingClassItemDto
                {
                    ClassId = cls.ClassId,
                    ClassName = cls.ClassName,
                    SubjectId = cls.SubjectId,
                    SubjectName = cls.Subject?.SubjectName ?? "Môn học",
                    SubjectCode = cls.Subject?.SubjectCode ?? "SUB",
                    Room = cls.Room ?? "Chưa xếp phòng",
                    TuitionFee = cls.TuitionFee,
                    StartDate = cls.StartDate,
                    EndDate = cls.EndDate,
                    Status = cls.Status ?? "active",
                    StudentCount = studentCount,
                    TeacherName = teacherName,
                    TaName = taName,
                    PartnerName = isTeacherOfThisClass ? taName : teacherName,
                    ScheduleSummary = scheduleSummary,
                    MyRoleInClass = isTeacherOfThisClass ? "teacher" : "teaching_assistant",
                };
            }).ToList();

            return result;
        }

        public async Task<List<TeachingClassStudentItemDto>> GetClassStudentsAsync(int classId)
        {
            var scList = await _context.StudentClasses
                .AsNoTracking()
                .Include(sc => sc.Student)
                .Where(sc => sc.ClassId == classId)
                .OrderBy(sc => sc.Student.FullName)
                .ToListAsync();

            if (!scList.Any())
            {
                return new List<TeachingClassStudentItemDto>();
            }

            var studentIds = scList.Select(sc => sc.StudentId).ToList();
            var parentLinks = await _context.ParentStudents
                .AsNoTracking()
                .Include(ps => ps.Parent)
                .Where(ps => studentIds.Contains(ps.StudentId))
                .ToListAsync();

            var classSessions = await _context.ClassSessions
                .AsNoTracking()
                .Where(cs => cs.ClassId == classId)
                .Select(cs => cs.SessionId)
                .ToListAsync();

            int totalSessions = classSessions.Count;

            var attendances = await _context.Attendances
                .AsNoTracking()
                .Where(a => classSessions.Contains(a.SessionId))
                .ToListAsync();

            var result = new List<TeachingClassStudentItemDto>();
            foreach (var sc in scList)
            {
                var s = sc.Student;
                if (s == null) continue;

                var primaryParent = parentLinks.FirstOrDefault(ps => ps.StudentId == s.UserId && ps.IsPrimaryContact)?.Parent 
                    ?? parentLinks.FirstOrDefault(ps => ps.StudentId == s.UserId)?.Parent;

                var studentAtts = attendances.Where(a => a.StudentId == s.UserId).ToList();
                int attendedCount = studentAtts.Count(a => a.Status == "present" || a.Status == "late");
                int rate = studentAtts.Count > 0 ? (int)Math.Round((double)attendedCount / studentAtts.Count * 100) : 0;

                result.Add(new TeachingClassStudentItemDto
                {
                    StudentId = s.UserId,
                    StudentCode = s.UserCode ?? $"STU{s.UserId:D3}",
                    FullName = s.FullName,
                    Email = s.Email,
                    Phone = s.Phone ?? string.Empty,
                    Gender = s.Gender ?? "Nam",
                    Dob = s.DateOfBirth?.ToString("dd/MM/yyyy") ?? string.Empty,
                    EnrollmentDate = sc.EnrolledDate?.ToString("dd/MM/yyyy") ?? string.Empty,
                    Status = sc.Status ?? "active",
                    ParentName = primaryParent?.FullName ?? "Chưa liên kết",
                    ParentPhone = primaryParent?.Phone ?? string.Empty,
                    AttendanceRate = rate,
                    TotalAttendedSessions = attendedCount > 0 ? attendedCount : 18,
                    TotalSessions = totalSessions
                });
            }

            return result;
        }

        private static string CapitalizeDayOfWeek(string? day)
        {
            if (string.IsNullOrWhiteSpace(day)) return "Monday";
            string lower = day.Trim().ToLower();
            return lower switch
            {
                "monday" => "Thứ Hai",
                "tuesday" => "Thứ Ba",
                "wednesday" => "Thứ Tư",
                "thursday" => "Thứ Năm",
                "friday" => "Thứ Sáu",
                "saturday" => "Thứ Bảy",
                "sunday" => "Chủ Nhật",
                _ => char.ToUpper(lower[0]) + lower.Substring(1),
            };
        }
    }
}
