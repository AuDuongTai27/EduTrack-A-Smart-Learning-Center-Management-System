using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using EduTrack.API.Models.EF;
using EduTrack.API.Models.Entities;
using EduTrack.API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace EduTrack.API.Repositories.Implementation
{
    public class NotificationRepository : GenericRepository<Notification>, INotificationRepository
    {
        private static readonly string[] AllowedRoles =
        {
            "center_manager", "admin_staff", "teacher", "teaching_assistant", "student", "parent"
        };

        public NotificationRepository(EduTrackDbContext context) : base(context) { }

        public override async Task<IEnumerable<Notification>> GetAllAsync()
        {
            return await _dbSet.AsNoTracking()
                .Include(n => n.User)
                .Include(n => n.Class)
                .Include(n => n.Sender)
                .Include(n => n.Recipients)
                .AsSplitQuery()
                .OrderByDescending(n => n.CreatedAt)
                .ToListAsync();
        }

        public override async Task<Notification?> GetByIdAsync(int id)
        {
            return await _dbSet.AsNoTracking()
                .Include(n => n.User)
                .Include(n => n.Class)
                .Include(n => n.Sender)
                .Include(n => n.Recipients)
                .AsSplitQuery()
                .FirstOrDefaultAsync(n => n.NotificationId == id);
        }

        public async Task<List<int>> ResolveRecipientIdsAsync(
            string targetScope, string? targetRole, int? classId, int? userId)
        {
            var users = _context.Users.AsNoTracking().Where(u => u.Status == "active")
                .Where(u => u.UserRoles.Any(ur => AllowedRoles.Contains(ur.Role.RoleName)));

            switch (targetScope)
            {
                case "all":
                    break;
                case "role":
                    users = users.Where(u => u.UserRoles.Any(ur => ur.Role.RoleName == targetRole));
                    break;
                case "user":
                    users = users.Where(u => u.UserId == userId);
                    break;
                case "class":
                    var id = classId!.Value;
                    var studentIds = _context.StudentClasses.AsNoTracking()
                        .Where(sc => sc.ClassId == id && sc.Status == "active")
                        .Select(sc => sc.StudentId);
                    var teacherIds = _context.TeacherClasses.AsNoTracking()
                        .Where(tc => tc.ClassId == id && tc.Status == "active")
                        .Select(tc => tc.TeacherId);
                    var assistantIds = _context.TaClasses.AsNoTracking()
                        .Where(tc => tc.ClassId == id && tc.Status == "active")
                        .Select(tc => tc.TaId);
                    users = users.Where(u => studentIds.Contains(u.UserId)
                        || teacherIds.Contains(u.UserId)
                        || assistantIds.Contains(u.UserId));
                    break;
                default:
                    throw new ArgumentOutOfRangeException(nameof(targetScope));
            }

            return await users.Select(u => u.UserId).Distinct().ToListAsync();
        }

        public async Task<Notification> CreateWithRecipientsAsync(
            Notification notification, IReadOnlyCollection<int> recipientIds)
        {
            if (recipientIds.Count == 0)
                throw new InvalidOperationException("Không có người nhận hợp lệ.");

            notification.Recipients = recipientIds.Distinct()
                .Select(id => new NotificationRecipient
                {
                    UserId = id,
                    IsRead = false,
                    ReadAt = null
                }).ToList();

            // EF Core wraps this single SaveChanges operation in a transaction.
            await _context.Notifications.AddAsync(notification);
            await _context.SaveChangesAsync();
            return notification;
        }

        public Task<List<Notification>> GetSentAsync(int senderId) =>
            _dbSet.AsNoTracking()
                .Where(n => n.SenderId == senderId)
                .Include(n => n.Sender)
                .Include(n => n.Class)
                .Include(n => n.Recipients)
                .AsSplitQuery()
                .OrderByDescending(n => n.CreatedAt)
                .ToListAsync();

        public Task<List<Notification>> GetInboxAsync(int userId) =>
            _dbSet.AsNoTracking()
                .Where(n => n.SenderId != userId && n.Recipients.Any(r => r.UserId == userId && r.DeletedAt == null))
                .Include(n => n.Sender)
                .Include(n => n.Class)
                .Include(n => n.Recipients.Where(r => r.UserId == userId && r.DeletedAt == null))
                .AsSplitQuery()
                .OrderByDescending(n => n.CreatedAt)
                .ToListAsync();

        public Task<Notification?> GetInboxItemAsync(int notificationId, int userId) =>
            _dbSet.AsNoTracking()
                .Where(n => n.NotificationId == notificationId
                    && n.SenderId != userId
                    && n.Recipients.Any(r => r.UserId == userId && r.DeletedAt == null))
                .Include(n => n.Sender)
                .Include(n => n.Class)
                .Include(n => n.Recipients.Where(r => r.UserId == userId && r.DeletedAt == null))
                .AsSplitQuery()
                .FirstOrDefaultAsync();

        public async Task<bool> MarkReadAsync(int notificationId, int userId)
        {
            // Atomic update: only the intended recipient's state is changed.
            var updated = await _context.NotificationRecipients
                .Where(r => r.NotificationId == notificationId
                    && r.UserId == userId && r.DeletedAt == null && !r.IsRead)
                .ExecuteUpdateAsync(setters => setters
                    .SetProperty(r => r.IsRead, true)
                    .SetProperty(r => r.ReadAt, DateTime.UtcNow));

            return updated > 0 || await _context.NotificationRecipients.AsNoTracking()
                .AnyAsync(r => r.NotificationId == notificationId && r.UserId == userId
                    && r.DeletedAt == null);
        }
        public async Task<bool> HideReadAsync(int notificationId, int userId)
        {
            // Soft delete only one recipient's read notification.
            // No other recipient or sender history is modified.
            var affected = await _context.NotificationRecipients
                .Where(r => r.NotificationId == notificationId && r.UserId == userId
                    && r.IsRead && r.DeletedAt == null)
                .ExecuteUpdateAsync(setters => setters
                    .SetProperty(r => r.DeletedAt, DateTime.UtcNow));
            return affected > 0;
        }
    }
}
