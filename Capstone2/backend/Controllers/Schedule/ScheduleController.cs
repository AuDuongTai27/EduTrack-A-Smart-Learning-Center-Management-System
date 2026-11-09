using EduTrack.API.Models.DTOs.Schedule;
using EduTrack.API.Models.EF;
using EduTrack.API.Services.Schedule;
using Microsoft.AspNetCore.Mvc;

namespace EduTrack.API.Controllers.Schedule;

[ApiController]
[Route("api/schedule/sessions")]
public sealed class ScheduleController(EduTrackDbContext context) : ControllerBase
{
    // Explicit fail-closed check works even before Auth registers a challenge scheme.
    // This controller never creates a principal or accepts a client-selected identity.
    [HttpGet]
    [ResponseCache(NoStore = true, Location = ResponseCacheLocation.None)]
    public async Task<IActionResult> Get([FromQuery] ScheduleQuery query, CancellationToken ct)
    {
        try { return Ok(await new ScheduleReadService(context).GetSessions(User, query, ct)); }
        catch (ScheduleAccessException ex) { return StatusCode(ex.StatusCode, new { message = ex.Message }); }
        catch (ArgumentException ex) { return BadRequest(new { message = ex.Message }); }
    }

    [HttpGet("{id:int}")]
    [ResponseCache(NoStore = true, Location = ResponseCacheLocation.None)]
    public async Task<IActionResult> GetById(int id, CancellationToken ct)
    {
        try
        {
            var session = await new ScheduleReadService(context).GetSession(User, id, ct);
            return session == null ? NotFound(new { message = "Không tìm thấy phiên học trong phạm vi được phép." }) : Ok(session);
        }
        catch (ScheduleAccessException ex) { return StatusCode(ex.StatusCode, new { message = ex.Message }); }
    }
}
