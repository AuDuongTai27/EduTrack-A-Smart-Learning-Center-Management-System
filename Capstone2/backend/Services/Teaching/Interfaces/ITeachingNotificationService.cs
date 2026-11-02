using System.Collections.Generic;
using System.Threading.Tasks;
using EduTrack.API.Models.DTOs.Teaching;

namespace EduTrack.API.Services.Teaching.Interfaces
{
    /// <summary>
    /// Service quản lý Thông báo dành cho Giáo viên & Trợ giảng
    /// </summary>
    public interface ITeachingNotificationService
    {
        Task<List<TeachingNotificationDto>> GetNotificationsAsync(int userId, string? status = null);
        Task<bool> MarkAsReadAsync(int notificationId);
        Task<int> MarkAllAsReadAsync(int userId);
    }
}

