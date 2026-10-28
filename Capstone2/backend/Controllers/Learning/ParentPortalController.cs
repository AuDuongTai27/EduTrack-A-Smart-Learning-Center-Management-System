using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
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

        // TODO [Thành viên 3 - Student & Parent]:
        // Viết các API thanh toán học phí tại đây:
        // - POST /api/learning/parent/payments (Học sinh/Phụ huynh thực hiện thanh toán học phí)
    }
}
