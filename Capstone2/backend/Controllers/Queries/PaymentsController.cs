using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using EduTrack.API.Models.DTOs;
using EduTrack.API.Services.Interfaces;

namespace EduTrack.API.Controllers.Queries
{
    [ApiController]
    [Route("api/[controller]")]
    public class PaymentsController : ControllerBase
    {
        private readonly IPaymentService _service;

        public PaymentsController(IPaymentService service)
        {
            _service = service;
        }

        /// <summary>
        /// Lấy toàn bộ danh sách Payment
        /// GET: api/payments
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<PaymentDto>>> GetAll()
        {
            var list = await _service.GetAllPaymentsAsync();
            return Ok(list);
        }

        /// <summary>
        /// Lấy chi tiết Payment theo ID
        /// GET: api/payments/{id}
        /// </summary>
        [HttpGet("{id:int}")]
        public async Task<ActionResult<PaymentDto>> GetById(int id)
        {
            var item = await _service.GetPaymentByIdAsync(id);
            if (item == null)
            {
                return NotFound(new { message = "Không tìm thấy dữ liệu có ID = " + id });
            }

            return Ok(item);
        }
    }
}

