using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MySqlConnector;
using EduTrack.API.Models.DTOs;
using EduTrack.API.Models.DTOs.Management;
using EduTrack.API.Services.Interfaces;
using EduTrack.API.Services.Management.Interfaces;

namespace EduTrack.API.Controllers.Queries
{
    /// <summary>
    /// API đọc và quản lý Lớp học, Phân công Giáo viên/Trợ giảng & Danh sách Học sinh/GV/TA theo lớp
    /// </summary>
    [ApiController]
    [Route("api/classes")]
    [Tags("Classes, Enrollments & Class Staff")]
    public class ClassesController : ControllerBase
    {
        private readonly IClassService? _queryService;
        private readonly IManagementClassService? _managementService;
        private readonly IManagementClassStaffService? _staffService;
        private readonly IStudentClassService? _studentClassService;
        private readonly ITeacherClassService? _teacherClassService;
        private readonly ITaClassService? _taClassService;

        public ClassesController(
            IClassService? queryService = null,
            IManagementClassService? managementService = null,
            IManagementClassStaffService? staffService = null,
            IStudentClassService? studentClassService = null,
            ITeacherClassService? teacherClassService = null,
            ITaClassService? taClassService = null)
        {
            _queryService = queryService;
            _managementService = managementService;
            _staffService = staffService;
            _studentClassService = studentClassService;
            _teacherClassService = teacherClassService;
            _taClassService = taClassService;
        }

        /// <summary>
        /// Lấy toàn bộ danh sách Class
        /// GET: api/classes
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ClassDto>>> GetAll()
        {
            var list = await _queryService!.GetAllClassesAsync();
            return Ok(list);
        }

        /// <summary>
        /// Lấy chi tiết Class theo ID
        /// GET: api/classes/{id}
        /// </summary>
        [HttpGet("{id:int}")]
        public async Task<ActionResult<ClassDto>> GetById(int id)
        {
            var item = await _queryService!.GetClassByIdAsync(id);
            if (item == null)
            {
                return NotFound(new { message = "Không tìm thấy dữ liệu có ID = " + id });
            }

            return Ok(item);
        }

        /// <summary>
        /// Tạo mới một lớp học (Class)
        /// POST: api/classes
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<ClassDto>> Create([FromBody] CreateClassDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var created = await _managementService!.CreateClassAsync(dto);
                return Created($"/api/classes/{created.ClassId}", created);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Cập nhật thông tin lớp học (Class)
        /// PUT: api/classes/{id}
        /// </summary>
        [HttpPut("{id:int}")]
        public async Task<ActionResult<ClassDto>> Update(int id, [FromBody] UpdateClassDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var updated = await _managementService!.UpdateClassAsync(id, dto);
                if (updated == null)
                {
                    return NotFound(new { message = "Không tìm thấy lớp học có ID = " + id });
                }

                return Ok(updated);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Xóa lớp học theo ID
        /// DELETE: api/classes/{id}
        /// </summary>
        [HttpDelete("{id:int}")]
        public async Task<ActionResult> Delete(int id)
        {
            var (success, message) = await _managementService!.DeleteClassAsync(id);
            if (!success)
            {
                return BadRequest(new { message });
            }

            return Ok(new { message });
        }

        // =====================================================================
        // SUB-RESOURCE: PHÂN CÔNG GIÁO VIÊN & TRỢ GIẢNG (CLASS STAFF COMMANDS)
        // Giữ nguyên route /api/classes/{classId}/teachers & /assistants
        // =====================================================================

        [HttpPost("{classId:int}/teachers")]
        public Task<IActionResult> AssignTeacher(int classId, [FromBody] AssignClassStaffDto dto) =>
            ExecuteStaffCommand(async () => Ok(await _staffService!.AssignTeacherAsync(classId, dto.UserId)));

        [HttpPost("{classId:int}/assistants")]
        public Task<IActionResult> AssignAssistant(int classId, [FromBody] AssignClassStaffDto dto) =>
            ExecuteStaffCommand(async () => Ok(await _staffService!.AssignAssistantAsync(classId, dto.UserId)));

        [HttpPatch("{classId:int}/teachers/{assignmentId:int}/deactivate")]
        public Task<IActionResult> DeactivateTeacher(int classId, int assignmentId) =>
            ExecuteStaffCommand(async () => Ok(await _staffService!.DeactivateTeacherAsync(classId, assignmentId)));

        [HttpPatch("{classId:int}/assistants/{assignmentId:int}/deactivate")]
        public Task<IActionResult> DeactivateAssistant(int classId, int assignmentId) =>
            ExecuteStaffCommand(async () => Ok(await _staffService!.DeactivateAssistantAsync(classId, assignmentId)));

        private async Task<IActionResult> ExecuteStaffCommand(Func<Task<IActionResult>> command)
        {
            try { return await command(); }
            catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
            catch (ArgumentException ex) { return BadRequest(new { message = ex.Message }); }
            catch (InvalidOperationException ex) { return Conflict(new { message = ex.Message }); }
            catch (DbUpdateException ex) when (ex.InnerException is MySqlException { Number: 1062 })
            { return Conflict(new { message = "Tài khoản này đã được phân công vào lớp. Vui lòng tải lại." }); }
        }

        // =====================================================================
        // SUB-RESOURCE QUERIES: STUDENT-CLASSES, TEACHER-CLASSES, TA-CLASSES
        // Giữ nguyên 100% route /api/studentclasses, /api/teacherclasses, /api/taclasses
        // =====================================================================

        [HttpGet("/api/studentclasses")]
        public async Task<ActionResult<IEnumerable<StudentClassDto>>> GetAllStudentClasses(
            [FromQuery, Range(1, int.MaxValue)] int? studentId = null)
        {
            var list = await _studentClassService!.GetAllStudentClassesAsync(studentId);
            return Ok(list);
        }

        [HttpGet("/api/studentclasses/{id:int}")]
        public async Task<ActionResult<StudentClassDto>> GetStudentClassById(int id)
        {
            var item = await _studentClassService!.GetStudentClassByIdAsync(id);
            if (item == null)
            {
                return NotFound(new { message = "Không tìm thấy dữ liệu có ID = " + id });
            }

            return Ok(item);
        }

        [HttpGet("/api/teacherclasses")]
        public async Task<ActionResult<IEnumerable<TeacherClassDto>>> GetAllTeacherClasses()
        {
            var list = await _teacherClassService!.GetAllTeacherClassesAsync();
            return Ok(list);
        }

        [HttpGet("/api/teacherclasses/{id:int}")]
        public async Task<ActionResult<TeacherClassDto>> GetTeacherClassById(int id)
        {
            var item = await _teacherClassService!.GetTeacherClassByIdAsync(id);
            if (item == null)
            {
                return NotFound(new { message = "Không tìm thấy dữ liệu có ID = " + id });
            }

            return Ok(item);
        }

        [HttpGet("/api/taclasses")]
        public async Task<ActionResult<IEnumerable<TaClassDto>>> GetAllTaClasses()
        {
            var list = await _taClassService!.GetAllTaClassesAsync();
            return Ok(list);
        }

        [HttpGet("/api/taclasses/{id:int}")]
        public async Task<ActionResult<TaClassDto>> GetTaClassById(int id)
        {
            var item = await _taClassService!.GetTaClassByIdAsync(id);
            if (item == null)
            {
                return NotFound(new { message = "Không tìm thấy dữ liệu có ID = " + id });
            }

            return Ok(item);
        }
    }
}
