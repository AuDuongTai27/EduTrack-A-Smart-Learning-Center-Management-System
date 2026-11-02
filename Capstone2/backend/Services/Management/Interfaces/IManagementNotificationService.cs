using System.Collections.Generic;
using System.Threading.Tasks;
using EduTrack.API.Models.DTOs;
using EduTrack.API.Models.DTOs.Management;

namespace EduTrack.API.Services.Management.Interfaces
{
    public interface IManagementNotificationService
    {
        Task<NotificationDto> CreateAsync(CreateManagementNotificationDto dto);
        Task<IReadOnlyList<NotificationDto>> GetSentAsync(int senderId);
        Task<IReadOnlyList<NotificationDto>> GetInboxAsync(int userId);
        Task<NotificationDto?> MarkReadAsync(int notificationId, int userId);
        Task<bool> HideReadAsync(int notificationId, int userId);
    }
}
