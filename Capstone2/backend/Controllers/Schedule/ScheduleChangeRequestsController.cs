using EduTrack.API.Models.DTOs.Schedule;
using EduTrack.API.Models.EF;
using EduTrack.API.Services.Schedule;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MySqlConnector;

namespace EduTrack.API.Controllers.Schedule;

[ApiController, Route("api/schedule/change-requests")]
[ResponseCache(NoStore=true,Location=ResponseCacheLocation.None)]
public sealed class ScheduleChangeRequestsController(EduTrackDbContext db,IConfiguration configuration,TimeProvider? clock=null) : ControllerBase
{
    private ScheduleChangeRequestService Service => new(db,new(configuration.GetValue<bool>("ScheduleChangeRequests:GenericRoutesGuarded"),
        configuration.GetValue<bool>("ScheduleChangeRequests:AttendanceWritesCoordinated")),clock);
    private async Task<IActionResult> Execute<T>(Func<ScheduleChangeRequestService,Task<T>> action)
    {
        try{return Ok(await action(Service));}
        catch(ScheduleAccessException e){return StatusCode(e.StatusCode,new {message=e.Message});}
        catch(ArgumentException e){return BadRequest(new {message=e.Message});}
        catch(MySqlException e) when(e.Number is 1062 or 1205 or 1213){return Conflict(new {message="Dữ liệu thay đổi đồng thời; tải lại request/Preview để kiểm tra."});}
        catch(DbUpdateException e) when(e.InnerException is MySqlException {Number:1062 or 1205 or 1213}){return Conflict(new {message="Chưa xác nhận lưu; tải lại request/Preview để kiểm tra."});}
    }
    [HttpGet("capabilities")] public Task<IActionResult> Capabilities(CancellationToken ct)=>Execute(s=>s.Capabilities(User,ct));
    [HttpGet] public Task<IActionResult> List(CancellationToken ct)=>Execute(s=>s.List(User,ct));
    [HttpGet("{id:int}")] public Task<IActionResult> Get(int id,CancellationToken ct)=>Execute(s=>s.Get(User,id,ct));
    [HttpPost("preview")] public Task<IActionResult> Preview(ScheduleChangeInput input,CancellationToken ct)=>Execute(s=>s.Preview(User,input,ct));
    [HttpPost] public Task<IActionResult> Submit(ScheduleChangeInput input,CancellationToken ct)=>Execute(s=>s.Submit(User,input,ct));
    [HttpPost("{id:int}/claim")] public Task<IActionResult> Claim(int id,CancellationToken ct)=>Execute(s=>s.Claim(User,id,ct));
    [HttpPost("{id:int}/decision-preview")] public Task<IActionResult> PreviewDecision(int id,ScheduleChangeDecisionInput input,CancellationToken ct)=>Execute(s=>s.DecisionPreview(User,id,input,ct));
    [HttpPost("{id:int}/decision")] public Task<IActionResult> Decide(int id,ScheduleChangeDecisionInput input,CancellationToken ct)=>Execute(s=>s.Decide(User,id,input,ct));
}
