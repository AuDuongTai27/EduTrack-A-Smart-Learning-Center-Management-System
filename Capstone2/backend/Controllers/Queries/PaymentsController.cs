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
        /// Láº¥y toÃ n bá»™ danh sÃ¡ch Payment
        /// GET: api/payments
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<PaymentDto>>> GetAll()
        {
            var list = await _service.GetAllPaymentsAsync();
            return Ok(list);
        }

        /// <summary>
        /// Láº¥y chi tiáº¿t Payment theo ID
        /// GET: api/payments/{id}
        /// </summary>
        [HttpGet("{id:int}")]
        public async Task<ActionResult<PaymentDto>> GetById(int id)
        {
            var item = await _service.GetPaymentByIdAsync(id);
            if (item == null)
            {
                return NotFound(new { message = "KhÃ´ng tÃ¬m tháº¥y dá»¯ liá»‡u cÃ³ ID = " + id });
            }

            return Ok(item);
        }
    }
}

