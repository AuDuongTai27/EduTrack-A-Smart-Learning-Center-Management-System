using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using EduTrack.API.Models.DTOs;
using EduTrack.API.Models.DTOs.Management;
using EduTrack.API.Models.Entities;
using EduTrack.API.Repositories.Interfaces;
using EduTrack.API.Services.Management.Interfaces;

namespace EduTrack.API.Services.Management.Implementation
{
    public class ManagementNotificationService : IManagementNotificationService
    {
        private static readonly HashSet<string> AllowedRoles = new(StringComparer.Ordinal)
        {
            "center_manager", "admin_staff", "teacher", "teaching_assistant", "student"
        };

        private static readonly HashSet<string> AllowedTypes = new(StringComparer.Ordinal)
        {
            "announcement", "system", "reminder", "tuition", "academic",
            "schedule", "homework", "class"
        };

        private readonly INotificationRepository _notificationRepository;
        private readonly IUserRepository _userRepository;
        private readonly IClassRepository _classRepository;

        public ManagementNotificationService(
            INotificationRepository notificationRepository,
            IUserRepository userRepository,
            IClassRepository classRepository)
        {
            _notificationRepository = notificationRepository;
            _userRepository = userRepository;
            _classRepository = classRepository;
        }

        public async Task<NotificationDto> CreateAsync(CreateManagementNotificationDto dto)
        {
            var sender = await RequireActiveUserAsync(dto.SenderId);
            if (!HasRole(sender, "center_manager") && !HasRole(sender, "admin_staff"))
                throw new InvalidOperationException("Chỉ Center Manager hoặc Admin Staff được phát hành thông báo.");

            var title = dto.Title?.Trim() ?? "";
            var content = dto.Content?.Trim() ?? "";
            if (string.IsNullOrWhiteSpace(title) || string.IsNullOrWhiteSpace(content))
                throw new InvalidOperationException("Tiêu đề và nội dung thông báo không được để trống.");
            if (title.Length > 200 || content.Length > 4000)
                throw new InvalidOperationException("Tiêu đề hoặc nội dung vượt quá độ dài cho phép.");

            var type = dto.Type?.Trim().ToLowerInvariant() ?? "";
            if (!AllowedTypes.Contains(type))
                throw new InvalidOperationException("Loại thông báo không hợp lệ.");

            var scope = dto.TargetScope?.Trim().ToLowerInvariant() ?? "";
            var targetRole = dto.TargetRole?.Trim().ToLowerInvariant();
            if (string.IsNullOrEmpty(targetRole)) targetRole = null;

            switch (scope)
            {
                case "all":
                    if (targetRole != null || dto.ClassId.HasValue || dto.UserId.HasValue)
                        throw new InvalidOperationException("Gửi toàn trung tâm không chọn vai trò, lớp hoặc cá nhân.");
                    break;
                case "role":
                    if (targetRole == null || !AllowedRoles.Contains(targetRole)
                        || dto.ClassId.HasValue || dto.UserId.HasValue)
                        throw new InvalidOperationException("Hãy chọn một vai trò hợp lệ.");
                    break;
                case "class":
                    if (!dto.ClassId.HasValue || dto.ClassId.Value <= 0
                        || targetRole != null || dto.UserId.HasValue)
                        throw new InvalidOperationException("Hãy chọn lớp học hợp lệ.");
                    if (await _classRepository.GetByIdAsync(dto.ClassId.Value) == null)
                        throw new InvalidOperationException("Không tìm thấy lớp học.");
                    break;
                case "user":
                    if (!dto.UserId.HasValue || dto.UserId.Value <= 0
                        || targetRole != null || dto.ClassId.HasValue)
                        throw new InvalidOperationException("Hãy chọn người nhận hợp lệ.");
                    break;
                default:
                    throw new InvalidOperationException("Phạm vi nhận phải là all, role, class hoặc user.");
            }

            var recipientIds = await _notificationRepository.ResolveRecipientIdsAsync(
                scope, targetRole, dto.ClassId, dto.UserId);
            // Người gửi theo dõi thông báo trong Sent, không nhận bản sao ở Inbox.
            recipientIds.Remove(sender.UserId);
            if (recipientIds.Count == 0)
                throw new InvalidOperationException("Không có người nhận hợp lệ khác với người gửi.");

            var notification = new Notification
            {
                SenderId = sender.UserId,
                UserId = null, // Legacy user_id is not the sender; recipients have their own table.
                ClassId = scope == "class" ? dto.ClassId : null,
                Title = title,
                Content = content,
                Type = type,
                TargetScope = scope,
                TargetRole = scope == "role" ? targetRole : null,
                IsRead = false, // Legacy field only; see notification_recipients for per-user state.
                CreatedAt = DateTime.UtcNow
            };

            var created = await _notificationRepository.CreateWithRecipientsAsync(notification, recipientIds);
            var saved = await _notificationRepository.GetByIdAsync(created.NotificationId)
                ?? throw new InvalidOperationException("Không thể tải thông báo sau khi tạo.");
            return MapToDto(saved, null);
        }

        public async Task<IReadOnlyList<NotificationDto>> GetSentAsync(int senderId)
        {
            var sender = await RequireActiveUserAsync(senderId);
            if (!HasRole(sender, "center_manager") && !HasRole(sender, "admin_staff"))
                throw new InvalidOperationException("Tài khoản không có quyền xem thông báo đã gửi.");
            var notifications = await _notificationRepository.GetSentAsync(senderId);
            return notifications.Select(n => MapToDto(n, null)).ToList();
        }

        public async Task<IReadOnlyList<NotificationDto>> GetInboxAsync(int userId)
        {
            await RequireActiveUserAsync(userId);
            var notifications = await _notificationRepository.GetInboxAsync(userId);
            return notifications.Select(n => MapToDto(n, userId)).ToList();
        }

        public async Task<NotificationDto?> MarkReadAsync(int notificationId, int userId)
        {
            if (notificationId <= 0) return null;
            await RequireActiveUserAsync(userId);
            if (!await _notificationRepository.MarkReadAsync(notificationId, userId))
                return null;

            var notification = await _notificationRepository.GetInboxItemAsync(notificationId, userId);
            return notification == null ? null : MapToDto(notification, userId);
        }

        public async Task<bool> HideReadAsync(int notificationId, int userId)
        {
            if (notificationId <= 0) return false;
            await RequireActiveUserAsync(userId);
            var notification = await _notificationRepository.GetInboxItemAsync(notificationId, userId);
            if (notification == null) return false;
            var recipient = notification.Recipients.FirstOrDefault(r => r.UserId == userId);
            if (recipient == null) return false;
            if (!recipient.IsRead)
                throw new InvalidOperationException("Chỉ có thể xóa thông báo đã đọc.");
            return await _notificationRepository.HideReadAsync(notificationId, userId);
        }

        private async Task<User> RequireActiveUserAsync(int userId)
        {
            if (userId <= 0)
                throw new InvalidOperationException("UserId không hợp lệ.");

            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null || !string.Equals(user.Status, "active", StringComparison.OrdinalIgnoreCase)
                || !user.UserRoles.Any(ur => ur.Role != null && AllowedRoles.Contains(ur.Role.RoleName)))
                throw new InvalidOperationException("Tài khoản không hợp lệ hoặc không hoạt động.");
            return user;
        }

        private static bool HasRole(User user, string role) =>
            user.UserRoles.Any(ur => ur.Role != null
                && string.Equals(ur.Role.RoleName, role, StringComparison.OrdinalIgnoreCase));

        private static NotificationDto MapToDto(Notification n, int? currentUserId)
        {
            var recipient = currentUserId.HasValue
                ? n.Recipients.FirstOrDefault(r => r.UserId == currentUserId.Value)
                : null;

            return new NotificationDto
            {
                NotificationId = n.NotificationId,
                UserId = n.UserId,
                UserName = n.User?.FullName,
                ClassId = n.ClassId,
                ClassName = n.Class?.ClassName,
                Title = n.Title,
                Content = n.Content,
                Type = n.Type,
                IsRead = currentUserId.HasValue ? recipient?.IsRead ?? false : n.IsRead,
                CreatedAt = n.CreatedAt,
                SenderId = n.SenderId,
                SenderName = n.Sender?.FullName,
                TargetScope = n.TargetScope,
                TargetRole = n.TargetRole,
                RecipientCount = currentUserId.HasValue ? null : n.Recipients.Count,
                ReadAt = recipient?.ReadAt
            };
        }
    }
}
