using EduTrack.API.Models.EF;
using EduTrack.API.Services.Notifications;
using Microsoft.AspNetCore.Mvc;

namespace EduTrack.API.Controllers.Queries;
[ApiController, Route("api/notifications"), NotificationErrors]
[ResponseCache(NoStore = true, Location = ResponseCacheLocation.None)]
public sealed class NotificationsController(EduTrackDbContext db) : ControllerBase
{
    private readonly NotificationInboxService inbox = new(db);
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] int userId) => Ok((await inbox.SnapshotAsync(userId)).Inbox);
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id, [FromQuery] int userId) => Ok(await inbox.ItemAsync(userId, id));
}
