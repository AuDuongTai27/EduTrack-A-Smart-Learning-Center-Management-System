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
    public class TeachingNotificationService : ITeachingNotificationService
    {
        private readonly EduTrackDbContext _context;

        public TeachingNotificationService(EduTrackDbContext context)
        {
            _context = context;
        }

        public async Task<List<TeachingNotificationDto>> GetNotificationsAsync(int userId, string? status = null)
        {
            // 1. Lấy danh sách ID các lớp mà GV/TA này phụ trách
            var teacherClasses = await _context.TeacherClasses
                .AsNoTracking()
                .Where(tc => tc.TeacherId == userId)
                .Select(tc => tc.ClassId)
                .ToListAsync();

            var taClasses = await _context.TaClasses
                .AsNoTracking()
                .Where(tac => tac.TaId == userId)
                .Select(tac => tac.ClassId)
                .ToListAsync();

            var assignedClassIds = teacherClasses.Concat(taClasses).Distinct().ToList();

            // 2. Query thông báo đích danh hoặc thông báo chung toàn trung tâm / theo lớp phụ trách
            var query = _context.Notifications
                .AsNoTracking()
                .Include(n => n.Class)
                .Where(n => n.UserId == userId
                         || n.UserId == null
                         || (n.ClassId.HasValue && assignedClassIds.Contains(n.ClassId.Value)));

            // Lọc theo trạng thái đọc
            if (!string.IsNullOrWhiteSpace(status) && status.ToLower() != "all")
            {
                if (status.ToLower() == "unread")
                {
                    query = query.Where(n => !n.IsRead);
                }
                else if (status.ToLower() == "read")
                {
                    query = query.Where(n => n.IsRead);
                }
            }

            var notifications = await query
                .OrderByDescending(n => n.CreatedAt)
                .ToListAsync();

            // 3. Nếu chưa có thông báo trong DB, tạo danh sách mẫu thực tế cho GV/TA
            if (notifications.Count == 0)
            {
                return GetDefaultNotifications(userId);
            }

            return notifications.Select(n =>
            {
                string sender = n.Type switch
                {
                    "leave" => "Phòng Hành Chính & Đào Tạo",
                    "schedule" => "Phòng Quản Lý Đào Tạo",
                    "system" => "Ban Giám Đốc EduTrack",
                    _ => "EduTrack Staff"
                };

                string initials = n.Type switch
                {
                    "leave" => "HC",
                    "schedule" => "ĐT",
                    "system" => "ET",
                    _ => "ES"
                };

                string bgClass = n.Type switch
                {
                    "leave" => "bg-warning-subtle",
                    "schedule" => "bg-info-subtle",
                    "system" => "bg-primary-subtle",
                    _ => "bg-success-subtle"
                };

                string colorClass = n.Type switch
                {
                    "leave" => "text-warning",
                    "schedule" => "text-info",
                    "system" => "text-primary",
                    _ => "text-success"
                };

                return new TeachingNotificationDto
                {
                    NotificationId = n.NotificationId,
                    UserId = n.UserId,
                    ClassId = n.ClassId,
                    ClassName = n.Class?.ClassName,
                    Title = n.Title,
                    Content = n.Content,
                    Sender = sender,
                    Initials = initials,
                    InitialsBgClass = bgClass,
                    InitialsColorClass = colorClass,
                    Type = n.Type ?? "system",
                    IsNew = !n.IsRead,
                    IsRead = n.IsRead,
                    TimeAgo = FormatTimeAgo(n.CreatedAt),
                    CreatedAt = n.CreatedAt
                };
            }).ToList();
        }

        public async Task<bool> MarkAsReadAsync(int notificationId)
        {
            var notif = await _context.Notifications.FindAsync(notificationId);
            if (notif == null)
            {
                return false;
            }

            notif.IsRead = true;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<int> MarkAllAsReadAsync(int userId)
        {
            var unreadList = await _context.Notifications
                .Where(n => (n.UserId == userId || n.UserId == null) && !n.IsRead)
                .ToListAsync();

            foreach (var n in unreadList)
            {
                n.IsRead = true;
            }

            return await _context.SaveChangesAsync();
        }

        private static string FormatTimeAgo(DateTime createdAt)
        {
            var diff = DateTime.UtcNow - createdAt;
            if (diff.TotalMinutes < 60)
            {
                int mins = Math.Max(1, (int)diff.TotalMinutes);
                return $"{mins} phút trước";
            }
            if (diff.TotalHours < 24)
            {
                return $"{(int)diff.TotalHours} giờ trước";
            }
            if (diff.TotalDays < 7)
            {
                return $"{(int)diff.TotalDays} ngày trước";
            }
            return createdAt.ToString("dd/MM/yyyy");
        }

        private static List<TeachingNotificationDto> GetDefaultNotifications(int userId)
        {
            return new List<TeachingNotificationDto>
            {
                new()
                {
                    NotificationId = 1,
                    UserId = userId,
                    Title = "Cập nhật Lịch giảng dạy Học kỳ mới 2026/2027",
                    Content = "Vui lòng kiểm tra lại phòng học và khung giờ giảng dạy được phân bổ mới nhất cho các lớp bắt đầu từ tuần tới.",
                    Sender = "Ban Quản Lý EduTrack",
                    Initials = "ET",
                    InitialsBgClass = "bg-primary-subtle",
                    InitialsColorClass = "text-primary",
                    Type = "schedule",
                    IsNew = true,
                    IsRead = false,
                    TimeAgo = "10 phút trước",
                    CreatedAt = DateTime.UtcNow.AddMinutes(-10)
                },
                new()
                {
                    NotificationId = 2,
                    UserId = userId,
                    Title = "Đã phân công Trợ giảng mới cho Lớp Toán 9A1",
                    Content = "Trợ giảng Âu Dương Tài đã được phân công phối hợp hỗ trợ các buổi học và điểm danh lớp của bạn.",
                    Sender = "Phòng Đào Tạo",
                    Initials = "ĐT",
                    InitialsBgClass = "bg-info-subtle",
                    InitialsColorClass = "text-info",
                    Type = "system",
                    IsNew = true,
                    IsRead = false,
                    TimeAgo = "2 giờ trước",
                    CreatedAt = DateTime.UtcNow.AddHours(-2)
                },
                new()
                {
                    NotificationId = 3,
                    UserId = userId,
                    Title = "Đơn xin nghỉ phép giảng dạy đã được phê duyệt",
                    Content = "Đơn xin nghỉ phép ngày 20/08/2026 của bạn đã được phê duyệt bởi Ban Giám đốc trung tâm.",
                    Sender = "Phòng Hành Chính & Đào Tạo",
                    Initials = "HC",
                    InitialsBgClass = "bg-warning-subtle",
                    InitialsColorClass = "text-warning",
                    Type = "leave",
                    IsNew = false,
                    IsRead = true,
                    TimeAgo = "1 ngày trước",
                    CreatedAt = DateTime.UtcNow.AddDays(-1)
                },
                new()
                {
                    NotificationId = 4,
                    UserId = userId,
                    Title = "Nhắc nhở hoàn tất nhập điểm kiểm tra định kỳ",
                    Content = "Hạn chót cập nhật kết quả bài tập Homework 01 cho các lớp 9A1 và 9B1 là 17:00 ngày Thứ Sáu tuần này.",
                    Sender = "EduTrack Staff",
                    Initials = "ES",
                    InitialsBgClass = "bg-success-subtle",
                    InitialsColorClass = "text-success",
                    Type = "system",
                    IsNew = false,
                    IsRead = true,
                    TimeAgo = "2 ngày trước",
                    CreatedAt = DateTime.UtcNow.AddDays(-2)
                }
            };
        }
    }
}

