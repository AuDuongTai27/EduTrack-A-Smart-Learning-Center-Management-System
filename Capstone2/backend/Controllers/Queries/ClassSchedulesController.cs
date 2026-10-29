using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using EduTrack.API.Models.DTOs;
using EduTrack.API.Services.Interfaces;

namespace EduTrack.API.Controllers.Queries
{
    [ApiController]
    [Route("api/[controller]")]
    public class ClassSchedulesController : ControllerBase
    {
        private readonly IClassScheduleService _service;

        public ClassSchedulesController(IClassScheduleService service)
        {
            _service = service;
        }

        /// <summary>
        /// Lấy toàn bộ danh sách ClassSchedule
        /// GET: api/classschedules
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ClassScheduleDto>>> GetAll()
        {
            var list = await _service.GetAllClassSchedulesAsync();
            return Ok(list);
        }

        /// <summary>
        /// Lấy chi tiết ClassSchedule theo ID
        /// GET: api/classschedules/{id}
        /// </summary>
        [HttpGet("{id:int}")]
        public async Task<ActionResult<ClassScheduleDto>> GetById(int id)
        {
            var item = await _service.GetClassScheduleByIdAsync(id);
            if (item == null)
            {
                return NotFound(new { message = "Không tìm thấy dữ liệu có ID = " + id });
            }

            return Ok(item);
        }
    }
}

