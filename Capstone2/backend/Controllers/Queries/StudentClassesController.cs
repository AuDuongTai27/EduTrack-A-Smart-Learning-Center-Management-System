using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using EduTrack.API.Models.DTOs;
using EduTrack.API.Services.Interfaces;

namespace EduTrack.API.Controllers.Queries
{
    [ApiController]
    [Route("api/[controller]")]
    public class StudentClassesController : ControllerBase
    {
        private readonly IStudentClassService _service;

        public StudentClassesController(IStudentClassService service)
        {
            _service = service;
        }

        /// <summary>
        /// Láº¥y toÃ n bá»™ danh sÃ¡ch StudentClass
        /// GET: api/studentclasses
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<StudentClassDto>>> GetAll()
        {
            var list = await _service.GetAllStudentClassesAsync();
            return Ok(list);
        }

        /// <summary>
        /// Láº¥y chi tiáº¿t StudentClass theo ID
        /// GET: api/studentclasses/{id}
        /// </summary>
        [HttpGet("{id:int}")]
        public async Task<ActionResult<StudentClassDto>> GetById(int id)
        {
            var item = await _service.GetStudentClassByIdAsync(id);
            if (item == null)
            {
                return NotFound(new { message = "KhÃ´ng tÃ¬m tháº¥y dá»¯ liá»‡u cÃ³ ID = " + id });
            }

            return Ok(item);
        }
    }
}

