using EduTrack.API.Models.DTOs;
using EduTrack.API.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace EduTrack.API.Controllers.Queries;

[ApiController]
[Route("api/grades")]
public class GradesController(IGradeService service) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<GradeDto>>> GetAll() =>
        Ok(await service.GetAllGradesAsync());

    [HttpGet("{id:int:min(1)}")]
    public async Task<ActionResult<GradeDto>> GetById(int id)
    {
        var grade = await service.GetGradeByIdAsync(id);
        return grade == null ? NotFound(new { message = "Không tìm thấy khối lớp." }) : Ok(grade);
    }
}
