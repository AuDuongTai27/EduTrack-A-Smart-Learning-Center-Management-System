using System.Threading.Tasks;

namespace EduTrack.API.Services.Reports
{
    public interface IReportExportService
    {
        /// <summary>
        /// Xuất báo cáo học phí & công nợ ra file Excel (.xlsx) bằng ClosedXML
        /// </summary>
        Task<byte[]> ExportTuitionReportToExcelAsync(
            int? classId = null,
            string? status = null,
            string? searchTerm = null,
            string? roleTitle = "Admin Staff");
    }
}
