using System;
using System.Threading.Tasks;
using EduTrack.API.Services.Reports;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduTrack.API.Controllers.Management
{
    [ApiController]
    [Route("api/reports")]
    public class ReportsController : ControllerBase
    {
        private readonly IReportExportService _reportExportService;

        public ReportsController(IReportExportService reportExportService)
        {
            _reportExportService = reportExportService;
        }

        /// <summary>
        /// Xuất báo cáo học phí & công nợ ra định dạng file Excel (.xlsx) bằng ClosedXML
        /// GET: /api/reports/tuition/export
        /// </summary>
        [HttpGet("tuition/export")]
        [AllowAnonymous] // Cho phép trình duyệt tải trực tiếp tệp tin
        public async Task<IActionResult> ExportTuitionReport(
            [FromQuery] int? classId = null,
            [FromQuery] string? status = null,
            [FromQuery] string? searchTerm = null,
            [FromQuery] string? role = "Admin Staff")
        {
            try
            {
                var roleTitle = !string.IsNullOrWhiteSpace(role) && role.Equals("Center Manager", StringComparison.OrdinalIgnoreCase)
                    ? "Center Manager"
                    : "Admin Staff";

                var fileBytes = await _reportExportService.ExportTuitionReportToExcelAsync(
                    classId, status, searchTerm, roleTitle);

                var fileName = $"Bao_Cao_Hoc_Phi_EduTrack_{DateTime.Now:yyyyMMdd_HHmmss}.xlsx";
                const string contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

                return File(fileBytes, contentType, fileName);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Lỗi khi xuất file báo cáo Excel: " + ex.Message });
            }
        }
    }
}
