using EduTrack.API.Models.DTOs;
using EduTrack.API.Models.EF;
using EduTrack.API.Models.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.EntityFrameworkCore;

namespace EduTrack.API.Services.Notifications;

public sealed class NotificationAccessException(int status, string message) : Exception(message)
{
    public int Status { get; } = status;
}
public sealed class NotificationErrorsAttribute : ExceptionFilterAttribute
{
    public override void OnException(ExceptionContext context)
    {
        if (context.Exception is NotificationAccessException ex)
        {
            context.Result = new ObjectResult(new { message = ex.Message }) { StatusCode = ex.Status };
            context.ExceptionHandled = true;
        }
    }
}
public sealed record NotificationIdentity(int UserId, string UserCode, string FullName,
    string? Email, string? AvatarUrl, string[] Roles);
public sealed record NotificationInboxSnapshot(NotificationIdentity Identity, DateTime ServerNowUtc,
    IReadOnlyList<NotificationDto> Inbox, IReadOnlyList<NotificationDto> Trash, int UnreadCount);

// Personal membership comes exclusively from recipient rows. GET never seeds data.
public sealed class NotificationInboxService(EduTrackDbContext db, TimeProvider? clock = null)
{
    private DateTime Now => (clock ?? TimeProvider.System).GetUtcNow().UtcDateTime;
    public static bool IsManager(NotificationIdentity identity) =>
        identity.Roles.Any(r => r is "center_manager" or "admin_staff");
    public async Task<NotificationIdentity> IdentifyAsync(int userId, bool manager = false)
    {
        if (userId <= 0) throw new NotificationAccessException(400, "Select a valid database userId.");
        var id = userId;
        var user = await db.Users.AsNoTracking().Include(u => u.UserRoles).ThenInclude(r => r.Role)
            .SingleOrDefaultAsync(u => u.UserId == id);
        if (user == null || user.Status != "active")
            throw new NotificationAccessException(400, "Tài khoản không hoạt động.");
        var roles = user.UserRoles.Select(r => r.Role.RoleName).Distinct().ToArray();
        var identity = new NotificationIdentity(id, user.UserCode, user.FullName, user.Email, user.AvatarUrl, roles);
        if (!roles.Any(r => r is "center_manager" or "admin_staff" or "teacher" or "teaching_assistant" or "ta" or "student" or "parent")
            || (manager && !IsManager(identity)))
            throw new NotificationAccessException(400, "Không có quyền thực hiện thao tác này.");
        return identity;
    }
    public async Task EnsureSeededRecipientsAsync()
    {
        var unsynced = await db.Notifications.AsNoTracking()
            .Where(n => !n.Recipients.Any())
            .ToListAsync();
        if (unsynced.Count == 0) return;

        try
        {
            var activeUsers = await db.Users.AsNoTracking()
                .Where(u => u.Status == "active")
                .Select(u => new
                {
                    u.UserId,
                    Roles = u.UserRoles.Select(ur => ur.Role.RoleName).ToList()
                })
                .ToListAsync();
            var allActiveUserIds = activeUsers.Select(u => u.UserId).ToHashSet();
            var studentClasses = await db.StudentClasses.AsNoTracking()
                .Where(sc => sc.Status == "active")
                .Select(sc => new { sc.ClassId, sc.StudentId })
                .ToListAsync();
            var teacherClasses = await db.TeacherClasses.AsNoTracking()
                .Where(tc => tc.Status == "active")
                .Select(tc => new { tc.ClassId, tc.TeacherId })
                .ToListAsync();
            var taClasses = await db.TaClasses.AsNoTracking()
                .Where(tc => tc.Status == "active")
                .Select(tc => new { tc.ClassId, tc.TaId })
                .ToListAsync();
            var parentLinks = await db.ParentStudents.AsNoTracking()
                .Select(ps => new { ps.ParentId, ps.StudentId })
                .ToListAsync();

            var toAdd = new List<NotificationRecipient>();
            foreach (var n in unsynced)
            {
                var recipientIds = new HashSet<int>();
                var role = (n.TargetRole ?? "all").Trim().ToLowerInvariant();

                if (n.UserId.HasValue && allActiveUserIds.Contains(n.UserId.Value))
                {
                    recipientIds.Add(n.UserId.Value);
                    foreach (var pl in parentLinks.Where(p => p.StudentId == n.UserId.Value && allActiveUserIds.Contains(p.ParentId)))
                        recipientIds.Add(pl.ParentId);
                    if (role == "parent")
                    {
                        foreach (var u in activeUsers.Where(u => u.Roles.Contains("parent")))
                            recipientIds.Add(u.UserId);
                    }
                }
                else if (n.ClassId.HasValue)
                {
                    var cid = n.ClassId.Value;
                    var sIds = studentClasses.Where(sc => sc.ClassId == cid).Select(sc => sc.StudentId).ToHashSet();
                    foreach (var sid in sIds.Where(allActiveUserIds.Contains))
                        recipientIds.Add(sid);
                    foreach (var pl in parentLinks.Where(p => sIds.Contains(p.StudentId) && allActiveUserIds.Contains(p.ParentId)))
                        recipientIds.Add(pl.ParentId);
                    foreach (var tid in teacherClasses.Where(tc => tc.ClassId == cid).Select(tc => tc.TeacherId).Where(allActiveUserIds.Contains))
                        recipientIds.Add(tid);
                    foreach (var taid in taClasses.Where(tc => tc.ClassId == cid).Select(tc => tc.TaId).Where(allActiveUserIds.Contains))
                        recipientIds.Add(taid);
                }
                else if (!string.IsNullOrEmpty(role) && role != "all")
                {
                    foreach (var u in activeUsers.Where(u => u.Roles.Contains(role)))
                        recipientIds.Add(u.UserId);
                    if (role == "student")
                    {
                        foreach (var pl in parentLinks.Where(p => recipientIds.Contains(p.StudentId) && allActiveUserIds.Contains(p.ParentId)))
                            recipientIds.Add(pl.ParentId);
                    }
                }
                else
                {
                    foreach (var uid in allActiveUserIds)
                        recipientIds.Add(uid);
                }

                if (n.SenderId.HasValue)
                    recipientIds.Remove(n.SenderId.Value);

                foreach (var uid in recipientIds)
                {
                    toAdd.Add(new NotificationRecipient
                    {
                        NotificationId = n.NotificationId,
                        UserId = uid,
                        IsRead = n.IsRead,
                        ReadAt = n.IsRead ? n.CreatedAt : null
                    });
                }
            }

            if (toAdd.Count > 0)
            {
                await db.NotificationRecipients.AddRangeAsync(toAdd);
                await db.SaveChangesAsync();
            }
        }
        catch
        {
            db.ChangeTracker.Clear();
        }
    }

    public async Task<NotificationInboxSnapshot> SnapshotAsync(int userId)
    {
        var identity = await IdentifyAsync(userId);
        await EnsureSeededRecipientsAsync();
        var rows = await db.NotificationRecipients.AsNoTracking().Where(r => r.UserId == identity.UserId)
            .Include(r => r.Notification).ThenInclude(n => n.Sender)
            .Include(r => r.Notification).ThenInclude(n => n.Class)
            .OrderByDescending(r => r.Notification.CreatedAt).ThenByDescending(r => r.NotificationId).ToListAsync();
        var inbox = rows.Where(r => r.DeletedAt == null).Select(Map).ToArray();
        var trash = IsManager(identity) ? rows.Where(r => r.DeletedAt != null).Select(Map).ToArray() : [];
        return new(identity, Now, inbox, trash, inbox.Count(n => !n.IsRead));
    }
    public async Task<NotificationDto> ItemAsync(int userId, int id)
    {
        var snapshot = await SnapshotAsync(userId);
        return snapshot.Inbox.SingleOrDefault(n => n.NotificationId == id)
            ?? throw new NotificationAccessException(404, "Không tìm thấy thông báo trong hộp thư.");
    }
    public async Task<NotificationInboxSnapshot> MutateAsync(int userId, string operation, int? id = null)
    {
        var identity = await IdentifyAsync(userId, operation is "delete" or "restore");
        var query = db.NotificationRecipients.Where(r => r.UserId == identity.UserId);
        if (id.HasValue) query = query.Where(r => r.NotificationId == id.Value);
        var now = Now;
        if (operation is "read" or "read-all")
        {
            if (id.HasValue && !await query.AnyAsync(r => r.DeletedAt == null))
                throw new NotificationAccessException(404, "Không tìm thấy thông báo trong hộp thư.");
            await query.Where(r => r.DeletedAt == null && !r.IsRead)
                .ExecuteUpdateAsync(s => s.SetProperty(r => r.IsRead, true).SetProperty(r => r.ReadAt, now));
        }
        else
        {
            var row = await query.AsNoTracking().SingleOrDefaultAsync();
            if (row == null) throw new NotificationAccessException(404, "Không tìm thấy thông báo.");
            if (operation == "delete")
            {
                if (!row.IsRead) throw new NotificationAccessException(409, "Chỉ có thể xóa thông báo đã đọc.");
                await query.Where(r => r.IsRead && r.DeletedAt == null)
                    .ExecuteUpdateAsync(s => s.SetProperty(r => r.DeletedAt, now));
            }
            else if (operation == "restore")
                await query.Where(r => r.DeletedAt != null).ExecuteUpdateAsync(s => s.SetProperty(r => r.DeletedAt, (DateTime?)null));
            else throw new ArgumentException("Unknown notification operation.");
        }
        return await SnapshotAsync(userId);
    }
    private static DateTime Utc(DateTime date) => DateTime.SpecifyKind(date, DateTimeKind.Utc);
    private static NotificationDto Map(NotificationRecipient r) => new()
    {
        NotificationId = r.NotificationId, Title = r.Notification.Title, Content = r.Notification.Content,
        Type = r.Notification.Type, CreatedAt = Utc(r.Notification.CreatedAt),
        SenderId = r.Notification.SenderId, SenderName = r.Notification.Sender?.FullName,
        SenderAvatarUrl = r.Notification.Sender?.AvatarUrl,
        ClassId = r.Notification.ClassId, ClassName = r.Notification.Class?.ClassName,
        IsRead = r.IsRead, ReadAt = r.ReadAt.HasValue ? Utc(r.ReadAt.Value) : null,
        DeletedAt = r.DeletedAt.HasValue ? Utc(r.DeletedAt.Value) : null,
        TargetScope = r.Notification.TargetScope, TargetRole = r.Notification.TargetRole
    };
}
