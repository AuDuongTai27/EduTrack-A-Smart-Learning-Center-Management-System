using EduTrack.API.Models.DTOs.Schedule;
using EduTrack.API.Models.EF;
using EduTrack.API.Services.Schedule;
using Microsoft.AspNetCore.Mvc;

namespace EduTrack.API.Controllers.Schedule;

[ApiController]
[Route("api/schedule/sessions")]
public sealed class ScheduleController(EduTrackDbContext context) : ControllerBase
{
    [HttpGet]
    [ResponseCache(NoStore = true, Location = ResponseCacheLocation.None)]
    public async Task<IActionResult> Get([FromQuery] ScheduleQuery query, [FromQuery] int userId, CancellationToken ct)
    {
        try { return Ok(await new ScheduleReadService(context).GetSessions(userId, query, ct)); }
        catch (ScheduleAccessException ex) { return StatusCode(ex.StatusCode, new { message = ex.Message }); }
        catch (ArgumentException ex) { return BadRequest(new { message = ex.Message }); }
    }

    [HttpGet("{id:int}")]
    [ResponseCache(NoStore = true, Location = ResponseCacheLocation.None)]
    public async Task<IActionResult> GetById(int id, [FromQuery] int userId, CancellationToken ct)
    {
        try
        {
            var session = await new ScheduleReadService(context).GetSession(userId, id, ct);
            return session == null ? NotFound(new { message = "Không tìm thấy phiên học trong phạm vi được phép." }) : Ok(session);
        }
        catch (ScheduleAccessException ex) { return StatusCode(ex.StatusCode, new { message = ex.Message }); }
    }

    [HttpGet("~/api/schedule/classes")]
    [ResponseCache(NoStore = true, Location = ResponseCacheLocation.None)]
    public async Task<IActionResult> GetClasses([FromQuery] int userId, CancellationToken ct)
    {
        try { return Ok(await new ScheduleReadService(context).GetScopedClasses(userId, ct)); }
        catch (ScheduleAccessException ex) { return StatusCode(ex.StatusCode, new { message = ex.Message }); }
    }
}
