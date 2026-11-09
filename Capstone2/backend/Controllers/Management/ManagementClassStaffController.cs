using EduTrack.API.Models.DTOs.Management;
using EduTrack.API.Services.Management.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MySqlConnector;

namespace EduTrack.API.Controllers.Management
{
    [ApiController]
    [Route("api/classes/{classId:int}")]
    [Tags("Management - Class Staff")]
    public class ManagementClassStaffController : ControllerBase
    {
        private readonly IManagementClassStaffService _service;
        public ManagementClassStaffController(IManagementClassStaffService service) => _service = service;

        [HttpPost("teachers")]
        public Task<IActionResult> AssignTeacher(int classId, [FromBody] AssignClassStaffDto dto) =>
            Execute(async () => Ok(await _service.AssignTeacherAsync(classId, dto.UserId)));

        [HttpPost("assistants")]
        public Task<IActionResult> AssignAssistant(int classId, [FromBody] AssignClassStaffDto dto) =>
            Execute(async () => Ok(await _service.AssignAssistantAsync(classId, dto.UserId)));

        [HttpPatch("teachers/{assignmentId:int}/deactivate")]
        public Task<IActionResult> DeactivateTeacher(int classId, int assignmentId) =>
            Execute(async () => Ok(await _service.DeactivateTeacherAsync(classId, assignmentId)));

        [HttpPatch("assistants/{assignmentId:int}/deactivate")]
        public Task<IActionResult> DeactivateAssistant(int classId, int assignmentId) =>
            Execute(async () => Ok(await _service.DeactivateAssistantAsync(classId, assignmentId)));

        private async Task<IActionResult> Execute(Func<Task<IActionResult>> command)
        {
            try { return await command(); }
            catch (KeyNotFoundException ex) { return NotFound(new {message = ex.Message}); }
            catch (ArgumentException ex) { return BadRequest(new {message = ex.Message}); }
            catch (InvalidOperationException ex) { return Conflict(new {message = ex.Message}); }
            // The existing unique (staff_id, class_id) index also protects concurrent requests.
            catch (DbUpdateException ex) when (ex.InnerException is MySqlException {Number: 1062})
            { return Conflict(new {message = "Tài khoản này đã được phân công vào lớp. Vui lòng tải lại."}); }
        }
    }
}
