using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using EduTrack.API.Services.Interfaces;

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
        private readonly IParentStudentService _parentStudentService;
        private readonly ITuitionInvoiceService _invoiceService;
        private readonly IPaymentService _paymentService;

        public ParentPortalController(
            IParentStudentService parentStudentService,
            ITuitionInvoiceService invoiceService,
            IPaymentService paymentService)
        {
            _parentStudentService = parentStudentService;
            _invoiceService = invoiceService;
            _paymentService = paymentService;
        }

        // TODO [Thành viên 3 - Student & Parent]:
        // Viết các API dành cho Phụ huynh xem thông tin con và thanh toán học phí tại đây:
        // - GET  /api/learning/parent/{parentId}/children (Danh sách các con của phụ huynh)
        // - POST /api/payments                            (Học sinh/Phụ huynh thực hiện thanh toán học phí)
    }
}
