using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using EduTrack.API.Models.DTOs;
using EduTrack.API.Services.Interfaces;

namespace EduTrack.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SubjectsController : ControllerBase
    {
        private readonly ISubjectService _service;

        public SubjectsController(ISubjectService service)
        {
            _service = service;
        }

        /// <summary>
        /// Lấy toàn bộ danh sách Subject
        /// GET: api/subjects
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<SubjectDto>>> GetAll()
        {
            var list = await _service.GetAllSubjectsAsync();
            return Ok(list);
        }

        /// <summary>
        /// Lấy chi tiết Subject theo ID
        /// GET: api/subjects/{id}
        /// </summary>
        [HttpGet("{id:int}")]
        public async Task<ActionResult<SubjectDto>> GetById(int id)
        {
            var item = await _service.GetSubjectByIdAsync(id);
            if (item == null)
            {
                return NotFound(new { message = "Không tìm thấy dữ liệu có ID = " + id });
            }

            return Ok(item);
        }
    }
}
