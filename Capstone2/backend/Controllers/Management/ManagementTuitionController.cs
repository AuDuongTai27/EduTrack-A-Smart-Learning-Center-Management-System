using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using EduTrack.API.Models.DTOs;
using EduTrack.API.Models.DTOs.Management;
using EduTrack.API.Services.Management.Interfaces;

namespace EduTrack.API.Controllers.Management
{
    /// <summary>
    /// [Bounded Context: Management]
    /// Quản lý Học phí, Phát hành Hóa đơn & Lập Phiếu thu
    /// </summary>
    [ApiController]
    [Route("api/tuitioninvoices")]
    [Tags("Management - Tuition & Billing")]
    public class ManagementTuitionController : ControllerBase
    {
        private readonly IManagementTuitionService _service;

        public ManagementTuitionController(
            IManagementTuitionService service)
        {
            _service = service;
        }

        [HttpPost("generation/preview")]
        public async Task<IActionResult> Preview(GenerateTuitionDto dto) => await Generation(dto, false);

        [HttpPost("generation/confirm")]
        public async Task<IActionResult> Generate(GenerateTuitionDto dto) => await Generation(dto, true);

        private async Task<IActionResult> Generation(GenerateTuitionDto dto, bool confirm)
        {
            try { return Ok(confirm ? await _service.GenerateAsync(dto) : await _service.PreviewAsync(dto)); }
            catch (ArgumentException ex) { return BadRequest(new { message = ex.Message }); }
            catch (InvalidOperationException ex) { return Conflict(new { message = ex.Message }); }
            catch (Exception) { return StatusCode(503, new { message = "Chưa xác nhận kết quả; tải Preview để đối chiếu hóa đơn đã có trước khi thử lại. Batch mới là atomic; không tự tạo Payment." }); }
        }

        // POST: /api/tuitioninvoices
        [HttpPost]
        public async Task<ActionResult<TuitionInvoiceDto>> Create(
            [FromBody] CreateTuitionInvoiceDto dto)
        {
            try
            {
                var created =
                    await _service.CreateTuitionInvoiceAsync(dto);

                return Created(
                    $"/api/tuitioninvoices/{created.InvoiceId}",
                    created
                );
            }
            catch (ArgumentException ex) { return BadRequest(new { message = ex.Message }); }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    message =
                        "Lỗi khi tạo hóa đơn học phí: " + ex.Message
                });
            }
        }

        // PUT: /api/tuitioninvoices/{id}
        [HttpPut("{id:int}")]
        public async Task<ActionResult<TuitionInvoiceDto>> Update(
            int id,
            [FromBody] UpdateTuitionInvoiceDto dto)
        {
            try
            {
                var updated =
                    await _service.UpdateTuitionInvoiceAsync(id, dto);

                if (updated == null)
                {
                    return NotFound(new
                    {
                        message =
                            $"Không tìm thấy hóa đơn có ID = {id}"
                    });
                }

                return Ok(updated);
            }
            catch (ArgumentException ex) { return BadRequest(new { message = ex.Message }); }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    message =
                        "Lỗi khi cập nhật hóa đơn học phí: "
                        + ex.Message
                });
            }
        }

        // POST: /api/tuitioninvoices/{id}/payments
        [HttpPost("{id:int}/payments")]
        public async Task<ActionResult<PaymentDto>> RecordPayment(
            int id,
            [FromBody] CreatePaymentDto dto)
        {
            try
            {
                var created =
                    await _service.RecordPaymentAsync(id, dto);

                return Created(
                    $"/api/payments/{created.PaymentId}",
                    created
                );
            }
            catch (ArgumentException ex) { return BadRequest(new { message = ex.Message }); }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    message =
                        "Lỗi khi ghi nhận thanh toán: "
                        + ex.Message
                });
            }
        }
    }
}
