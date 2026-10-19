using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using EduTrack.API.Models.DTOs;
using EduTrack.API.Services.Interfaces;

namespace EduTrack.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ClassesController : ControllerBase
    {
        private readonly IClassService _service;

        public ClassesController(IClassService service)
        {
            _service = service;
        }

        /// <summary>
        /// Lấy toàn bộ danh sách Class
        /// GET: api/classes
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ClassDto>>> GetAll()
        {
            var list = await _service.GetAllClassesAsync();
            return Ok(list);
        }

        /// <summary>
        /// Lấy chi tiết Class theo ID
        /// GET: api/classes/{id}
        /// </summary>
        [HttpGet("{id:int}")]
        public async Task<ActionResult<ClassDto>> GetById(int id)
        {
            var item = await _service.GetClassByIdAsync(id);
            if (item == null)
            {
                return NotFound(new { message = "Không tìm thấy dữ liệu có ID = " + id });
            }

            return Ok(item);
        }
    }
}
