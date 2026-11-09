using EduTrack.API.Models.DTOs.Schedule;
using EduTrack.API.Models.EF;
using EduTrack.API.Services.Schedule;
using Microsoft.AspNetCore.Mvc;
using MySqlConnector;
using Microsoft.EntityFrameworkCore;

namespace EduTrack.API.Controllers.Schedule;

[ApiController]
[Route("api/schedule/management")]
[ResponseCache(NoStore = true, Location = ResponseCacheLocation.None)]
public sealed class ScheduleManagementController(EduTrackDbContext db, TimeProvider? clock = null) : ControllerBase
{
    private async Task<IActionResult> Execute<T>(Func<ScheduleManagementService, Task<T>> action)
    {
        try { return Ok(await action(new(db, clock))); }
        catch (ScheduleAccessException ex) { return StatusCode(ex.StatusCode, new {message = ex.Message}); }
        catch (ArgumentException ex) { return BadRequest(new {message = ex.Message}); }
        catch (MySqlException ex) when (ex.Number is 1205 or 1213)
        { return Conflict(new {message = "Dữ liệu đang được cập nhật đồng thời. Tải lại Preview trước khi thử lại."}); }
        catch (DbUpdateException ex) when (ex.InnerException is MySqlException {Number: 1062 or 1205 or 1213})
        { return Conflict(new {message = "Dữ liệu/constraint đã thay đổi đồng thời. Chưa xác nhận lưu; hãy tải lại Preview để kiểm tra."}); }
    }

    [HttpGet("capabilities")]
    public Task<IActionResult> Capabilities([FromQuery] int userId, CancellationToken ct) => Execute(s => s.Capabilities(userId, ct));
    [HttpGet("templates")]
    public Task<IActionResult> Templates([FromQuery] int classId, [FromQuery] int userId, CancellationToken ct) => Execute(s => s.Templates(userId, classId, ct));
    [HttpPost("templates/preview")]
    public Task<IActionResult> PreviewTemplate(ScheduleTemplateInput input, [FromQuery] int userId, CancellationToken ct) => Execute(s => s.PreviewTemplate(userId, input, ct));
    [HttpPost("templates/confirm")]
    public Task<IActionResult> ConfirmTemplate(ScheduleTemplateInput input, [FromQuery] int userId, CancellationToken ct) => Execute(s => s.ConfirmTemplate(userId, input, ct));
    [HttpPost("sessions/preview")]
    public Task<IActionResult> Preview(ScheduleGenerationInput input, [FromQuery] int userId, CancellationToken ct) => Execute(s => s.Preview(userId, input, ct));
    [HttpPost("sessions/confirm")]
    public Task<IActionResult> Confirm(ScheduleGenerationInput input, [FromQuery] int userId, CancellationToken ct) => Execute(s => s.Confirm(userId, input, ct));
}
