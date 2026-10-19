using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using EduTrack.API.Models.DTOs;
using EduTrack.API.Services.Interfaces;

namespace EduTrack.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProgressNotesController : ControllerBase
    {
        private readonly IProgressNoteService _service;

        public ProgressNotesController(IProgressNoteService service)
        {
            _service = service;
        }

        /// <summary>
        /// Lấy toàn bộ danh sách ProgressNote
        /// GET: api/progressnotes
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ProgressNoteDto>>> GetAll()
        {
            var list = await _service.GetAllProgressNotesAsync();
            return Ok(list);
        }

        /// <summary>
        /// Lấy chi tiết ProgressNote theo ID
        /// GET: api/progressnotes/{id}
        /// </summary>
        [HttpGet("{id:int}")]
        public async Task<ActionResult<ProgressNoteDto>> GetById(int id)
        {
            var item = await _service.GetProgressNoteByIdAsync(id);
            if (item == null)
            {
                return NotFound(new { message = "Không tìm thấy dữ liệu có ID = " + id });
            }

            return Ok(item);
        }
    }
}
