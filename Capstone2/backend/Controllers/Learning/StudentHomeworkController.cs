using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using EduTrack.API.Helpers.Auth;
using EduTrack.API.Models.DTOs.Learning;
using EduTrack.API.Services.Interfaces;
using EduTrack.API.Services.Learning.Interfaces;

namespace EduTrack.API.Controllers.Learning
{
    public class SubmissionFileUploadDto
    {
        public IFormFile? File { get; set; }
    }

    /// <summary>
    /// [Bounded Context: Learning] Nộp Bài tập Học sinh (Submissions) & Xem Kết quả Chấm bài / AI Evaluation
    /// Phụ trách: Nhóm Student & Parent (Thành viên 3)
    /// </summary>
    [ApiController]
    [Authorize(Roles = JwtAuthHelper.RolesLearning)]
    [Route("api/learning/submissions")]
    [Tags("Learning - Student Homework & Submissions")]
    public class StudentHomeworkController : ControllerBase
    {
        private readonly ILearnerDashboardService _learningService;
        private readonly ISubmissionService _submissionService;
        private readonly IAssignmentService _assignmentService;
        private readonly IWebHostEnvironment _env;

        public StudentHomeworkController(
            ILearnerDashboardService learningService,
            ISubmissionService submissionService,
            IAssignmentService assignmentService,
            IWebHostEnvironment env)
        {
            _learningService = learningService;
            _submissionService = submissionService;
            _assignmentService = assignmentService;
            _env = env;
        }

        /// <summary>
        /// Tải lên tệp bài làm học sinh (PDF, Word, Excel, Hình ảnh, Zip...)
        /// POST /api/learning/submissions/upload
        /// </summary>
        [HttpPost("upload")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UploadSubmissionFile([FromForm] SubmissionFileUploadDto dto)
        {
            var file = dto?.File;
            if (file == null || file.Length == 0)
            {
                return BadRequest(new { success = false, message = "Vui lòng chọn một tệp bài làm hợp lệ để tải lên." });
            }

            const long maxFileSize = 25 * 1024 * 1024; // 25 MB
            if (file.Length > maxFileSize)
            {
                return BadRequest(new { success = false, message = "Dung lượng tệp vượt quá giới hạn cho phép (25 MB)." });
            }

            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            var allowedExtensions = new[] { ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx", ".zip", ".rar", ".png", ".jpg", ".jpeg", ".txt" };
            if (string.IsNullOrEmpty(extension) || !allowedExtensions.Contains(extension))
            {
                return BadRequest(new { success = false, message = $"Định dạng tệp '{extension}' không được hỗ trợ. Vui lòng tải file PDF, Office hoặc hình ảnh." });
            }

            try
            {
                var webRoot = _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
                var uploadDir = Path.Combine(webRoot, "uploads", "submissions");
                if (!Directory.Exists(uploadDir))
                {
                    Directory.CreateDirectory(uploadDir);
                }

                var rawFileName = Path.GetFileNameWithoutExtension(file.FileName);
                var safeFileName = string.Concat(rawFileName.Split(Path.GetInvalidFileNameChars())).Replace(" ", "_");
                if (safeFileName.Length > 40)
                {
                    safeFileName = safeFileName.Substring(0, 40);
                }

                var uniqueFileName = $"{safeFileName}_{Guid.NewGuid().ToString("N").Substring(0, 8)}{extension}";
                var filePath = Path.Combine(uploadDir, uniqueFileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                var fileUrl = $"/uploads/submissions/{uniqueFileName}";
                return Ok(new
                {
                    success = true,
                    message = "Tải tệp bài nộp lên máy chủ thành công!",
                    fileUrl,
                    fileName = file.FileName,
                    fileSize = file.Length,
                    uploadedAt = DateTime.UtcNow.ToString("o")
                });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    success = false,
                    message = $"Lỗi khi lưu tệp bài nộp: {ex.Message}"
                });
            }
        }

        /// <summary>
        /// Lấy chi tiết đề bài tập kèm bài đã nộp và điểm/nhận xét của Giáo viên & AI cho một học sinh
        /// </summary>
        [HttpGet("student/{studentId:int}/assignment/{assignmentId:int}")]
        public async Task<IActionResult> GetStudentAssignmentDetail(int studentId, int assignmentId)
        {
            var effectiveStudentId = JwtAuthHelper.ResolveEffectiveUserId(User, studentId, JwtAuthHelper.RoleStudent);
            var data = await _learningService.GetStudentAssignmentDetailAsync(effectiveStudentId, assignmentId);
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

            request.StudentId = JwtAuthHelper.ResolveEffectiveUserId(User, request.StudentId, JwtAuthHelper.RoleStudent);

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
            var effectiveStudentId = JwtAuthHelper.ResolveEffectiveUserId(User, studentId, JwtAuthHelper.RoleStudent);
            var deleted = await _learningService.DeleteSubmissionAsync(assignmentId, effectiveStudentId);
            if (!deleted)
            {
                return NotFound(new { success = false, message = "Không tìm thấy bài nộp để xóa." });
            }

            return Ok(new { success = true, message = "Đã xóa bài nộp thành công." });
        }
    }
}
