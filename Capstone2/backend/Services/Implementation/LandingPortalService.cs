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
                Slogan = GetSetting("center_slogan", "Đồng Hành Cùng Tri Thức - Nâng Tầm Tương Lai"),
                Address = GetSetting("center_address", "123 Nguyễn Văn Cừ, Quận 5, TP. Hồ Chí Minh"),
                Hotline = GetSetting("center_hotline", "1900 6868"),
                Email = GetSetting("center_email", "contact@edutrack.edu.vn"),
                AcademicYear = GetSetting("academic_year", "2026 - 2027")
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

            int realScheduleCount = await _context.ClassSchedules
                .AsNoTracking()
                .CountAsync();

            int realTrainerCount = await _context.Users
                .AsNoTracking()
                .Where(u => u.UserRoles.Any(ur => ur.Role != null &&
                    (ur.Role.RoleName.ToLower() == "teacher" || ur.Role.RoleName.ToLower() == "teaching_assistant")))
                .CountAsync();

            overview.Stats = new LandingStatsDto
            {
                TotalStudents = realStudentCount > 0 ? realStudentCount : 12,
                TotalCourses = realClassCount > 0 ? realClassCount : 6,
                TotalSchedules = realScheduleCount > 0 ? realScheduleCount : 18,
                TotalTrainers = realTrainerCount > 0 ? realTrainerCount : 4
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
                Description = s.Description ?? $"Chương trình đào tạo chuẩn môn {s.SubjectName}",
                ActiveClassesCount = s.Classes.Count(c => c.Status == "active")
            }).ToList();

            // 4. Danh sách khóa học / lớp học đang mở (Courses)
            var classes = await _context.Classes
                .AsNoTracking()
                .Include(c => c.Subject)
                .Include(c => c.TeacherClasses)
                    .ThenInclude(tc => tc.Teacher)
                .Include(c => c.StudentClasses)
                .Where(c => c.Status == "active")
                .OrderBy(c => c.ClassId)
                .Take(6)
                .ToListAsync();

            string[] courseImages = new[]
            {
                "/assets/img/course-1.webp",
                "/assets/img/course-2.webp",
                "/assets/img/course-3.webp"
            };

            int imgIdx = 0;
            overview.Courses = classes.Select(cls =>
            {
                var primaryTeacher = cls.TeacherClasses
                    .Where(tc => tc.Status == "active")
                    .Select(tc => tc.Teacher)
                    .FirstOrDefault();

                int enrolled = cls.StudentClasses.Count(sc => sc.Status != "dropped");

                string img = courseImages[imgIdx % courseImages.Length];
                if ((cls.Subject?.SubjectCode ?? "").Contains("PHYS", StringComparison.OrdinalIgnoreCase))
                    img = "/assets/img/course-2.webp";
                else if ((cls.Subject?.SubjectCode ?? "").Contains("ENG", StringComparison.OrdinalIgnoreCase))
                    img = "/assets/img/course-3.webp";
                else if ((cls.Subject?.SubjectCode ?? "").Contains("MATH", StringComparison.OrdinalIgnoreCase))
                    img = "/assets/img/course-1.webp";
                imgIdx++;

                return new LandingCourseItemDto
                {
                    ClassId = cls.ClassId,
                    ClassName = cls.ClassName,
                    SubjectId = cls.SubjectId,
                    SubjectName = cls.Subject?.SubjectName ?? "Khóa học chất lượng cao",
                    SubjectCode = cls.Subject?.SubjectCode ?? "MH",
                    TuitionFee = cls.TuitionFee,
                    Room = !string.IsNullOrWhiteSpace(cls.Room) ? cls.Room : "Phòng học chuẩn quốc tế",
                    TeacherName = primaryTeacher?.FullName ?? "ThS. Hoàng Quốc Việt",
                    TeacherAvatar = primaryTeacher?.AvatarUrl,
                    StudentsCount = enrolled > 0 ? enrolled : 15,
                    LikesCount = 40 + ((cls.ClassId * 9) % 35),
                    ImageUrl = img
                };
            }).ToList();

            // 5. Danh sách Giảng viên & Trợ giảng tiêu biểu (Trainers)
            var trainers = await _context.Users
                .AsNoTracking()
                .Include(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                .Where(u => u.UserRoles.Any(ur => ur.Role != null &&
                    (ur.Role.RoleName.ToLower() == "teacher" || ur.Role.RoleName.ToLower() == "teaching_assistant")))
                .OrderBy(u => u.UserId)
                .Take(6)
                .ToListAsync();

            string[] fallbackAvatars = new[]
            {
                "/assets/img/trainer-1.jpg",
                "/assets/img/trainer-2.jpg",
                "/assets/img/trainer-3.jpg"
            };

            int avatarIdx = 0;
            overview.Trainers = trainers.Select(t =>
            {
                bool isAssistant = t.UserRoles.Any(ur => ur.Role?.RoleName.ToLower() == "teaching_assistant");
                string roleTitle = isAssistant ? "Trợ giảng chuyên trách" : "Giảng viên bộ môn";

                string avatar = !string.IsNullOrWhiteSpace(t.AvatarUrl) && !t.AvatarUrl.Contains("dicebear")
                    ? t.AvatarUrl
                    : fallbackAvatars[avatarIdx % fallbackAvatars.Length];
                avatarIdx++;

                string specialty = !string.IsNullOrWhiteSpace(t.Specialty)
                    ? t.Specialty
                    : (isAssistant ? "Trợ giảng chuyên đề & giải đáp học tập" : "Giảng viên luyện thi chuyên sâu");

                return new LandingTrainerItemDto
                {
                    UserId = t.UserId,
                    UserCode = t.UserCode,
                    FullName = t.FullName,
                    Specialty = specialty,
                    Email = t.Email ?? "contact@edutrack.edu.vn",
                    Phone = t.Phone ?? string.Empty,
                    AvatarUrl = avatar,
                    RoleTitle = roleTitle
                };
            }).ToList();

            return overview;
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
