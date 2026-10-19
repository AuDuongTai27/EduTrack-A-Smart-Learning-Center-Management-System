using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using EduTrack.API.Models.DTOs;
using EduTrack.API.Services.Interfaces;

namespace EduTrack.API.Controllers
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
        /// Lấy toàn bộ danh sách TuitionInvoice
        /// GET: api/tuitioninvoices
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<TuitionInvoiceDto>>> GetAll()
        {
            var list = await _service.GetAllTuitionInvoicesAsync();
            return Ok(list);
        }

        /// <summary>
        /// Lấy chi tiết TuitionInvoice theo ID
        /// GET: api/tuitioninvoices/{id}
        /// </summary>
        [HttpGet("{id:int}")]
        public async Task<ActionResult<TuitionInvoiceDto>> GetById(int id)
        {
            var item = await _service.GetTuitionInvoiceByIdAsync(id);
            if (item == null)
            {
                return NotFound(new { message = "Không tìm thấy dữ liệu có ID = " + id });
            }

            return Ok(item);
        }
    }
}
