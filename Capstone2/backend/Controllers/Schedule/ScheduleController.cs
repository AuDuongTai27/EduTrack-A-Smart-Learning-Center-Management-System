using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using EduTrack.API.Models.DTOs;
using EduTrack.API.Models.DTOs.Schedule;
using EduTrack.API.Models.EF;
using EduTrack.API.Services.Interfaces;
using EduTrack.API.Services.Schedule;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MySqlConnector;

namespace EduTrack.API.Controllers.Schedule;

/// <summary>
/// API thống nhất quản lý và truy vấn Thời khóa biểu, Ca học cố định & Phiên học
/// </summary>
[ApiController]
[Route("api/schedule")]
[Tags("Schedule & Class Sessions")]
public sealed class ScheduleController(
    EduTrackDbContext context,
    TimeProvider? clock = null,
    IClassScheduleService? classScheduleService = null,
    IClassSessionService? classSessionService = null) : ControllerBase
{
    // =====================================================================
    // 1. SCHEDULE SESSIONS READ (/api/schedule/sessions)
    // =====================================================================

    [HttpGet("sessions")]
    [ResponseCache(NoStore = true, Location = ResponseCacheLocation.None)]
    public async Task<IActionResult> Get([FromQuery] ScheduleQuery query, [FromQuery] int userId, CancellationToken ct)
    {
        try { return Ok(await new ScheduleReadService(context).GetSessions(userId, query, ct)); }
        catch (ScheduleAccessException ex) { return StatusCode(ex.StatusCode, new { message = ex.Message }); }
        catch (ArgumentException ex) { return BadRequest(new { message = ex.Message }); }
    }

    [HttpGet("sessions/{id:int}")]
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

    // =====================================================================
    // 2. SCHEDULE MANAGEMENT (/api/schedule/management/*)
    // =====================================================================

    private async Task<IActionResult> ExecuteManagement<T>(Func<ScheduleManagementService, Task<T>> action)
    {
        try { return Ok(await action(new(context, clock))); }
        catch (ScheduleAccessException ex) { return StatusCode(ex.StatusCode, new { message = ex.Message }); }
        catch (ArgumentException ex) { return BadRequest(new { message = ex.Message }); }
        catch (MySqlException ex) when (ex.Number is 1205 or 1213)
        { return Conflict(new { message = "Dữ liệu đang được cập nhật đồng thời. Tải lại Preview trước khi thử lại." }); }
        catch (DbUpdateException ex) when (ex.InnerException is MySqlException { Number: 1062 or 1205 or 1213 })
        { return Conflict(new { message = "Dữ liệu/constraint đã thay đổi đồng thời. Chưa xác nhận lưu; hãy tải lại Preview để kiểm tra." }); }
    }

    [HttpGet("management/capabilities")]
    [ResponseCache(NoStore = true, Location = ResponseCacheLocation.None)]
    public Task<IActionResult> Capabilities([FromQuery] int userId, CancellationToken ct) =>
        ExecuteManagement(s => s.Capabilities(userId, ct));

    [HttpGet("management/templates")]
    [ResponseCache(NoStore = true, Location = ResponseCacheLocation.None)]
    public Task<IActionResult> Templates([FromQuery] int classId, [FromQuery] int userId, CancellationToken ct) =>
        ExecuteManagement(s => s.Templates(userId, classId, ct));

    [HttpPost("management/templates/preview")]
    [ResponseCache(NoStore = true, Location = ResponseCacheLocation.None)]
    public Task<IActionResult> PreviewTemplate(ScheduleTemplateInput input, [FromQuery] int userId, CancellationToken ct) =>
        ExecuteManagement(s => s.PreviewTemplate(userId, input, ct));

    [HttpPost("management/templates/confirm")]
    [ResponseCache(NoStore = true, Location = ResponseCacheLocation.None)]
    public Task<IActionResult> ConfirmTemplate(ScheduleTemplateInput input, [FromQuery] int userId, CancellationToken ct) =>
        ExecuteManagement(s => s.ConfirmTemplate(userId, input, ct));

    [HttpPost("management/sessions/preview")]
    [ResponseCache(NoStore = true, Location = ResponseCacheLocation.None)]
    public Task<IActionResult> Preview(ScheduleGenerationInput input, [FromQuery] int userId, CancellationToken ct) =>
        ExecuteManagement(s => s.Preview(userId, input, ct));

    [HttpPost("management/sessions/confirm")]
    [ResponseCache(NoStore = true, Location = ResponseCacheLocation.None)]
    public Task<IActionResult> Confirm(ScheduleGenerationInput input, [FromQuery] int userId, CancellationToken ct) =>
        ExecuteManagement(s => s.Confirm(userId, input, ct));

    [HttpPost("management/sessions/direct")]
    [ResponseCache(NoStore = true, Location = ResponseCacheLocation.None)]
    public Task<IActionResult> CreateDirect(DirectSessionCreateInput input, [FromQuery] int userId, CancellationToken ct) =>
        ExecuteManagement(s => s.CreateSessionDirect(userId, input, ct));

    [HttpPut("management/sessions/{sessionId:int}")]
    [ResponseCache(NoStore = true, Location = ResponseCacheLocation.None)]
    public Task<IActionResult> UpdateDirect(int sessionId, DirectSessionUpdateInput input, [FromQuery] int userId, CancellationToken ct) =>
        ExecuteManagement(s => s.UpdateSessionDirect(userId, sessionId, input, ct));

    [HttpDelete("management/sessions/{sessionId:int}")]
    [ResponseCache(NoStore = true, Location = ResponseCacheLocation.None)]
    public Task<IActionResult> DeleteDirect(int sessionId, [FromQuery] int userId, CancellationToken ct) =>
        ExecuteManagement(async s => { await s.DeleteSessionDirect(userId, sessionId, ct); return new { deleted = true, sessionId }; });

    // =====================================================================
    // 3. CLASS SCHEDULES & CLASS SESSIONS QUERIES (/api/classschedules & /api/classsessions)
    // =====================================================================

    [HttpGet("/api/classschedules")]
    public async Task<ActionResult<IEnumerable<ClassScheduleDto>>> GetAllClassSchedules()
    {
        var list = await classScheduleService!.GetAllClassSchedulesAsync();
        return Ok(list);
    }

    [HttpGet("/api/classschedules/{id:int}")]
    public async Task<ActionResult<ClassScheduleDto>> GetClassScheduleById(int id)
    {
        var item = await classScheduleService!.GetClassScheduleByIdAsync(id);
        if (item == null)
        {
            return NotFound(new { message = "Không tìm thấy dữ liệu có ID = " + id });
        }

        return Ok(item);
    }

    [HttpGet("/api/classsessions")]
    public async Task<ActionResult<IEnumerable<ClassSessionDto>>> GetAllClassSessions()
    {
        var list = await classSessionService!.GetAllClassSessionsAsync();
        return Ok(list);
    }

    [HttpGet("/api/classsessions/{id:int}")]
    public async Task<ActionResult<ClassSessionDto>> GetClassSessionById(int id)
    {
        var item = await classSessionService!.GetClassSessionByIdAsync(id);
        if (item == null)
        {
            return NotFound(new { message = "Không tìm thấy dữ liệu có ID = " + id });
        }

        return Ok(item);
    }
}
