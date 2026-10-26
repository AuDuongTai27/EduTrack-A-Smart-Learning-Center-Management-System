using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using EduTrack.API.Models.DTOs;
using EduTrack.API.Services.Interfaces;

namespace EduTrack.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ClassesController : ControllerBase
    {
        private readonly IClassService _service;

        public ClassesController(IClassService service)
        {
            _service = service;
        }

        /// <summary>
        /// Lấy toàn bộ danh sách Class
        /// GET: api/classes
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ClassDto>>> GetAll()
        {
            var list = await _service.GetAllClassesAsync();
            return Ok(list);
        }

        /// <summary>
        /// Lấy chi tiết Class theo ID
        /// GET: api/classes/{id}
        /// </summary>
        [HttpGet("{id:int}")]
        public async Task<ActionResult<ClassDto>> GetById(int id)
        {
            var item = await _service.GetClassByIdAsync(id);
            if (item == null)
            {
                return NotFound(new { message = "Không tìm thấy dữ liệu có ID = " + id });
            }

            return Ok(item);
        }

        /// <summary>
        /// Tạo mới một lớp học (Class)
        /// POST: api/classes
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<ClassDto>> Create([FromBody] CreateClassDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var created = await _service.CreateClassAsync(dto);
                return CreatedAtAction(nameof(GetById), new { id = created.ClassId }, created);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Cập nhật thông tin lớp học (Class)
        /// PUT: api/classes/{id}
        /// </summary>
        [HttpPut("{id:int}")]
        public async Task<ActionResult<ClassDto>> Update(int id, [FromBody] UpdateClassDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var updated = await _service.UpdateClassAsync(id, dto);
                if (updated == null)
                {
                    return NotFound(new { message = "Không tìm thấy lớp học có ID = " + id });
                }

                return Ok(updated);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Xóa lớp học theo ID
        /// DELETE: api/classes/{id}
        /// </summary>
        [HttpDelete("{id:int}")]
        public async Task<ActionResult> Delete(int id)
        {
            var (success, message) = await _service.DeleteClassAsync(id);
            if (!success)
            {
                return BadRequest(new { message });
            }

            return Ok(new { message });
        }
    }
}
