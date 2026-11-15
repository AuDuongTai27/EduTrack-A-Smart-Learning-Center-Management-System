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
    public class TeachingDashboardService : ITeachingDashboardService
    {
        private readonly EduTrackDbContext _context;
        private readonly ITeachingNotificationService _notificationService;

        public TeachingDashboardService(
            EduTrackDbContext context,
            ITeachingNotificationService notificationService)
        {
            _context = context;
            _notificationService = notificationService;
        }

        public async Task<TeachingDashboardDto?> GetDashboardAsync(int userId)
        {
            var user = await _context.Users
                .AsNoTracking()
                .Include(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                .FirstOrDefaultAsync(u => u.UserId == userId);

            if (user == null)
            {
                return null;
            }

            // Tự động nhận diện vai trò từ DB qua UserRoles
            var roleNames = user.UserRoles
                .Select(ur => ur.Role?.RoleName?.ToLower())
                .Where(r => r != null)
                .ToList();

            bool isTa = roleNames.Contains("teaching_assistant") || roleNames.Contains("ta");

            // Nếu user_roles chưa gán rõ, kiểm tra tiếp trong bảng phân công
            if (!isTa && !roleNames.Contains("teacher"))
            {
                bool hasTaClass = await _context.TaClasses.AnyAsync(tac => tac.TaId == userId);
                bool hasTeacherClass = await _context.TeacherClasses.AnyAsync(tc => tc.TeacherId == userId);
                if (hasTaClass && !hasTeacherClass)
                {
                    isTa = true;
                }
            }

            // Profile summary
            var profileDto = new TeachingProfileSummaryDto
            {
                UserId = user.UserId,
                UserCode = user.UserCode,
                FullName = user.FullName,
                Email = user.Email,
                Phone = user.Phone,
                Specialty = user.Specialty ?? (isTa ? "Teaching Assistant" : "Giảng dạy chuyên môn"),
                AvatarUrl = user.AvatarUrl ?? "/assets/img/profiles/avatar-27.jpg",
                RoleTitle = isTa ? "Trợ giảng chuyên môn" : "Giáo viên chuyên môn",
                Role = isTa ? "teaching_assistant" : "teacher"
            };

            // Lấy danh sách lớp phụ trách dựa trên vai trò
            List<Class> assignedClasses;
            if (isTa)
            {
                assignedClasses = await _context.TaClasses
                    .AsNoTracking()
                    .Where(tac => tac.TaId == userId && tac.Status == "active")
                    .Include(tac => tac.Class)
                        .ThenInclude(c => c.Subject)
                    .Include(tac => tac.Class)
                        .ThenInclude(c => c.ClassSchedules)
                    .Select(tac => tac.Class)
                    .Where(c => c != null)
                    .ToListAsync();
            }
            else
            {
                assignedClasses = await _context.TeacherClasses
                    .AsNoTracking()
                    .Where(tc => tc.TeacherId == userId && tc.Status == "active")
                    .Include(tc => tc.Class)
                        .ThenInclude(c => c.Subject)
                    .Include(tc => tc.Class)
                        .ThenInclude(c => c.ClassSchedules)
                    .Select(tc => tc.Class)
                    .Where(c => c != null)
                    .ToListAsync();
            }

            // Fallback: nếu chưa có lớp được gán theo bảng vai trò chính, kiểm tra chéo bảng còn lại
            if (assignedClasses.Count == 0)
            {
                var fallbackTeacherClasses = await _context.TeacherClasses
                    .AsNoTracking()
                    .Where(tc => tc.TeacherId == userId && tc.Status == "active")
                    .Include(tc => tc.Class)
                        .ThenInclude(c => c.Subject)
                    .Include(tc => tc.Class)
                        .ThenInclude(c => c.ClassSchedules)
                    .Select(tc => tc.Class)
                    .Where(c => c != null)
                    .ToListAsync();

                var fallbackTaClasses = await _context.TaClasses
                    .AsNoTracking()
                    .Where(tac => tac.TaId == userId && tac.Status == "active")
                    .Include(tac => tac.Class)
                        .ThenInclude(c => c.Subject)
                    .Include(tac => tac.Class)
                        .ThenInclude(c => c.ClassSchedules)
                    .Select(tac => tac.Class)
                    .Where(c => c != null)
                    .ToListAsync();

                assignedClasses = fallbackTeacherClasses.Concat(fallbackTaClasses).DistinctBy(c => c.ClassId).ToList();
            }

            var classIds = assignedClasses.Select(c => c.ClassId).ToList();

            // Tổng số học viên thuộc các lớp phụ trách
            int totalStudents = 0;
            if (classIds.Count > 0)
            {
                totalStudents = await _context.StudentClasses
                    .AsNoTracking()
                    .Where(sc => classIds.Contains(sc.ClassId) && sc.Status != "dropped")
                    .Select(sc => sc.StudentId)
                    .Distinct()
                    .CountAsync();
            }

            // Bài tập thuộc các lớp phụ trách
            var assignments = await _context.Assignments
                .AsNoTracking()
                .Where(a => classIds.Contains(a.ClassId))
                .Include(a => a.Submissions)
                .ToListAsync();

            var vietnamNow = DateTime.UtcNow.AddHours(7);
            var today = vietnamNow.Date;
            var currentTimeOfDay = vietnamNow.TimeOfDay;

            // 1. Số bài tập chưa hết hạn (DueDate > now)
            int activeAssignments = assignments.Count(a => a.DueDate > DateTime.UtcNow);

            // 2. Số bài tập đã hết hạn nộp đang chờ chấm bài (có bài nộp chưa có điểm hoặc status != graded)
            int assignmentsNeedGrading = assignments
                .Where(a => a.DueDate <= DateTime.UtcNow)
                .Count(a => a.Submissions.Any(s => s.Score == null || s.Status == "submitted" || s.Status == "late"));

            // Lớp học hôm nay
            // 1. Kiểm tra các buổi học (sessions) cụ thể trong ngày hôm nay thuộc các lớp mà user phụ trách
            var todaySessions = await _context.ClassSessions
                .AsNoTracking()
                .Where(cs => classIds.Contains(cs.ClassId) && cs.SessionDate.Date == today && cs.Status != "cancelled")
                .Include(cs => cs.Class)
                    .ThenInclude(c => c.Subject)
                .Include(cs => cs.Class)
                    .ThenInclude(c => c.StudentClasses)
                .Include(cs => cs.Attendances)
                .OrderBy(cs => cs.StartTime)
                .ToListAsync();

            int classesToday = todaySessions.Count;
            var todayClassesList = new List<TodayClassSessionItemDto>();

            if (todaySessions.Count > 0)
            {
                // Chỉ lấy các ca học chưa kết thúc trong ngày (status != "completed" và chưa quá giờ kết thúc)
                todayClassesList = todaySessions
                    .Where(s => s.Status != "completed" && currentTimeOfDay < s.EndTime)
                    .Select(s =>
                    {
                        string computedStatus = (currentTimeOfDay >= s.StartTime && currentTimeOfDay < s.EndTime)
                            ? "Ongoing"
                            : "Upcoming";

                        return new TodayClassSessionItemDto
                        {
                            SessionId = s.SessionId,
                            ClassId = s.ClassId,
                            ClassName = s.Class?.ClassName ?? $"Lớp #{s.ClassId}",
                            SubjectName = s.Class?.Subject?.SubjectName,
                            Room = s.Room ?? s.Class?.Room ?? "P.101",
                            TimePeriod = $"{s.StartTime:hh\\:mm} - {s.EndTime:hh\\:mm}",
                            StartTime = s.StartTime.ToString(@"hh\:mm"),
                            EndTime = s.EndTime.ToString(@"hh\:mm"),
                            Status = computedStatus,
                            StudentsCount = s.Class?.StudentClasses.Count(sc => sc.Status != "dropped") ?? 0,
                            AttendanceTaken = s.Attendances.Any()
                        };
                    })
                    .OrderBy(s => s.Status == "Ongoing" ? 0 : 1)
                    .ThenBy(s => s.StartTime)
                    .ToList();
            }
            else
            {
                // Chỉ xét fallback nếu lớp CHƯA TỪNG được sinh sessions trong ClassSessions
                var classesWithNoSessions = assignedClasses
                    .Where(c => !_context.ClassSessions.Any(cs => cs.ClassId == c.ClassId))
                    .ToList();

                if (classesWithNoSessions.Count > 0)
                {
                    string todayDayOfWeek = vietnamNow.DayOfWeek.ToString().ToLower();

                    var matchingSchedules = classesWithNoSessions
                        .SelectMany(c => c.ClassSchedules.Select(s => new { Class = c, Schedule = s }))
                        .Where(x => string.Equals(x.Schedule.DayOfWeek?.Trim(), todayDayOfWeek, StringComparison.OrdinalIgnoreCase))
                        .OrderBy(x => x.Schedule.StartTime)
                        .ToList();

                    classesToday = matchingSchedules.Count;

                    todayClassesList = matchingSchedules
                        .Where(m => currentTimeOfDay < m.Schedule.EndTime)
                        .Select(m =>
                        {
                            string computedStatus = (currentTimeOfDay >= m.Schedule.StartTime && currentTimeOfDay < m.Schedule.EndTime)
                                ? "Ongoing"
                                : "Upcoming";

                            int studentCount = m.Class.StudentClasses.Count(sc => sc.Status != "dropped");

                            return new TodayClassSessionItemDto
                            {
                                SessionId = m.Schedule.ScheduleId,
                                ClassId = m.Class.ClassId,
                                ClassName = m.Class.ClassName,
                                SubjectName = m.Class.Subject?.SubjectName,
                                Room = m.Schedule.Room ?? m.Class.Room ?? "P.101",
                                TimePeriod = $"{m.Schedule.StartTime:hh\\:mm} - {m.Schedule.EndTime:hh\\:mm}",
                                StartTime = m.Schedule.StartTime.ToString(@"hh\:mm"),
                                EndTime = m.Schedule.EndTime.ToString(@"hh\:mm"),
                                Status = computedStatus,
                                StudentsCount = studentCount,
                                AttendanceTaken = false
                            };
                        })
                        .OrderBy(s => s.Status == "Ongoing" ? 0 : 1)
                        .ThenBy(s => s.StartTime)
                        .ToList();
                }
            }

            // Thông báo mới chưa đọc hiển thị trên Dashboard (Chỉ hiện thông báo chưa đọc)
            var notificationList = await _notificationService.GetNotificationsAsync(userId, "unread");
            var notificationDtos = notificationList
                .Where(n => !n.IsRead)
                .Take(5)
                .Select(n => new TeachingNotificationItemDto
                {
                    NotificationId = n.NotificationId,
                    Title = n.Title,
                    Description = n.Content,
                    Sender = n.Sender,
                    Initials = n.Initials,
                    InitialsBgClass = n.InitialsBgClass,
                    InitialsColorClass = n.InitialsColorClass,
                    IsNew = n.IsNew,
                    IsRead = n.IsRead,
                    TimeAgo = n.TimeAgo,
                    CreatedAt = n.CreatedAt
                }).ToList();

            // Số buổi học trong các lớp phụ trách chưa được điểm danh (session_date <= today và chưa có bản ghi attendance)
            int pendingAttendanceCount = 0;
            if (classIds.Count > 0)
            {
                pendingAttendanceCount = await _context.ClassSessions
                    .AsNoTracking()
                    .Where(cs => classIds.Contains(cs.ClassId) && cs.SessionDate.Date <= today && cs.Status != "cancelled")
                    .Where(cs => !_context.Attendances.Any(a => a.SessionId == cs.SessionId))
                    .CountAsync();
            }

            var kpis = new TeachingKpiSummaryDto
            {
                ActiveAssignments = activeAssignments,
                AssignmentsDueToday = assignmentsNeedGrading,
                ActiveClasses = assignedClasses.Count,
                ClassesToday = classesToday,
                TotalStudents = totalStudents,
                PendingAttendance = pendingAttendanceCount
            };

            return new TeachingDashboardDto
            {
                Profile = profileDto,
                Kpis = kpis,
                TodayClasses = todayClassesList,
                Notifications = notificationDtos
            };
        }
    }
}
