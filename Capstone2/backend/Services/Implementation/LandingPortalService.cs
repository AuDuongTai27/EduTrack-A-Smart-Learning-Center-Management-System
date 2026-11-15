using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using EduTrack.API.Models.DTOs.Landing;
using EduTrack.API.Models.Entities;
using EduTrack.API.Models.EF;
using EduTrack.API.Services.Interfaces;

namespace EduTrack.API.Services.Implementation
{
    public class LandingPortalService : ILandingPortalService
    {
        private readonly EduTrackDbContext _context;

        public LandingPortalService(EduTrackDbContext context)
        {
            _context = context;
        }

        public async Task<LandingOverviewDto> GetLandingOverviewAsync()
        {
            var overview = new LandingOverviewDto();

            // 1. Cấu hình trung tâm từ bảng center_settings
            var settings = await _context.CenterSettings.AsNoTracking().ToListAsync();
            string GetSetting(string key, string fallback) =>
                settings.FirstOrDefault(s => string.Equals(s.SettingKey, key, StringComparison.OrdinalIgnoreCase))?.SettingValue ?? fallback;

            overview.CenterInfo = new LandingCenterInfoDto
            {
                CenterName = GetSetting("center_name", "EduTrack Smart Learning Center"),
                Slogan = GetSetting("center_slogan", string.Empty),
                Address = GetSetting("center_address", string.Empty),
                Hotline = GetSetting("center_hotline", string.Empty),
                Email = GetSetting("center_email", string.Empty),
                AcademicYear = GetSetting("academic_year", string.Empty)
            };

            // 2. Thống kê quy mô thực tế (Stats)
            int realStudentCount = await _context.Users
                .AsNoTracking()
                .Where(u => u.UserRoles.Any(ur => ur.Role != null && ur.Role.RoleName.ToLower() == "student"))
                .CountAsync();

            int realClassCount = await _context.Classes
                .AsNoTracking()
                .Where(c => c.Status == "active")
                .CountAsync();

            var scheduleDate = EduTrack.API.Services.Schedule.ScheduleTimeline.Today();
            int realScheduleCount = await _context.ClassScheduleVersions
                .AsNoTracking()
                .CountAsync(v => v.EffectiveFrom <= scheduleDate && (!v.EffectiveTo.HasValue || scheduleDate < v.EffectiveTo.Value));

            int realTrainerCount = await _context.Users
                .AsNoTracking()
                .Where(u => u.UserRoles.Any(ur => ur.Role != null &&
                    (ur.Role.RoleName.ToLower() == "teacher" || ur.Role.RoleName.ToLower() == "teaching_assistant")))
                .CountAsync();

            overview.Stats = new LandingStatsDto
            {
                TotalStudents = realStudentCount,
                TotalCourses = realClassCount,
                TotalSchedules = realScheduleCount,
                TotalTrainers = realTrainerCount
            };

            // 3. Danh sách môn học trọng điểm (Subjects)
            var subjects = await _context.Subjects
                .AsNoTracking()
                .Include(s => s.Classes)
                .ToListAsync();

            overview.Subjects = subjects.Select(s => new LandingSubjectItemDto
            {
                SubjectId = s.SubjectId,
                SubjectCode = s.SubjectCode,
                SubjectName = s.SubjectName,
                Description = s.Description ?? string.Empty,
                ActiveClassesCount = s.Classes.Count(c => c.Status == "active")
            }).ToList();

            // Compatibility preview only. Public filtering/pagination uses /landing/classes.
            overview.Courses = (await GetClassesAsync(null, 1, 3)).Items;

            // 5. Danh sách Giảng viên & Trợ giảng tiêu biểu (Trainers)
            var trainers = await _context.Users
                .AsNoTracking()
                .Include(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                .Include(u => u.TeacherClasses).ThenInclude(a => a.Class).ThenInclude(c => c.Subject)
                .Include(u => u.TaClasses).ThenInclude(a => a.Class).ThenInclude(c => c.Subject)
                .AsSplitQuery()
                .Where(u => u.Status == "active" && u.UserRoles.Any(ur => ur.Role != null &&
                    (ur.Role.RoleName.ToLower() == "teacher" || ur.Role.RoleName.ToLower() == "teaching_assistant")))
                .OrderBy(u => u.UserId)
                .Take(6)
                .ToListAsync();

            overview.Trainers = trainers.Select(t =>
            {
                bool isAssistant = t.UserRoles.Any(ur => ur.Role?.RoleName.ToLower() == "teaching_assistant");
                string roleTitle = isAssistant ? "Teaching Assistant" : "Teacher";

                string avatar = t.AvatarUrl ?? string.Empty;

                string specialty = !string.IsNullOrWhiteSpace(t.Specialty)
                    ? t.Specialty
                    : string.Empty;

                return new LandingTrainerItemDto
                {
                    UserId = t.UserId,
                    UserCode = t.UserCode,
                    FullName = t.FullName,
                    Specialty = specialty,
                    Email = string.Empty,
                    Phone = string.Empty,
                    AvatarUrl = avatar,
                    RoleTitle = roleTitle,
                    Subjects = t.TeacherClasses.Where(a => a.Status == "active" && a.Class.Status == "active").Select(a => a.Class.Subject)
                        .Concat(t.TaClasses.Where(a => a.Status == "active" && a.Class.Status == "active").Select(a => a.Class.Subject))
                        .Where(s => s != null).DistinctBy(s => s.SubjectId).OrderBy(s => s.SubjectId)
                        .Select(s => new LandingSubjectItemDto { SubjectId = s.SubjectId, SubjectCode = s.SubjectCode, SubjectName = s.SubjectName }).ToList()
                };
            }).ToList();

            return overview;
        }

        public async Task<LandingClassesPageDto> GetClassesAsync(int? subjectId, int page, int pageSize,
            System.Threading.CancellationToken ct = default)
        {
            if ((subjectId.HasValue && subjectId <= 0) || page < 1 || page > 10000 || pageSize < 1 || pageSize > 12)
                throw new ArgumentOutOfRangeException(nameof(page), "Invalid public class pagination.");
            var query = _context.Classes.AsNoTracking().Where(c => c.Status == "active");
            if (subjectId.HasValue) query = query.Where(c => c.SubjectId == subjectId);
            var count = await query.CountAsync(ct);
            var classes = await query.OrderBy(c => c.ClassId).Skip((page - 1) * pageSize).Take(pageSize)
                .Select(c => new LandingCourseItemDto
                {
                    ClassId = c.ClassId, ClassName = c.ClassName, SubjectId = c.SubjectId,
                    SubjectCode = c.Subject.SubjectCode, SubjectName = c.Subject.SubjectName,
                    GradeId = c.GradeId, GradeName = c.Grade != null ? c.Grade.GradeName : null,
                    TuitionFee = c.TuitionFee, Room = c.Room ?? string.Empty,
                    TeacherName = c.TeacherClasses.Where(a => a.Status == "active" && a.Teacher.Status == "active")
                        .OrderBy(a => a.TeacherId).Select(a => a.Teacher.FullName).FirstOrDefault() ?? string.Empty
                }).ToListAsync(ct);
            var classIds = classes.Select(c => c.ClassId).ToList();
            var now = DateTime.UtcNow.AddHours(7);
            var today = now.Date;
            var horizon = today.AddDays(60);
            // Only actual upcoming sessions; old recurring slots are never reconstructed.
            var sessions = await _context.ClassSessions.AsNoTracking().Include(s => s.ScheduleVersion)
                .Where(s => classIds.Contains(s.ClassId) && s.Status == "scheduled" && s.SessionDate >= today && s.SessionDate < horizon)
                .OrderBy(s => s.SessionDate).ThenBy(s => s.StartTime).ToListAsync(ct);
            var bounds = await _context.Classes.AsNoTracking().Where(c => classIds.Contains(c.ClassId))
                .Select(c => new { c.ClassId, c.StartDate, c.EndDate }).ToDictionaryAsync(c => c.ClassId, ct);
            foreach (var item in classes)
            {
                var range = bounds[item.ClassId];
                item.UpcomingSessions = LandingSchedulePresentation.Upcoming(sessions.Where(s => s.ClassId == item.ClassId),
                    range.StartDate, range.EndDate, now);
            }
            return new LandingClassesPageDto { Items = classes, Page = page, PageSize = pageSize, TotalCount = count };
        }

        public async Task<bool> RecordNewsletterSubscriptionAsync(string email)
        {
            if (string.IsNullOrWhiteSpace(email) || !email.Contains('@'))
            {
                return false;
            }

            // Ghi nhận lead / thông báo tới hệ thống
            _context.Notifications.Add(new Notification
            {
                Title = "Đăng ký nhận tin tuyển sinh mới",
                Content = $"Khách hàng với email '{email.Trim()}' vừa đăng ký nhận bản tin trên Landing Page.",
                Type = "system",
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            });

            await _context.SaveChangesAsync();
            return true;
        }
    }
}
