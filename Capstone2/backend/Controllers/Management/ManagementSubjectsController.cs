using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using EduTrack.API.Models.DTOs;
using EduTrack.API.Models.DTOs.Management;
using EduTrack.API.Services.Management.Interfaces;

namespace EduTrack.API.Controllers.Management
{
    /// <summary>
    /// [Bounded Context: Management] Quản lý Môn học & Chương trình học (Subjects & Content Units)
    /// Phụ trách: Nhóm Center Manager & Admin Staff
    /// </summary>
    [ApiController]
    [Route("api/subjects")]
    [Tags("Management - Subjects")]
    public class ManagementSubjectsController : ControllerBase
    {
        private readonly IManagementSubjectService _service;

        public ManagementSubjectsController(IManagementSubjectService service)
        {
            _service = service;
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
                return Created($"/api/subjects/{created.SubjectId}", created);
            }
            catch (Exception ex)
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
            catch (Exception ex)
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
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Đã xảy ra lỗi khi xóa môn học: " + ex.Message });
            }
        }
    }
}
