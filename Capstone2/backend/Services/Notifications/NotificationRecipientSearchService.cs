using EduTrack.API.Models.EF;
using Microsoft.EntityFrameworkCore;

namespace EduTrack.API.Services.Notifications;

public sealed record NotificationRecipientOption(int UserId, string UserCode, string FullName, string[] Roles);

// Notification-specific search: bounded in SQL, no password/contact data returned.
public sealed class NotificationRecipientSearchService(EduTrackDbContext db)
{
    private static readonly string[] Roles =
        ["center_manager", "admin_staff", "teacher", "teaching_assistant", "student", "parent"];

    public async Task<IReadOnlyList<NotificationRecipientOption>> SearchAsync(
        int senderId, string? query, int limit = 20, CancellationToken ct = default)
    {
        await new NotificationInboxService(db).IdentifyAsync(senderId, true);
        var term = query?.Trim() ?? "";
        if (term.Length < 2) return [];
        if (term.Length > 100)
            throw new NotificationAccessException(400, "Từ khóa tìm kiếm tối đa 100 ký tự.");
        return await db.Users.AsNoTracking()
            .Where(u => u.Status == "active" && u.UserId != senderId
                && u.UserRoles.Any(r => Roles.Contains(r.Role.RoleName))
                && (u.FullName.Contains(term) || u.UserCode.Contains(term)))
            .OrderBy(u => u.FullName).ThenBy(u => u.UserId)
            .Take(Math.Clamp(limit, 1, 20))
            .Select(u => new NotificationRecipientOption(u.UserId, u.UserCode, u.FullName,
                u.UserRoles.Select(r => r.Role.RoleName).ToArray()))
            .ToListAsync(ct);
    }
}
