using EduTrack.API.Models.DTOs.Management;
using EduTrack.API.Services.Management.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MySqlConnector;

namespace EduTrack.API.Controllers.Management;

// Uses the existing Management controller/authorization conventions, like Subjects.
// CM-only navigation is not a substitute for a future server-side role policy.
[ApiController]
[Route("api/grades")]
[Tags("Management - Grades")]
public class ManagementGradesController(IManagementGradeService service) : ControllerBase
{
    [HttpPost]
    public Task<IActionResult> Create(SaveGradeDto dto) => Run(async () =>
    {
        var item = await service.CreateAsync(dto);
        return Created($"/api/grades/{item.GradeId}", item);
    });

    [HttpPut("{id:int:min(1)}")]
    public Task<IActionResult> Rename(int id, SaveGradeDto dto) => Run(async () =>
    {
        var item = await service.RenameAsync(id, dto);
        return item == null ? NotFound(new { message = "Không tìm thấy khối lớp." }) : Ok(item);
    });

    [HttpDelete("{id:int:min(1)}")]
    public Task<IActionResult> Delete(int id) => Run(async () =>
        await service.DeleteAsync(id) ? Ok(new { message = "Đã xóa khối lớp." })
            : NotFound(new { message = "Không tìm thấy khối lớp." }));

    private async Task<IActionResult> Run(Func<Task<IActionResult>> action)
    {
        try { return await action(); }
        catch (ArgumentException ex) { return BadRequest(new { message = ex.Message }); }
        catch (InvalidOperationException ex) { return Conflict(new { message = ex.Message }); }
        catch (DbUpdateException ex) when (ex.InnerException is MySqlException { Number: 1451 })
        { return Conflict(new { message = "Khối lớp đã có dữ liệu liên kết; không thể xóa." }); }
        catch (DbUpdateException ex) when (ex.InnerException is MySqlException { Number: 1062 or 1213 or 1205 })
        { return Conflict(new { message = "Danh mục vừa thay đổi đồng thời. Vui lòng tải lại và thử lại." }); }
        catch (MySqlException ex) when (ex.Number is 1213 or 1205)
        { return Conflict(new { message = "Danh mục đang được cập nhật. Vui lòng tải lại và thử lại." }); }
    }
}
