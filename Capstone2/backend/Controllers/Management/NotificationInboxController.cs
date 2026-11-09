using EduTrack.API.Models.EF;
using EduTrack.API.Services.Notifications;
using Microsoft.AspNetCore.Mvc;

namespace EduTrack.API.Controllers.Management;
[ApiController, Route("api/notifications"), NotificationErrors]
[ResponseCache(NoStore = true, Location = ResponseCacheLocation.None)]
public sealed class NotificationInboxController(EduTrackDbContext db, TimeProvider? clock = null) : ControllerBase
{
    private readonly NotificationInboxService inbox = new(db, clock);
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
}
