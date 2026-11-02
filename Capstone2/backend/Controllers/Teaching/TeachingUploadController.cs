using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace EduTrack.API.Controllers.Teaching
{
    /// <summary>
    /// DTO nhận tệp tin tải lên
    /// </summary>
    public class TeachingFileUploadDto
    {
        public IFormFile? File { get; set; }
    }

    /// <summary>
    /// [Bounded Context: Teaching] Tải lên tệp tin tài liệu, bài tập và học liệu
    /// Phụ trách: Nhóm Teacher & Teaching Assistant (Thành viên 2)
    /// </summary>
    [ApiController]
    [Route("api/teaching/upload")]
    [Tags("Teaching - File Upload")]
    public class TeachingUploadController : ControllerBase
    {
        private readonly IWebHostEnvironment _env;

        private static readonly string[] AllowedExtensions = new[]
        {
            ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx", ".zip", ".rar", ".png", ".jpg", ".jpeg"
        };

        private const long MaxFileSize = 25 * 1024 * 1024; // 25 MB

        public TeachingUploadController(IWebHostEnvironment env)
        {
            _env = env;
        }

        /// <summary>
        /// Tải lên tệp tài liệu bài tập hoặc học liệu
        /// POST /api/teaching/upload
        /// </summary>
        [HttpPost]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UploadFile([FromForm] TeachingFileUploadDto dto)
        {
            var file = dto?.File;
            if (file == null || file.Length == 0)
            {
                return BadRequest(new { success = false, message = "Vui lòng chọn một tệp tin hợp lệ để tải lên." });
            }

            if (file.Length > MaxFileSize)
            {
                return BadRequest(new { success = false, message = "Dung lượng tệp vượt quá giới hạn tối đa cho phép (25 MB)." });
            }

            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (string.IsNullOrEmpty(extension) || !AllowedExtensions.Contains(extension))
            {
                return BadRequest(new
                {
                    success = false,
                    message = $"Định dạng tệp '{extension}' không được hỗ trợ. Vui lòng tải file PDF, Office hoặc hình ảnh."
                });
            }

            try
            {
                var webRoot = _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
                var uploadDir = Path.Combine(webRoot, "uploads", "teaching");

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

                var fileUrl = $"/uploads/teaching/{uniqueFileName}";

                return Ok(new
                {
                    success = true,
                    message = "Tải tệp tin lên máy chủ thành công!",
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
                    message = $"Lỗi khi lưu tệp tin: {ex.Message}"
                });
            }
        }
    }
}

