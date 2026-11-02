using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using EduTrack.API.Models.DTOs;
using EduTrack.API.Services.Interfaces;

namespace EduTrack.API.Controllers.Queries
{
    [ApiController]
    [Route("api/[controller]")]
    public class AttendancesController : ControllerBase
    {
        private readonly IAttendanceService _service;

        public AttendancesController(IAttendanceService service)
        {
            _service = service;
        }

        /// <summary>
        /// Lấy toàn bộ danh sách Attendance
        /// GET: api/attendances
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<AttendanceDto>>> GetAll()
        {
            var list = await _service.GetAllAttendancesAsync();
            return Ok(list);
        }

        /// <summary>
        /// Lấy chi tiết Attendance theo ID
        /// GET: api/attendances/{id}
        /// </summary>
        [HttpGet("{id:int}")]
        public async Task<ActionResult<AttendanceDto>> GetById(int id)
        {
            var item = await _service.GetAttendanceByIdAsync(id);
            if (item == null)
            {
                return NotFound(new { message = "Không tìm thấy dữ liệu có ID = " + id });
            }

            return Ok(item);
        }
    }
}

