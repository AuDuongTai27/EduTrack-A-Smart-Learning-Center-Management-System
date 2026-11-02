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
        /// Lấy toàn bộ danh sách Submission
        /// GET: api/submissions
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<SubmissionDto>>> GetAll()
        {
            var list = await _service.GetAllSubmissionsAsync();
            return Ok(list);
        }

        /// <summary>
        /// Lấy chi tiết Submission theo ID
        /// GET: api/submissions/{id}
        /// </summary>
        [HttpGet("{id:int}")]
        public async Task<ActionResult<SubmissionDto>> GetById(int id)
        {
            var item = await _service.GetSubmissionByIdAsync(id);
            if (item == null)
            {
                return NotFound(new { message = "Không tìm thấy dữ liệu có ID = " + id });
            }

            return Ok(item);
        }
    }
}

