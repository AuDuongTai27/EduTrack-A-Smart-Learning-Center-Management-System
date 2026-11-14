using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using EduTrack.API.Models.DTOs;
using EduTrack.API.Models.DTOs.Teaching;
using EduTrack.API.Services.Interfaces;
using EduTrack.API.Services.Teaching.Interfaces;

namespace EduTrack.API.Controllers.Teaching
{
    /// <summary>
    /// [Bounded Context: Teaching] Quản lý, Giao, Chỉnh sửa, Xóa, Chấm điểm & Truy vấn Bài tập (Assignments)
    /// </summary>
    [ApiController]
    [Route("api/teaching/assignments")]
    [Tags("Teaching - Assignments")]
    public class TeachingAssignmentsController : ControllerBase
    {
        private readonly ITeachingAssignmentService? _assignmentService;
        private readonly IAssignmentService? _queryService;

        public TeachingAssignmentsController(
            ITeachingAssignmentService? assignmentService = null,
            IAssignmentService? queryService = null)
        {
            _assignmentService = assignmentService;
            _queryService = queryService;
        }

        // =====================================================================
        // SHARED ASSIGNMENT QUERIES (/api/assignments)
        // =====================================================================

        /// <summary>
        /// Lấy toàn bộ danh sách Assignment
        /// GET: api/assignments
        /// </summary>
        [HttpGet("/api/assignments")]
        public async Task<ActionResult<IEnumerable<AssignmentDto>>> GetAllAssignments()
        {
            var list = await _queryService!.GetAllAssignmentsAsync();
            return Ok(list);
        }

        /// <summary>
        /// Lấy chi tiết Assignment theo ID
        /// GET: api/assignments/{id}
        /// </summary>
        [HttpGet("/api/assignments/{id:int}")]
        public async Task<ActionResult<AssignmentDto>> GetSharedAssignmentById(int id)
        {
            var item = await _queryService!.GetAssignmentByIdAsync(id);
            if (item == null)
            {
                return NotFound(new { message = "Không tìm thấy dữ liệu có ID = " + id });
            }

            return Ok(item);
        }

        // =====================================================================
        // TEACHING ASSIGNMENT WORKFLOW (/api/teaching/assignments/*)
        // =====================================================================

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
                var created = await _assignmentService!.CreateAssignmentAsync(request);
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

            var list = await _assignmentService!.GetClassAssignmentsAsync(classId);
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

            var item = await _assignmentService!.GetAssignmentByIdAsync(id);
            if (item == null)
            {
                return NotFound(new { success = false, message = $"Không tìm thấy bài tập ID = {id}." });
            }

            return Ok(new { success = true, data = item });
        }

        /// <summary>
        /// Cập nhật thông tin bài tập
        /// PUT /api/teaching/assignments/{id}
        /// </summary>
        [HttpPut("{id:int}")]
        public async Task<IActionResult> UpdateAssignment(int id, [FromBody] UpdateTeachingAssignmentRequestDto request)
        {
            if (id <= 0 || request == null)
            {
                return BadRequest(new { success = false, message = "Dữ liệu cập nhật bài tập không hợp lệ." });
            }

            try
            {
                var updated = await _assignmentService!.UpdateAssignmentAsync(id, request);
                return Ok(new
                {
                    success = true,
                    message = "Cập nhật bài tập thành công!",
                    data = updated
                });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { success = false, message = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Xóa một bài tập theo ID
        /// DELETE /api/teaching/assignments/{id}
        /// </summary>
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> DeleteAssignment(int id)
        {
            if (id <= 0)
            {
                return BadRequest(new { success = false, message = "Mã bài tập không hợp lệ." });
            }

            var deleted = await _assignmentService!.DeleteAssignmentAsync(id);
            if (!deleted)
            {
                return NotFound(new { success = false, message = $"Không tìm thấy bài tập ID = {id} để xóa." });
            }

            return Ok(new
            {
                success = true,
                message = "Đã xóa bài tập thành công!"
            });
        }

        /// <summary>
        /// Lấy danh sách bài nộp của học sinh cho bài tập
        /// GET /api/teaching/assignments/{id}/submissions
        /// </summary>
        [HttpGet("{id:int}/submissions")]
        public async Task<IActionResult> GetSubmissions(int id)
        {
            if (id <= 0)
            {
                return BadRequest(new { success = false, message = "Mã bài tập không hợp lệ." });
            }

            var list = await _assignmentService!.GetAssignmentSubmissionsAsync(id);
            return Ok(new { success = true, data = list });
        }

        /// <summary>
        /// Chấm điểm và nhận xét bài nộp học sinh
        /// PUT /api/teaching/assignments/{id}/submissions/{submissionId}/grade
        /// </summary>
        [HttpPut("{id:int}/submissions/{submissionId:int}/grade")]
        public async Task<IActionResult> GradeSubmission(int id, int submissionId, [FromBody] GradeTeachingSubmissionRequestDto request)
        {
            if (id <= 0 || submissionId <= 0 || request == null)
            {
                return BadRequest(new { success = false, message = "Thông tin chấm điểm không hợp lệ." });
            }

            if (request.Score < 0 || request.Score > 10)
            {
                return BadRequest(new { success = false, message = "Điểm số phải nằm trong khoảng từ 0 đến 10." });
            }

            try
            {
                var graded = await _assignmentService!.GradeSubmissionAsync(id, submissionId, request);
                return Ok(new
                {
                    success = true,
                    message = "Chấm điểm và gửi nhận xét thành công!",
                    data = graded
                });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { success = false, message = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }
    }
}
