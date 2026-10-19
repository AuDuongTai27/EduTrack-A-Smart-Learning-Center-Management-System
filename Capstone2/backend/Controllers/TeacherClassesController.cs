using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using EduTrack.API.Models.DTOs;
using EduTrack.API.Services.Interfaces;

namespace EduTrack.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TeacherClassesController : ControllerBase
    {
        private readonly ITeacherClassService _service;

        public TeacherClassesController(ITeacherClassService service)
        {
            _service = service;
        }

        /// <summary>
        /// Lấy toàn bộ danh sách TeacherClass
        /// GET: api/teacherclasses
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<TeacherClassDto>>> GetAll()
        {
            var list = await _service.GetAllTeacherClassesAsync();
            return Ok(list);
        }

        /// <summary>
        /// Lấy chi tiết TeacherClass theo ID
        /// GET: api/teacherclasses/{id}
        /// </summary>
        [HttpGet("{id:int}")]
        public async Task<ActionResult<TeacherClassDto>> GetById(int id)
        {
            var item = await _service.GetTeacherClassByIdAsync(id);
            if (item == null)
            {
                return NotFound(new { message = "Không tìm thấy dữ liệu có ID = " + id });
            }

            return Ok(item);
        }
    }
}
