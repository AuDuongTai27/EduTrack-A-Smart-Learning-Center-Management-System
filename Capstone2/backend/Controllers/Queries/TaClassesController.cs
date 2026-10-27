using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using EduTrack.API.Models.DTOs;
using EduTrack.API.Services.Interfaces;

namespace EduTrack.API.Controllers.Queries
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
        /// Láº¥y toÃ n bá»™ danh sÃ¡ch TaClass
        /// GET: api/taclasses
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<TaClassDto>>> GetAll()
        {
            var list = await _service.GetAllTaClassesAsync();
            return Ok(list);
        }

        /// <summary>
        /// Láº¥y chi tiáº¿t TaClass theo ID
        /// GET: api/taclasses/{id}
        /// </summary>
        [HttpGet("{id:int}")]
        public async Task<ActionResult<TaClassDto>> GetById(int id)
        {
            var item = await _service.GetTaClassByIdAsync(id);
            if (item == null)
            {
                return NotFound(new { message = "KhÃ´ng tÃ¬m tháº¥y dá»¯ liá»‡u cÃ³ ID = " + id });
            }

            return Ok(item);
        }
    }
}

