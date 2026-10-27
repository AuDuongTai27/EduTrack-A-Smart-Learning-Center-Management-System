using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using EduTrack.API.Models.DTOs;
using EduTrack.API.Services.Interfaces;

namespace EduTrack.API.Controllers.Queries
{
    [ApiController]
    [Route("api/[controller]")]
    public class AiEvaluationsController : ControllerBase
    {
        private readonly IAiEvaluationService _service;

        public AiEvaluationsController(IAiEvaluationService service)
        {
            _service = service;
        }

        /// <summary>
        /// Láº¥y toÃ n bá»™ danh sÃ¡ch AiEvaluation
        /// GET: api/aievaluations
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<AiEvaluationDto>>> GetAll()
        {
            var list = await _service.GetAllAiEvaluationsAsync();
            return Ok(list);
        }

        /// <summary>
        /// Láº¥y chi tiáº¿t AiEvaluation theo ID
        /// GET: api/aievaluations/{id}
        /// </summary>
        [HttpGet("{id:int}")]
        public async Task<ActionResult<AiEvaluationDto>> GetById(int id)
        {
            var item = await _service.GetAiEvaluationByIdAsync(id);
            if (item == null)
            {
                return NotFound(new { message = "KhÃ´ng tÃ¬m tháº¥y dá»¯ liá»‡u cÃ³ ID = " + id });
            }

            return Ok(item);
        }
    }
}

