using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using EduTrack.API.Models.DTOs;
using EduTrack.API.Models.DTOs.Management;
using EduTrack.API.Models.EF;
using EduTrack.API.Services.Management.Interfaces;
using EduTrack.API.Services.Notifications;
using EduTrack.API.Services.Teaching.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace EduTrack.API.Controllers.Management;
[ApiController, Route("api/notifications"), NotificationErrors]
[ResponseCache(NoStore = true, Location = ResponseCacheLocation.None)]
public sealed class NotificationInboxController(
    EduTrackDbContext db,
    TimeProvider? clock = null,
    IManagementNotificationService? managementService = null,
    ITeachingNotificationService? teachingService = null) : ControllerBase
{
    private readonly NotificationInboxService inbox = new(db, clock);
    private readonly NotificationRecipientSearchService search = new(db);

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] int userId) => Ok((await inbox.SnapshotAsync(userId)).Inbox);

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id, [FromQuery] int userId) => Ok(await inbox.ItemAsync(userId, id));

    [HttpGet("inbox/snapshot")]
    public async Task<IActionResult> Snapshot([FromQuery] int userId) => Ok(await inbox.SnapshotAsync(userId));
    // userId selects recipient data; this API does not authenticate callers.
    [HttpGet("inbox")]
    public async Task<IActionResult> Inbox([FromQuery] int userId) => Ok((await inbox.SnapshotAsync(userId)).Inbox);
    [HttpGet("inbox/{id:int}")]
    public async Task<IActionResult> Item(int id, [FromQuery] int userId) => Ok(await inbox.ItemAsync(userId, id));
    [HttpGet("trash")]
    public async Task<IActionResult> Trash([FromQuery] int userId)
    {
        await inbox.IdentifyAsync(userId, true);
        return Ok((await inbox.SnapshotAsync(userId)).Trash);
    }
    [HttpPatch("{id:int}/read")]
    public async Task<IActionResult> Read(int id, [FromQuery] int userId, [FromQuery] bool snapshot = false)
    {
        var state = await inbox.MutateAsync(userId, "read", id);
        if (snapshot) return Ok(state);
        return Ok(await inbox.ItemAsync(userId, id));
    }
    [HttpPatch("read-all")]
    public async Task<IActionResult> ReadAll([FromQuery] int userId) => Ok(await inbox.MutateAsync(userId, "read-all"));
    [HttpDelete("{id:int}/inbox")]
    public async Task<IActionResult> Delete(int id, [FromQuery] int userId) => Ok(await inbox.MutateAsync(userId, "delete", id));
    [HttpPost("{id:int}/restore")]
    public async Task<IActionResult> Restore(int id, [FromQuery] int userId) => Ok(await inbox.MutateAsync(userId, "restore", id));

    // =====================================================================
    // MANAGEMENT NOTIFICATIONS (/api/management/notifications)
    // =====================================================================

    [HttpGet("/api/management/notifications/recipients")]
    public async Task<IActionResult> SearchRecipients([FromQuery] int senderId,
        [FromQuery] string? query, [FromQuery] int limit = 20, CancellationToken ct = default)
        => Ok(await search.SearchAsync(senderId, query, limit, ct));

    [HttpPost("/api/management/notifications")]
    public async Task<ActionResult<NotificationDto>> Create(
        [FromBody] CreateManagementNotificationDto dto)
    {
        try
        {
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
    public async Task<ActionResult<IReadOnlyList<NotificationDto>>> GetSent([FromQuery] int senderId)
    {
        try
        {
            var sender = await inbox.IdentifyAsync(senderId, true);
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
    public async Task<IActionResult> GetTeachingNotifications([FromQuery] int userId, [FromQuery] string? status)
    {
        await inbox.IdentifyAsync(userId);
        var data = await teachingService!.GetNotificationsAsync(userId, status);
        return Ok(new { success = true, data });
    }

    [HttpPut("/api/teaching/notifications/{notificationId:int}/read")]
    public async Task<IActionResult> MarkTeachingNotificationAsRead(int notificationId, [FromQuery] int? userId = null)
    {
        if (notificationId <= 0)
        {
            return BadRequest(new { success = false, message = "Mã thông báo không hợp lệ." });
        }

        var identity = await inbox.IdentifyAsync(userId ?? 0);
        var success = await teachingService!.MarkAsReadAsync(notificationId, identity.UserId);
        if (!success)
        {
            return NotFound(new { success = false, message = $"Không tìm thấy thông báo #{notificationId}" });
        }

        return Ok(new { success = true, message = "Đã đánh dấu thông báo là đã đọc." });
    }

    [HttpPut("/api/teaching/notifications/read-all")]
    public async Task<IActionResult> MarkAllTeachingNotificationsAsRead([FromQuery] int userId)
    {
        await inbox.IdentifyAsync(userId);
        var count = await teachingService!.MarkAllAsReadAsync(userId);
        return Ok(new { success = true, updatedCount = count, message = $"Đã đánh dấu {count} thông báo là đã đọc." });
    }
}
