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

        /// <summary>
        /// Tạo mới một môn học (Subject)
        /// POST: api/subjects
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<SubjectDto>> Create([FromBody] CreateSubjectDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var created = await _service.CreateSubjectAsync(dto);
                return CreatedAtAction(nameof(GetById), new { id = created.SubjectId }, created);
            }
            catch (System.Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Cập nhật thông tin môn học (Subject)
        /// PUT: api/subjects/{id}
        /// </summary>
        [HttpPut("{id:int}")]
        public async Task<ActionResult<SubjectDto>> Update(int id, [FromBody] UpdateSubjectDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var updated = await _service.UpdateSubjectAsync(id, dto);
                if (updated == null)
                {
                    return NotFound(new { message = "Không tìm thấy môn học có ID = " + id });
                }

                return Ok(updated);
            }
            catch (System.Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Xóa môn học theo ID
        /// DELETE: api/subjects/{id}
        /// </summary>
        [HttpDelete("{id:int}")]
        public async Task<ActionResult> Delete(int id)
        {
            try
            {
                var result = await _service.DeleteSubjectAsync(id);
                if (!result)
                {
                    return NotFound(new { message = "Không tìm thấy môn học có ID = " + id });
                }

                return Ok(new { success = true, message = $"Đã xóa môn học ID = {id} thành công." });
            }
            catch (System.InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, new { message = "Đã xảy ra lỗi khi xóa môn học: " + ex.Message });
            }
        }
    }
}

