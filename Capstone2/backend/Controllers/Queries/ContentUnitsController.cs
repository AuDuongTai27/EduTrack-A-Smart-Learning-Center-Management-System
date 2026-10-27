using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using EduTrack.API.Models.DTOs;
using EduTrack.API.Services.Interfaces;

namespace EduTrack.API.Controllers.Queries
{
    [ApiController]
    [Route("api/[controller]")]
    public class ContentUnitsController : ControllerBase
    {
        private readonly IContentUnitService _service;

        public ContentUnitsController(IContentUnitService service)
        {
            _service = service;
        }

        /// <summary>
        /// Láº¥y toÃ n bá»™ danh sÃ¡ch ContentUnit
        /// GET: api/contentunits
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ContentUnitDto>>> GetAll()
        {
            var list = await _service.GetAllContentUnitsAsync();
            return Ok(list);
        }

        /// <summary>
        /// Láº¥y chi tiáº¿t ContentUnit theo ID
        /// GET: api/contentunits/{id}
        /// </summary>
        [HttpGet("{id:int}")]
        public async Task<ActionResult<ContentUnitDto>> GetById(int id)
        {
            var item = await _service.GetContentUnitByIdAsync(id);
            if (item == null)
            {
                return NotFound(new { message = "KhÃ´ng tÃ¬m tháº¥y dá»¯ liá»‡u cÃ³ ID = " + id });
            }

            return Ok(item);
        }
    }
}

