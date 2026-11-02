using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using EduTrack.API.Models.DTOs.Teaching;
using EduTrack.API.Services.Teaching.Interfaces;

namespace EduTrack.API.Controllers.Teaching
{
    /// <summary>
    /// [Bounded Context: Teaching] Quản lý & Giao Bài tập (Assignments)
    /// Phụ trách: Nhóm Teacher & Teaching Assistant (Thành viên 2)
    /// </summary>
    [ApiController]
    [Route("api/teaching/assignments")]
    [Tags("Teaching - Assignments")]
    public class TeachingAssignmentsController : ControllerBase
    {
        private readonly ITeachingAssignmentService _assignmentService;

        public TeachingAssignmentsController(ITeachingAssignmentService assignmentService)
        {
            _assignmentService = assignmentService;
        }

        /// <summary>
        /// Tạo bài tập mới cho lớp học
        /// POST /api/teaching/assignments
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> CreateAssignment([FromBody] CreateTeachingAssignmentRequestDto request)
        {
            if (request == null || request.ClassId <= 0 || string.IsNullOrWhiteSpace(request.Title))
            {
                return BadRequest(new { success = false, message = "Thông tin lớp học hoặc tiêu đề bài tập không hợp lệ." });
            }

            try
            {
                var created = await _assignmentService.CreateAssignmentAsync(request);
                return StatusCode(StatusCodes.Status201Created, new
                {
                    success = true,
                    message = "Giao bài tập mới thành công!",
                    data = created
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Lấy danh sách bài tập của một lớp học
        /// GET /api/teaching/assignments?classId={classId}
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetAssignments([FromQuery] int classId)
        {
            if (classId <= 0)
            {
                return BadRequest(new { success = false, message = "Mã lớp học (classId) không hợp lệ." });
            }

            var list = await _assignmentService.GetClassAssignmentsAsync(classId);
            return Ok(new { success = true, data = list });
        }

        /// <summary>
        /// Lấy chi tiết một bài tập theo ID
        /// GET /api/teaching/assignments/{id}
        /// </summary>
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetAssignmentById(int id)
        {
            if (id <= 0)
            {
                return BadRequest(new { success = false, message = "Mã bài tập không hợp lệ." });
            }

            var item = await _assignmentService.GetAssignmentByIdAsync(id);
            if (item == null)
            {
                return NotFound(new { success = false, message = $"Không tìm thấy bài tập ID = {id}." });
            }

            return Ok(new { success = true, data = item });
        }
    }
}
