using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using EduTrack.API.Helpers.Auth;
using EduTrack.API.Models.DTOs;
using EduTrack.API.Models.DTOs.Management;
using EduTrack.API.Models.EF;
using EduTrack.API.Services.Management.Interfaces;
using EduTrack.API.Services.Notifications;
using EduTrack.API.Services.Teaching.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduTrack.API.Controllers.Management;

[ApiController, Route("api/notifications"), NotificationErrors]
[Authorize]
[ResponseCache(NoStore = true, Location = ResponseCacheLocation.None)]
public sealed class NotificationInboxController(
    EduTrackDbContext db,
    TimeProvider? clock = null,
    IManagementNotificationService? managementService = null,
    ITeachingNotificationService? teachingService = null) : ControllerBase
{
    private readonly NotificationInboxService inbox = new(db, clock);
    private readonly NotificationRecipientSearchService search = new(db);

    private int ResolveCallerUserId(int userId) =>
        JwtAuthHelper.ResolveEffectiveUserId(
            User,
            userId,
            JwtAuthHelper.RoleStudent,
            JwtAuthHelper.RoleParent,
            JwtAuthHelper.RoleTeacher,
            JwtAuthHelper.RoleTeachingAssistant);

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] int userId) => Ok((await inbox.SnapshotAsync(ResolveCallerUserId(userId))).Inbox);

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id, [FromQuery] int userId) => Ok(await inbox.ItemAsync(ResolveCallerUserId(userId), id));

    [HttpGet("inbox/snapshot")]
    public async Task<IActionResult> Snapshot([FromQuery] int userId) => Ok(await inbox.SnapshotAsync(ResolveCallerUserId(userId)));

    [HttpGet("inbox")]
    public async Task<IActionResult> Inbox([FromQuery] int userId) => Ok((await inbox.SnapshotAsync(ResolveCallerUserId(userId))).Inbox);

    [HttpGet("inbox/{id:int}")]
    public async Task<IActionResult> Item(int id, [FromQuery] int userId) => Ok(await inbox.ItemAsync(ResolveCallerUserId(userId), id));

    [HttpPatch("{id:int}/read")]
    public async Task<IActionResult> Read(int id, [FromQuery] int userId, [FromQuery] bool snapshot = false)
    {
        var uid = ResolveCallerUserId(userId);
        var state = await inbox.MutateAsync(uid, "read", id);
        if (snapshot) return Ok(state);
        return Ok(await inbox.ItemAsync(uid, id));
    }

    [HttpPatch("read-all")]
    public async Task<IActionResult> ReadAll([FromQuery] int userId) => Ok(await inbox.MutateAsync(ResolveCallerUserId(userId), "read-all"));

    // =====================================================================
    // MANAGEMENT NOTIFICATIONS (/api/management/notifications)
    // =====================================================================

    [HttpGet("/api/management/notifications/recipients")]
    [Authorize(Roles = JwtAuthHelper.RolesManagement)]
    public async Task<IActionResult> SearchRecipients([FromQuery] int senderId,
        [FromQuery] string? query, [FromQuery] int limit = 20, CancellationToken ct = default)
        => Ok(await search.SearchAsync(JwtAuthHelper.GetAuthenticatedUserId(User) ?? senderId, query, limit, ct));

    [HttpPost("/api/management/notifications")]
    [Authorize(Roles = JwtAuthHelper.RolesManagement)]
    public async Task<ActionResult<NotificationDto>> Create(
        [FromBody] CreateManagementNotificationDto dto)
    {
        try
        {
            if (JwtAuthHelper.GetAuthenticatedUserId(User) is int authUid && authUid > 0)
            {
                dto.SenderId = authUid;
            }
            await inbox.IdentifyAsync(dto.SenderId, true);
            var notification = await managementService!.CreateAsync(dto);
            return Created($"/api/notifications/{notification.NotificationId}", notification);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("/api/management/notifications/sent")]
    [Authorize(Roles = JwtAuthHelper.RolesManagement)]
    public async Task<ActionResult<IReadOnlyList<NotificationDto>>> GetSent([FromQuery] int senderId)
    {
        try
        {
            var effectiveSenderId = senderId > 0 ? senderId : (JwtAuthHelper.GetAuthenticatedUserId(User) ?? 0);
            var sender = await inbox.IdentifyAsync(effectiveSenderId, true);
            return Ok(await managementService!.GetSentAsync(sender.UserId));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // =====================================================================
    // TEACHING NOTIFICATIONS (/api/teaching/notifications)
    // =====================================================================

    [HttpGet("/api/teaching/notifications")]
    [Authorize(Roles = JwtAuthHelper.RolesTeaching)]
    public async Task<IActionResult> GetTeachingNotifications([FromQuery] int userId, [FromQuery] string? status)
    {
        var effectiveUserId = JwtAuthHelper.ResolveEffectiveUserId(User, userId, JwtAuthHelper.RoleTeacher, JwtAuthHelper.RoleTeachingAssistant);
        await inbox.IdentifyAsync(effectiveUserId);
        var data = await teachingService!.GetNotificationsAsync(effectiveUserId, status);
        return Ok(new { success = true, data });
    }

    [HttpPut("/api/teaching/notifications/{notificationId:int}/read")]
    [Authorize(Roles = JwtAuthHelper.RolesTeaching)]
    public async Task<IActionResult> MarkTeachingNotificationAsRead(int notificationId, [FromQuery] int? userId = null)
    {
        if (notificationId <= 0)
        {
            return BadRequest(new { success = false, message = "Mã thông báo không hợp lệ." });
        }

        var effectiveUserId = JwtAuthHelper.ResolveEffectiveUserId(User, userId ?? 0, JwtAuthHelper.RoleTeacher, JwtAuthHelper.RoleTeachingAssistant);
        var identity = await inbox.IdentifyAsync(effectiveUserId);
        var success = await teachingService!.MarkAsReadAsync(notificationId, identity.UserId);
        if (!success)
        {
            return NotFound(new { success = false, message = $"Không tìm thấy thông báo #{notificationId}" });
        }

        return Ok(new { success = true, message = "Đã đánh dấu thông báo là đã đọc." });
    }

    [HttpPut("/api/teaching/notifications/read-all")]
    [Authorize(Roles = JwtAuthHelper.RolesTeaching)]
    public async Task<IActionResult> MarkAllTeachingNotificationsAsRead([FromQuery] int userId)
    {
        var effectiveUserId = JwtAuthHelper.ResolveEffectiveUserId(User, userId, JwtAuthHelper.RoleTeacher, JwtAuthHelper.RoleTeachingAssistant);
        await inbox.IdentifyAsync(effectiveUserId);
        var count = await teachingService!.MarkAllAsReadAsync(effectiveUserId);
        return Ok(new { success = true, updatedCount = count, message = $"Đã đánh dấu {count} thông báo là đã đọc." });
    }
}
