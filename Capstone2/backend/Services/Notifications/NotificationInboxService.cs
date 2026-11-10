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
    public async Task<NotificationInboxSnapshot> SnapshotAsync(int userId)
    {
        var identity = await IdentifyAsync(userId);
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
        ClassId = r.Notification.ClassId, ClassName = r.Notification.Class?.ClassName,
        IsRead = r.IsRead, ReadAt = r.ReadAt.HasValue ? Utc(r.ReadAt.Value) : null,
        DeletedAt = r.DeletedAt.HasValue ? Utc(r.DeletedAt.Value) : null,
        TargetScope = r.Notification.TargetScope, TargetRole = r.Notification.TargetRole
    };
}
