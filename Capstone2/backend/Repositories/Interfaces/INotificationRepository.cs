using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using EduTrack.API.Models.Entities;

namespace EduTrack.API.Repositories.Interfaces
{
    public interface INotificationRepository : IGenericRepository<Notification>
    {
        Task<List<int>> ResolveRecipientIdsAsync(
            string targetScope, string? targetRole, int? classId, int? userId, int? excludedUserId = null);

        Task<Notification> CreateWithRecipientsAsync(
            Notification notification, IReadOnlyCollection<int> recipientIds);

        Task<List<Notification>> GetSentAsync(int senderId);
        Task<List<Notification>> GetInboxAsync(int userId);
        Task<Notification?> GetInboxItemAsync(int notificationId, int userId);
        Task<bool> MarkReadAsync(int notificationId, int userId);
        Task<bool> HideReadAsync(int notificationId, int userId);
    }
}
