using EduTrack.API.Models.DTOs.Management;
using EduTrack.API.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MySqlConnector;

namespace EduTrack.API.Controllers.Management;

[ApiController]
[Route("api/users/{studentId:int:min(1)}/enrollments")]
public class ManagementStudentEnrollmentsController(IStudentClassService service) : ControllerBase
{
    [HttpPost]
    public Task<IActionResult> Add(int studentId, AddStudentEnrollmentsDto dto) =>
        Run(async () => Ok(await service.EnrollAsync(studentId, dto.GradeId, dto.ClassIds)));

    [HttpPatch("{enrollmentId:int:min(1)}/drop")]
    public Task<IActionResult> Drop(int studentId, int enrollmentId, DropStudentEnrollmentDto dto) =>
        Run(async () => Ok(await service.DropAsync(studentId, enrollmentId, dto.Reason)));

    private async Task<IActionResult> Run(Func<Task<IActionResult>> action)
    {
        try { return await action(); }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
        catch (ArgumentException ex) { return BadRequest(new { message = ex.Message }); }
        catch (InvalidOperationException ex) { return Conflict(new { message = ex.Message }); }
        catch (Exception ex) when (ex is MySqlException { Number: 1213 or 1205 }
            || ex is DbUpdateException { InnerException: MySqlException { Number: 1062 or 1213 or 1205 } })
        {
            return Conflict(new { message = "Đăng ký lớp vừa được cập nhật ở phiên khác. Tải lại danh sách, kiểm tra và thử lại; lịch sử cũ được giữ nguyên." });
        }
        catch (Exception)
        {
            return StatusCode(503, new { message = "Chưa xác nhận được kết quả cập nhật lớp. Tải lại danh sách để kiểm tra trước khi thử lại; không cần tạo lại học sinh." });
        }
    }
}
