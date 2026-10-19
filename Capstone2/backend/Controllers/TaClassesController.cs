using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using EduTrack.API.Models.DTOs;
using EduTrack.API.Services.Interfaces;

namespace EduTrack.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TaClassesController : ControllerBase
    {
        private readonly ITaClassService _service;

        public TaClassesController(ITaClassService service)
        {
            _service = service;
        }

        /// <summary>
        /// Lấy toàn bộ danh sách TaClass
        /// GET: api/taclasses
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<TaClassDto>>> GetAll()
        {
            var list = await _service.GetAllTaClassesAsync();
            return Ok(list);
        }

        /// <summary>
        /// Lấy chi tiết TaClass theo ID
        /// GET: api/taclasses/{id}
        /// </summary>
        [HttpGet("{id:int}")]
        public async Task<ActionResult<TaClassDto>> GetById(int id)
        {
            var item = await _service.GetTaClassByIdAsync(id);
            if (item == null)
            {
                return NotFound(new { message = "Không tìm thấy dữ liệu có ID = " + id });
            }

            return Ok(item);
        }
    }
}
