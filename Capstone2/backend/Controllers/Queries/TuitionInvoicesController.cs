using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using EduTrack.API.Models.DTOs;
using EduTrack.API.Services.Interfaces;

namespace EduTrack.API.Controllers.Queries
{
    [ApiController]
    [Route("api/[controller]")]
    public class TuitionInvoicesController : ControllerBase
    {
        private readonly ITuitionInvoiceService _service;

        public TuitionInvoicesController(ITuitionInvoiceService service)
        {
            _service = service;
        }

        /// <summary>
        /// Láº¥y toÃ n bá»™ danh sÃ¡ch TuitionInvoice
        /// GET: api/tuitioninvoices
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<TuitionInvoiceDto>>> GetAll()
        {
            var list = await _service.GetAllTuitionInvoicesAsync();
            return Ok(list);
        }

        /// <summary>
        /// Láº¥y chi tiáº¿t TuitionInvoice theo ID
        /// GET: api/tuitioninvoices/{id}
        /// </summary>
        [HttpGet("{id:int}")]
        public async Task<ActionResult<TuitionInvoiceDto>> GetById(int id)
        {
            var item = await _service.GetTuitionInvoiceByIdAsync(id);
            if (item == null)
            {
                return NotFound(new { message = "KhÃ´ng tÃ¬m tháº¥y dá»¯ liá»‡u cÃ³ ID = " + id });
            }

            return Ok(item);
        }
    }
}

