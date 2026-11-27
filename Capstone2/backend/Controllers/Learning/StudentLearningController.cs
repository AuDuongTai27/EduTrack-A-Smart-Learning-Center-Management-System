using System;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EduTrack.API.Helpers.Auth;
using EduTrack.API.Models.EF;
using EduTrack.API.Services.Interfaces;
using EduTrack.API.Services.Learning.Interfaces;

namespace EduTrack.API.Controllers.Learning
{
    /// <summary>
    /// [Bounded Context: Learning] Cổng thông tin Học tập Học sinh (Lớp đang học, Thời khóa biểu, Tiến độ & Hồ sơ)
    /// Phụ trách: Nhóm Student & Parent (Thành viên 3)
    /// </summary>
    [ApiController]
    [Authorize(Roles = JwtAuthHelper.RolesLearning)]
    [Route("api/learning/student")]
    [Tags("Learning - Student Portal")]
    public class StudentLearningController : ControllerBase
    {
        private readonly ILearnerDashboardService _dashboardService;
        private readonly IClassService _classService;
        private readonly IClassScheduleService _scheduleService;
        private readonly IAttendanceService _attendanceService;
        private readonly IProgressNoteService _progressNoteService;
        private readonly IUserService _userService;
        private readonly EduTrackDbContext _context;
        private readonly IWebHostEnvironment _env;

        public StudentLearningController(
            ILearnerDashboardService dashboardService,
            IClassService classService,
            IClassScheduleService scheduleService,
            IAttendanceService attendanceService,
            IProgressNoteService progressNoteService,
            IUserService userService,
            EduTrackDbContext context,
            IWebHostEnvironment env)
        {
            _dashboardService = dashboardService;
            _classService = classService;
            _scheduleService = scheduleService;
            _attendanceService = attendanceService;
            _progressNoteService = progressNoteService;
            _userService = userService;
            _context = context;
            _env = env;
        }

        /// <summary>
        /// Lấy tổng quan Bảng điều khiển Học sinh (Thông tin học sinh, số lớp đang học, số bài tập chưa nộp & danh sách lớp kèm lịch/giáo viên)
        /// </summary>
        [HttpGet("{studentId:int}/dashboard")]
        public async Task<IActionResult> GetStudentDashboard(int studentId)
        {
            var effectiveStudentId = JwtAuthHelper.ResolveEffectiveUserId(User, studentId, JwtAuthHelper.RoleStudent);
            var data = await _dashboardService.GetStudentDashboardAsync(effectiveStudentId);
            if (data == null)
            {
                return NotFound(new { success = false, message = $"Không tìm thấy học sinh có ID = {effectiveStudentId}" });
            }

            return Ok(new { success = true, data });
        }

        /// <summary>
        /// Lấy chi tiết Lớp học cho Học sinh & Phụ huynh (Thông tin giáo viên, lịch học, tài liệu ContentUnits, bài tập kèm trạng thái nộp & nhật ký điểm danh)
        /// </summary>
        [HttpGet("{studentId:int}/classes/{classId:int}")]
        public async Task<IActionResult> GetStudentClassDetail(int studentId, int classId)
        {
            var effectiveStudentId = JwtAuthHelper.ResolveEffectiveUserId(User, studentId, JwtAuthHelper.RoleStudent);
            var data = await _dashboardService.GetStudentClassDetailAsync(effectiveStudentId, classId);
            if (data == null)
            {
                return NotFound(new { success = false, message = $"Không tìm thấy lớp học có ID = {classId}" });
            }

            return Ok(new { success = true, data });
        }

        /// <summary>
        /// Tải về một tệp tài liệu cụ thể của lớp học
        /// GET /api/learning/student/classes/{classId:int}/materials/{materialId:int}/download
        /// </summary>
        [HttpGet("classes/{classId:int}/materials/{materialId:int}/download")]
        [AllowAnonymous] // Cho phép tải trực tiếp qua liên kết trình duyệt
        public async Task<IActionResult> DownloadClassMaterial(int classId, int materialId)
        {
            var unit = await _context.ContentUnits
                .Include(u => u.Class)
                .FirstOrDefaultAsync(u => u.ClassId == classId && u.ContentUnitId == materialId);

            if (unit == null)
            {
                return NotFound(new { success = false, message = "Không tìm thấy tài liệu môn học." });
            }

            var webRoot = _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
            var cleanTitle = string.Concat(unit.Title.Split(Path.GetInvalidFileNameChars())).Replace(" ", "_");
            var ext = unit.UnitType == "lesson" ? ".docx" : ".pdf";
            var fileName = cleanTitle.EndsWith(ext, StringComparison.OrdinalIgnoreCase) ? cleanTitle : $"{cleanTitle}{ext}";

            // Kiểm tra tệp vật lý trong wwwroot/uploads/materials hoặc wwwroot/uploads/teaching
            var physicalPath = Path.Combine(webRoot, "uploads", "materials", fileName);
            if (System.IO.File.Exists(physicalPath))
            {
                var bytes = await System.IO.File.ReadAllBytesAsync(physicalPath);
                return File(bytes, "application/octet-stream", fileName);
            }

            return NotFound(new { success = false, message = "This material file is currently unavailable." });
        }

        /// <summary>
        /// Tải toàn bộ tài liệu của lớp học nén thành tệp .ZIP (Bulk ZIP Download)
        /// GET /api/learning/student/classes/{classId:int}/materials/download-all
        /// </summary>
        [HttpGet("classes/{classId:int}/materials/download-all")]
        [AllowAnonymous] // Cho phép tải trực tiếp qua liên kết trình duyệt
        public async Task<IActionResult> DownloadAllClassMaterials(int classId)
        {
            var cls = await _context.Classes
                .Include(c => c.ContentUnits)
                .FirstOrDefaultAsync(c => c.ClassId == classId);

            if (cls == null)
            {
                return NotFound(new { success = false, message = "Không tìm thấy lớp học." });
            }

            var units = cls.ContentUnits.OrderBy(u => u.OrderIndex).ToList();
            if (units.Count == 0)
            {
                return BadRequest(new { success = false, message = "Lớp học chưa có tài liệu nào để tải về." });
            }

            var webRoot = _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");

            using (var memoryStream = new MemoryStream())
            {
                using (var archive = new ZipArchive(memoryStream, ZipArchiveMode.Create, true, Encoding.UTF8))
                {
                    // Tệp chỉ mục thông tin lớp học đính kèm bên trong zip
                    var readmeEntry = archive.CreateEntry("00_README_Danh_Muc_Tai_Lieu.txt");
                    using (var writer = new StreamWriter(readmeEntry.Open(), Encoding.UTF8))
                    {
                        writer.WriteLine("=========================================================");
                        writer.WriteLine($"DANH MỤC TÀI LIỆU LỚP HỌC: {cls.ClassName}");
                        writer.WriteLine($"Mã lớp: #{cls.ClassId}");
                        writer.WriteLine($"Thời gian xuất zip: {DateTime.Now:dd/MM/yyyy HH:mm:ss}");
                        writer.WriteLine($"Tổng số học liệu: {units.Count}");
                        writer.WriteLine("=========================================================");
                        writer.WriteLine();
                        foreach (var u in units)
                        {
                            writer.WriteLine($"[{u.OrderIndex:D2}] {u.Title} (Loại: {u.UnitType})");
                            if (!string.IsNullOrWhiteSpace(u.Description))
                            {
                                writer.WriteLine($"     Mô tả: {u.Description}");
                            }
                        }
                    }

                    // Đưa từng tài liệu của lớp vào kho nén
                    for (int i = 0; i < units.Count; i++)
                    {
                        var u = units[i];
                        var cleanTitle = string.Concat(u.Title.Split(Path.GetInvalidFileNameChars())).Replace(" ", "_");
                        var ext = u.UnitType == "lesson" ? ".docx" : ".pdf";
                        var fileName = cleanTitle.EndsWith(ext, StringComparison.OrdinalIgnoreCase) ? cleanTitle : $"{cleanTitle}{ext}";
                        var entryName = $"{i + 1:D2}_{fileName}";

                        var physicalPath = Path.Combine(webRoot, "uploads", "materials", fileName);
                        if (System.IO.File.Exists(physicalPath))
                        {
                            archive.CreateEntryFromFile(physicalPath, entryName);
                        }
                        else
                        {
                            return NotFound(new { success = false, message = "One or more material files are currently unavailable." });
                        }
                    }
                }

                memoryStream.Seek(0, SeekOrigin.Begin);
                var safeClassName = string.Concat(cls.ClassName.Split(Path.GetInvalidFileNameChars())).Replace(" ", "_");
                var zipName = $"{safeClassName}_Materials.zip";
                return File(memoryStream.ToArray(), "application/zip", zipName);
            }
        }

        /// <summary>
        /// Lấy thời khóa biểu tuần của Học sinh (Chỉ các lớp học sinh đang theo học, kèm tên Giáo viên & Phòng học thực tế)
        /// </summary>
        [HttpGet("{studentId:int}/schedule")]
        public async Task<IActionResult> GetStudentSchedule(int studentId)
        {
            var effectiveStudentId = JwtAuthHelper.ResolveEffectiveUserId(User, studentId, JwtAuthHelper.RoleStudent);
            var data = await _dashboardService.GetStudentScheduleAsync(effectiveStudentId);
            return Ok(new { success = true, data });
        }

        /// <summary>
        /// Lấy báo cáo Tiến độ học tập & Điểm danh tổng hợp của Học sinh (Số buổi có mặt/vắng/đi trễ, tỷ lệ chuyên cần & nhận xét từng lớp)
        /// </summary>
        [HttpGet("{studentId:int}/progress")]
        public async Task<IActionResult> GetStudentProgress(int studentId)
        {
            var effectiveStudentId = JwtAuthHelper.ResolveEffectiveUserId(User, studentId, JwtAuthHelper.RoleStudent);
            var data = await _dashboardService.GetStudentProgressAsync(effectiveStudentId);
            if (data == null)
            {
                return NotFound(new { success = false, message = $"Không tìm thấy học sinh có ID = {effectiveStudentId}" });
            }

            return Ok(new { success = true, data });
        }

        /// <summary>
        /// Lấy danh sách Thông báo của Học sinh (Thông báo cá nhân, thông báo các lớp đang học & thông báo chung toàn hệ thống)
        /// </summary>
        [HttpGet("{studentId:int}/notifications")]
        public async Task<IActionResult> GetStudentNotifications(int studentId)
        {
            var effectiveStudentId = JwtAuthHelper.ResolveEffectiveUserId(User, studentId, JwtAuthHelper.RoleStudent);
            var data = await _dashboardService.GetStudentNotificationsAsync(effectiveStudentId);
            return Ok(new { success = true, data });
        }

        /// <summary>
        /// Đánh dấu một thông báo là đã đọc (Lưu trạng thái is_read = true vào CSDL theo từng người nhận)
        /// </summary>
        [HttpPut("notifications/{notificationId:int}/read")]
        public async Task<IActionResult> MarkNotificationAsRead(int notificationId, [FromQuery] int? userId = null)
        {
            var effectiveUserId = userId.HasValue
                ? JwtAuthHelper.ResolveEffectiveUserId(User, userId.Value, JwtAuthHelper.RoleStudent, JwtAuthHelper.RoleParent)
                : JwtAuthHelper.GetAuthenticatedUserId(User);
            var ok = await _dashboardService.MarkNotificationAsReadAsync(notificationId, effectiveUserId);
            if (!ok)
            {
                return NotFound(new { success = false, message = $"Không tìm thấy thông báo #{notificationId}" });
            }

            return Ok(new { success = true, message = "Đã đánh dấu thông báo là đã đọc." });
        }

        /// <summary>
        /// Đánh dấu tất cả thông báo của Học sinh / Phụ huynh là đã đọc
        /// </summary>
        [HttpPut("{userId:int}/notifications/read-all")]
        public async Task<IActionResult> MarkAllNotificationsAsRead(int userId, [FromQuery] int? studentId = null)
        {
            var effectiveUserId = JwtAuthHelper.ResolveEffectiveUserId(User, userId, JwtAuthHelper.RoleStudent, JwtAuthHelper.RoleParent);
            try
            {
                var updatedCount = await _dashboardService.MarkAllNotificationsAsReadAsync(effectiveUserId, studentId);
                return Ok(new { success = true, updatedCount });
            }
            catch (UnauthorizedAccessException) { return Forbid(); }
        }

        /// <summary>
        /// Lấy thông tin Hồ sơ cá nhân của Học sinh
        /// </summary>
        [HttpGet("{studentId:int}/profile")]
        public async Task<IActionResult> GetStudentProfile(int studentId)
        {
            var effectiveStudentId = JwtAuthHelper.ResolveEffectiveUserId(User, studentId, JwtAuthHelper.RoleStudent);
            var data = await _dashboardService.GetLearnerProfileAsync(effectiveStudentId);
            if (data == null)
            {
                return NotFound(new { success = false, message = $"Không tìm thấy hồ sơ học sinh ID = {effectiveStudentId}" });
            }

            return Ok(new { success = true, data });
        }

        /// <summary>
        /// Học sinh tự cập nhật thông tin Hồ sơ cá nhân (Lưu xuống bảng users trong CSDL)
        /// </summary>
        [HttpPut("{studentId:int}/profile")]
        public async Task<IActionResult> UpdateStudentProfile(int studentId, [FromBody] EduTrack.API.Models.DTOs.Learning.UpdateLearnerProfileRequestDto request)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.FullName))
            {
                return BadRequest(new { success = false, message = "Họ và tên không được để trống." });
            }

            var effectiveStudentId = JwtAuthHelper.ResolveEffectiveUserId(User, studentId, JwtAuthHelper.RoleStudent);
            var updated = await _dashboardService.UpdateLearnerProfileAsync(effectiveStudentId, request);
            if (updated == null)
            {
                return NotFound(new { success = false, message = $"Không tìm thấy hồ sơ học sinh ID = {effectiveStudentId}" });
            }

            return Ok(new
            {
                success = true,
                message = "Đã cập nhật hồ sơ cá nhân học sinh thành công!",
                data = updated
            });
        }
    }
}
