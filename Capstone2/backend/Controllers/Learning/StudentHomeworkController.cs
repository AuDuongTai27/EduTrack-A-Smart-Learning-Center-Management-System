using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using EduTrack.API.Models.DTOs.Learning;
using EduTrack.API.Services.Interfaces;
using EduTrack.API.Services.Learning.Interfaces;

namespace EduTrack.API.Controllers.Learning
{
    /// <summary>
    /// [Bounded Context: Learning] Nộp Bài tập Học sinh (Submissions) & Xem Kết quả Chấm bài / AI Evaluation
    /// Phụ trách: Nhóm Student & Parent (Thành viên 3)
    /// </summary>
    [ApiController]
    [Route("api/learning/submissions")]
    [Tags("Learning - Student Homework & Submissions")]
    public class StudentHomeworkController : ControllerBase
    {
        private readonly ILearnerDashboardService _learningService;
        private readonly ISubmissionService _submissionService;
        private readonly IAssignmentService _assignmentService;

        public StudentHomeworkController(
            ILearnerDashboardService learningService,
            ISubmissionService submissionService,
            IAssignmentService assignmentService)
        {
            _learningService = learningService;
            _submissionService = submissionService;
            _assignmentService = assignmentService;
        }

        /// <summary>
        /// Lấy chi tiết đề bài tập kèm bài đã nộp và điểm/nhận xét của Giáo viên & AI cho một học sinh
        /// </summary>
        [HttpGet("student/{studentId:int}/assignment/{assignmentId:int}")]
        public async Task<IActionResult> GetStudentAssignmentDetail(int studentId, int assignmentId)
        {
            var data = await _learningService.GetStudentAssignmentDetailAsync(studentId, assignmentId);
            if (data == null)
            {
                return NotFound(new { success = false, message = $"Không tìm thấy bài tập có ID = {assignmentId}" });
            }

            return Ok(new { success = true, data });
        }

        /// <summary>
        /// Học sinh nộp bài tập mới hoặc nộp lại (Cập nhật bài nộp & kích hoạt AI chấm sơ bộ nếu bật)
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> SubmitHomework([FromBody] SubmitHomeworkRequestDto request)
        {
            if (request == null || request.AssignmentId <= 0)
            {
                return BadRequest(new { success = false, message = "Thông tin bài tập không hợp lệ." });
            }

            try
            {
                var submission = await _learningService.SubmitHomeworkAsync(request);
                return Ok(new
                {
                    success = true,
                    message = "Nộp bài tập thành công!",
                    data = submission
                });
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Học sinh xóa / rút lại bài nộp để nộp file mới
        /// </summary>
        [HttpDelete("student/{studentId:int}/assignment/{assignmentId:int}")]
        public async Task<IActionResult> DeleteSubmission(int studentId, int assignmentId)
        {
            var deleted = await _learningService.DeleteSubmissionAsync(assignmentId, studentId);
            if (!deleted)
            {
                return NotFound(new { success = false, message = "Không tìm thấy bài nộp để xóa." });
            }

            return Ok(new { success = true, message = "Đã xóa bài nộp thành công." });
        }
    }
}
