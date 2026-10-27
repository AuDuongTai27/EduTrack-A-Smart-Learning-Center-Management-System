using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using EduTrack.API.Models.DTOs;
using EduTrack.API.Services.Interfaces;

namespace EduTrack.API.Controllers.Queries
{
    [ApiController]
    [Route("api/[controller]")]
    public class SubmissionsController : ControllerBase
    {
        private readonly ISubmissionService _service;

        public SubmissionsController(ISubmissionService service)
        {
            _service = service;
        }

        /// <summary>
        /// Láº¥y toÃ n bá»™ danh sÃ¡ch Submission
        /// GET: api/submissions
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<SubmissionDto>>> GetAll()
        {
            var list = await _service.GetAllSubmissionsAsync();
            return Ok(list);
        }

        /// <summary>
        /// Láº¥y chi tiáº¿t Submission theo ID
        /// GET: api/submissions/{id}
        /// </summary>
        [HttpGet("{id:int}")]
        public async Task<ActionResult<SubmissionDto>> GetById(int id)
        {
            var item = await _service.GetSubmissionByIdAsync(id);
            if (item == null)
            {
                return NotFound(new { message = "KhÃ´ng tÃ¬m tháº¥y dá»¯ liá»‡u cÃ³ ID = " + id });
            }

            return Ok(item);
        }
    }
}

