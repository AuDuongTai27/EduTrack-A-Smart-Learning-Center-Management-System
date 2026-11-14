using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using EduTrack.API.Models.DTOs;
using EduTrack.API.Models.DTOs.Management;
using EduTrack.API.Services.Interfaces;
using EduTrack.API.Services.Management.Interfaces;

namespace EduTrack.API.Controllers.Queries
{
    [ApiController]
    [Route("api/tuitioninvoices")]
    [Tags("Tuition Invoices & Payments")]
    public class TuitionInvoicesController : ControllerBase
    {
        private readonly ITuitionInvoiceService? _queryService;
        private readonly IManagementTuitionService? _managementService;
        private readonly IPaymentService? _paymentService;

        public TuitionInvoicesController(
            ITuitionInvoiceService? queryService = null,
            IManagementTuitionService? managementService = null,
            IPaymentService? paymentService = null)
        {
            _queryService = queryService;
            _managementService = managementService;
            _paymentService = paymentService;
        }

        /// <summary>
        /// Lấy toàn bộ danh sách TuitionInvoice
        /// GET: api/tuitioninvoices
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<TuitionInvoiceDto>>> GetAll()
        {
            var list = await _queryService!.GetAllTuitionInvoicesAsync();
            return Ok(list);
        }

        /// <summary>
        /// Lấy chi tiết TuitionInvoice theo ID
        /// GET: api/tuitioninvoices/{id}
        /// </summary>
        [HttpGet("{id:int}")]
        public async Task<ActionResult<TuitionInvoiceDto>> GetById(int id)
        {
            var item = await _queryService!.GetTuitionInvoiceByIdAsync(id);
            if (item == null)
            {
                return NotFound(new { message = "Không tìm thấy dữ liệu có ID = " + id });
            }

            return Ok(item);
        }

        [HttpPost("generation/preview")]
        public async Task<IActionResult> Preview(GenerateTuitionDto dto) => await Generation(dto, false);

        [HttpPost("generation/confirm")]
        public async Task<IActionResult> Generate(GenerateTuitionDto dto) => await Generation(dto, true);

        private async Task<IActionResult> Generation(GenerateTuitionDto dto, bool confirm)
        {
            try { return Ok(confirm ? await _managementService!.GenerateAsync(dto) : await _managementService!.PreviewAsync(dto)); }
            catch (ArgumentException ex) { return BadRequest(new { message = ex.Message }); }
            catch (InvalidOperationException ex) { return Conflict(new { message = ex.Message }); }
            catch (Exception) { return StatusCode(503, new { message = "Chưa xác nhận kết quả; tải Preview để đối chiếu hóa đơn đã có trước khi thử lại. Batch mới là atomic; không tự tạo Payment." }); }
        }

        // POST: /api/tuitioninvoices
        [HttpPost]
        public async Task<ActionResult<TuitionInvoiceDto>> Create([FromBody] CreateTuitionInvoiceDto dto)
        {
            try
            {
                var created = await _managementService!.CreateTuitionInvoiceAsync(dto);
                return Created($"/api/tuitioninvoices/{created.InvoiceId}", created);
            }
            catch (ArgumentException ex) { return BadRequest(new { message = ex.Message }); }
            catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi tạo hóa đơn học phí: " + ex.Message });
            }
        }

        // PUT: /api/tuitioninvoices/{id}
        [HttpPut("{id:int}")]
        public async Task<ActionResult<TuitionInvoiceDto>> Update(int id, [FromBody] UpdateTuitionInvoiceDto dto)
        {
            try
            {
                var updated = await _managementService!.UpdateTuitionInvoiceAsync(id, dto);
                if (updated == null)
                {
                    return NotFound(new { message = $"Không tìm thấy hóa đơn có ID = {id}" });
                }

                return Ok(updated);
            }
            catch (ArgumentException ex) { return BadRequest(new { message = ex.Message }); }
            catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi cập nhật hóa đơn học phí: " + ex.Message });
            }
        }

        // POST: /api/tuitioninvoices/{id}/payments
        [HttpPost("{id:int}/payments")]
        public async Task<ActionResult<PaymentDto>> RecordPayment(int id, [FromBody] CreatePaymentDto dto)
        {
            try
            {
                var created = await _managementService!.RecordPaymentAsync(id, dto);
                return Created($"/api/payments/{created.PaymentId}", created);
            }
            catch (ArgumentException ex) { return BadRequest(new { message = ex.Message }); }
            catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi ghi nhận thanh toán: " + ex.Message });
            }
        }

        // =====================================================================
        // SUB-RESOURCE: PAYMENTS QUERY (/api/payments)
        // =====================================================================

        /// <summary>
        /// Lấy toàn bộ danh sách Payment
        /// GET: api/payments
        /// </summary>
        [HttpGet("/api/payments")]
        public async Task<ActionResult<IEnumerable<PaymentDto>>> GetAllPayments()
        {
            var list = await _paymentService!.GetAllPaymentsAsync();
            return Ok(list);
        }

        /// <summary>
        /// Lấy chi tiết Payment theo ID
        /// GET: api/payments/{id}
        /// </summary>
        [HttpGet("/api/payments/{id:int}")]
        public async Task<ActionResult<PaymentDto>> GetPaymentById(int id)
        {
            var item = await _paymentService!.GetPaymentByIdAsync(id);
            if (item == null)
            {
                return NotFound(new { message = "Không tìm thấy dữ liệu có ID = " + id });
            }

            return Ok(item);
        }
    }
}
