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
            // Đảm bảo dữ liệu thông báo thật được lưu trong Database cho GV/TA
            await EnsureUserNotificationsSeededAsync(userId);

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

            // 2. Query thông báo dành riêng cho user này HOẶC thông báo chung hệ thống / theo lớp phụ trách
            // Loại trừ hoàn toàn thông báo đích danh của học sinh/phụ huynh khác (n.UserId != userId)
            var query = _context.Notifications
                .AsNoTracking()
                .Include(n => n.Class)
                .Where(n => n.UserId == userId
                         || (n.UserId == null && (n.ClassId == null || assignedClassIds.Contains(n.ClassId.Value))));

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

            return notifications.Select(MapToDto).ToList();
        }

        public async Task<bool> MarkAsReadAsync(int notificationId)
        {
            var notif = await _context.Notifications.FirstOrDefaultAsync(n => n.NotificationId == notificationId);
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

            var unreadList = await _context.Notifications
                .Where(n => !n.IsRead && (n.UserId == userId || (n.UserId == null && (n.ClassId == null || assignedClassIds.Contains(n.ClassId.Value)))))
                .ToListAsync();

            foreach (var n in unreadList)
            {
                n.IsRead = true;
            }

            return await _context.SaveChangesAsync();
        }

        private async Task EnsureUserNotificationsSeededAsync(int userId)
        {
            bool hasUserNotifications = await _context.Notifications.AnyAsync(n => n.UserId == userId);
            if (hasUserNotifications)
            {
                return;
            }

            bool isTa = userId == 5;
            var initialList = isTa
                ? new List<Notification>
                {
                    new()
                    {
                        UserId = userId,
                        ClassId = 1,
                        Title = "Phân công Lịch trực & Hỗ trợ Lớp Toán 9A1",
                        Content = "Bạn đã được phân công trợ giảng cho Lớp Toán 9A1 (ThS. Hoàng Quốc Việt phụ trách). Vui lòng kiểm tra lịch trực chi tiết.",
                        Type = "schedule",
                        IsRead = false,
                        CreatedAt = DateTime.UtcNow.AddMinutes(-20)
                    },
                    new()
                    {
                        UserId = userId,
                        ClassId = 1,
                        Title = "Thông báo kiểm tra bài tập tuần 1 của Lớp 9A1",
                        Content = "Vui lòng phối hợp với ThS. Hoàng Quốc Việt kiểm tra bài làm của các học sinh nộp bù trước ngày Thứ Sáu.",
                        Type = "homework",
                        IsRead = false,
                        CreatedAt = DateTime.UtcNow.AddHours(-2)
                    },
                    new()
                    {
                        UserId = userId,
                        ClassId = 1,
                        Title = "Đơn xin nghỉ trực ca tối đã được tiếp nhận",
                        Content = "Đơn xin phép vắng mặt buổi trực tối 25/08 đã được ban giáo vụ tiếp nhận và duyệt.",
                        Type = "leave",
                        IsRead = true,
                        CreatedAt = DateTime.UtcNow.AddDays(-1)
                    },
                    new()
                    {
                        UserId = userId,
                        ClassId = null,
                        Title = "Họp Hội đồng chuyên môn & Đào tạo trợ giảng",
                        Content = "Kính mời quý trợ giảng tham dự buổi hướng dẫn sử dụng công cụ hỗ trợ chấm bài tập trực tuyến.",
                        Type = "system",
                        IsRead = true,
                        CreatedAt = DateTime.UtcNow.AddDays(-3)
                    }
                }
                : new List<Notification>
                {
                    new()
                    {
                        UserId = userId,
                        ClassId = 1,
                        Title = "Cập nhật Lịch giảng dạy Học kỳ mới 2026/2027",
                        Content = "Thời khóa biểu chính thức học kỳ mới đã được cập nhật. Thầy/Cô vui lòng kiểm tra phòng học và thời gian bắt đầu từ tuần tới.",
                        Type = "schedule",
                        IsRead = false,
                        CreatedAt = DateTime.UtcNow.AddMinutes(-30)
                    },
                    new()
                    {
                        UserId = userId,
                        ClassId = 1,
                        Title = "Đã phân công Trợ giảng mới cho Lớp Toán 9A1",
                        Content = "Trợ giảng Âu Dương Tài đã được phân công phối hợp hỗ trợ các buổi học và điểm danh lớp của bạn.",
                        Type = "system",
                        IsRead = false,
                        CreatedAt = DateTime.UtcNow.AddHours(-2)
                    },
                    new()
                    {
                        UserId = userId,
                        ClassId = 1,
                        Title = "Đơn kiến nghị cơ sở vật chất đã được phê duyệt",
                        Content = "Yêu cầu thay pin micro và kiểm tra máy chiếu Phòng 201 của bạn đã được đội ngũ IT xử lý hoàn tất.",
                        Type = "leave",
                        IsRead = true,
                        CreatedAt = DateTime.UtcNow.AddDays(-1)
                    },
                    new()
                    {
                        UserId = userId,
                        ClassId = 1,
                        Title = "Nhắc nhở hoàn tất nhập điểm kiểm tra định kỳ",
                        Content = "Hạn chót cập nhật kết quả bài tập Homework 01 cho các lớp 9A1 và 9B1 là 17:00 ngày Thứ Sáu tuần này.",
                        Type = "system",
                        IsRead = true,
                        CreatedAt = DateTime.UtcNow.AddDays(-2)
                    }
                };

            _context.Notifications.AddRange(initialList);
            await _context.SaveChangesAsync();
        }

        private static TeachingNotificationDto MapToDto(Notification n)
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
    }
}
