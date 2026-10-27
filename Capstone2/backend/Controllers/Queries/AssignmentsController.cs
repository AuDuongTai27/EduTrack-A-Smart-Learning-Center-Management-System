using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using EduTrack.API.Models.DTOs;
using EduTrack.API.Services.Interfaces;

namespace EduTrack.API.Controllers.Queries
{
    [ApiController]
    [Route("api/[controller]")]
    public class AssignmentsController : ControllerBase
    {
        private readonly IAssignmentService _service;

        public AssignmentsController(IAssignmentService service)
        {
            _service = service;
        }

        /// <summary>
        /// Láº¥y toÃ n bá»™ danh sÃ¡ch Assignment
        /// GET: api/assignments
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<AssignmentDto>>> GetAll()
        {
            var list = await _service.GetAllAssignmentsAsync();
            return Ok(list);
        }

        /// <summary>
        /// Láº¥y chi tiáº¿t Assignment theo ID
        /// GET: api/assignments/{id}
        /// </summary>
        [HttpGet("{id:int}")]
        public async Task<ActionResult<AssignmentDto>> GetById(int id)
        {
            var item = await _service.GetAssignmentByIdAsync(id);
            if (item == null)
            {
                return NotFound(new { message = "KhÃ´ng tÃ¬m tháº¥y dá»¯ liá»‡u cÃ³ ID = " + id });
            }

            return Ok(item);
        }
    }
}

