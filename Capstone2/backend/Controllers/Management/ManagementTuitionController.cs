using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using EduTrack.API.Services.Interfaces;

namespace EduTrack.API.Controllers.Management
{
    /// <summary>
    /// [Bounded Context: Management] Quản lý Học phí, Phát hành Hóa đơn & Lập Phiếu thu tại quầy
    /// Phụ trách: Nhóm Center Manager & Admin Staff (Thành viên 1)
    /// </summary>
    [ApiController]
    [Route("api/management/tuition")]
    [Tags("Management - Tuition & Billing")]
    public class ManagementTuitionController : ControllerBase
    {
        private readonly ITuitionInvoiceService _invoiceService;
        private readonly IPaymentService _paymentService;

        public ManagementTuitionController(
            ITuitionInvoiceService invoiceService,
            IPaymentService paymentService)
        {
            _invoiceService = invoiceService;
            _paymentService = paymentService;
        }

        // TODO [Thành viên 1 - CM & Admin Staff]:
        // Viết các API nghiệp vụ Học phí & Thu ngân tại đây:
        // - POST /api/tuitioninvoices               (Phát hành hóa đơn học phí mới)
        // - PUT  /api/tuitioninvoices/{id}          (Cập nhật/hủy hóa đơn)
        // - POST /api/tuitioninvoices/{id}/payments (Admin Staff lập phiếu thu tiền mặt/chuyển khoản tại quầy)
    }
}
