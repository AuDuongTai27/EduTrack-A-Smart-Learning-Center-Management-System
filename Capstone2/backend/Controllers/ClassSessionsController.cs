using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using EduTrack.API.Models.DTOs;
using EduTrack.API.Services.Interfaces;

namespace EduTrack.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ClassSessionsController : ControllerBase
    {
        private readonly IClassSessionService _service;

        public ClassSessionsController(IClassSessionService service)
        {
            _service = service;
        }

        /// <summary>
        /// Lấy toàn bộ danh sách ClassSession
        /// GET: api/classsessions
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ClassSessionDto>>> GetAll()
        {
            var list = await _service.GetAllClassSessionsAsync();
            return Ok(list);
        }

        /// <summary>
        /// Lấy chi tiết ClassSession theo ID
        /// GET: api/classsessions/{id}
        /// </summary>
        [HttpGet("{id:int}")]
        public async Task<ActionResult<ClassSessionDto>> GetById(int id)
        {
            var item = await _service.GetClassSessionByIdAsync(id);
            if (item == null)
            {
                return NotFound(new { message = "Không tìm thấy dữ liệu có ID = " + id });
            }

            return Ok(item);
        }
    }
}
