using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using EduTrack.API.Models.DTOs.Learning;
using EduTrack.API.Services.Interfaces;
using EduTrack.API.Services.Learning.Interfaces;

namespace EduTrack.API.Controllers.Learning
{
    /// <summary>
    /// [Bounded Context: Learning] Cổng thông tin Phụ huynh (Theo dõi Con, Tra cứu & Thanh toán Học phí)
    /// Phụ trách: Nhóm Student & Parent (Thành viên 3)
    /// </summary>
    [ApiController]
    [Route("api/learning/parent")]
    [Tags("Learning - Parent Portal & Tuition Payment")]
    public class ParentPortalController : ControllerBase
    {
        private readonly ILearnerDashboardService _dashboardService;
        private readonly IParentStudentService _parentStudentService;
        private readonly ITuitionInvoiceService _invoiceService;
        private readonly IPaymentService _paymentService;

        public ParentPortalController(
            ILearnerDashboardService dashboardService,
            IParentStudentService parentStudentService,
            ITuitionInvoiceService invoiceService,
            IPaymentService paymentService)
        {
            _dashboardService = dashboardService;
            _parentStudentService = parentStudentService;
            _invoiceService = invoiceService;
            _paymentService = paymentService;
        }

        /// <summary>
        /// Lấy tổng quan các con đã liên kết của Phụ huynh (Kèm tỷ lệ chuyên cần, điểm trung bình, công nợ học phí & danh sách lớp đang học)
        /// </summary>
        [HttpGet("{parentId:int}/children-overview")]
        public async Task<IActionResult> GetChildrenOverview(int parentId)
        {
            var data = await _dashboardService.GetParentChildrenOverviewAsync(parentId);
            return Ok(new { success = true, data });
        }

        /// <summary>
        /// Tra cứu chi tiết Hóa đơn học phí cần đóng & Lịch sử giao dịch của một Học sinh (Dùng chung cho StudentTuitionPage và ParentTuitionPage)
        /// </summary>
        [HttpGet("tuition/{studentId:int}")]
        public async Task<IActionResult> GetStudentTuition(int studentId)
        {
            var data = await _dashboardService.GetStudentTuitionOverviewAsync(studentId);
            if (data == null)
            {
                return NotFound(new { success = false, message = $"Không tìm thấy thông tin học phí của học sinh ID = {studentId}" });
            }

            return Ok(new { success = true, data });
        }

        /// <summary>
        /// Phụ huynh thực hiện Thanh toán học phí trực tuyến cho con (Cập nhật trạng thái Hóa đơn sang 'paid' & tạo bản ghi Payment)
        /// </summary>
        [HttpPost("payments")]
        public async Task<IActionResult> PayStudentTuition([FromBody] PayStudentTuitionRequestDto request)
        {
            if (request == null || request.StudentId <= 0)
            {
                return BadRequest(new { success = false, message = "Thông tin thanh toán không hợp lệ." });
            }

            var updated = await _dashboardService.PayStudentTuitionAsync(request);
            return Ok(new
            {
                success = true,
                message = "Thanh toán học phí thành công!",
                data = updated
            });
        }

        /// <summary>
        /// Khôi phục lại hóa đơn kỳ hiện tại về trạng thái 'unpaid' (Phục vụ Demo thanh toán nhiều lần)
        /// </summary>
        [HttpPost("tuition/{studentId:int}/reset-demo")]
        public async Task<IActionResult> ResetDemoTuition(int studentId)
        {
            var updated = await _dashboardService.ResetDemoUnpaidTuitionAsync(studentId);
            return Ok(new
            {
                success = true,
                message = "Đã tạo lại hóa đơn học phí chờ thanh toán cho kỳ hiện tại.",
                data = updated
            });
        }
    }
}
