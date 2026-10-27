using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using EduTrack.API.Models.DTOs;
using EduTrack.API.Services.Interfaces;

namespace EduTrack.API.Controllers.Management
{
    /// <summary>
    /// [Bounded Context: Management] Quản lý Lớp học, Phân công Giáo viên/TA, Xếp lớp Học sinh & Lịch học
    /// Phụ trách: Nhóm Center Manager & Admin Staff
    /// </summary>
    [ApiController]
    [Route("api/classes")]
    [Tags("Management - Classes & Schedules")]
    public class ManagementClassesController : ControllerBase
    {
        private readonly IClassService _service;

        public ManagementClassesController(IClassService service)
        {
            _service = service;
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
                return Created($"/api/classes/{created.ClassId}", created);
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

        // TODO [Thành viên 1 - CM & Admin Staff]:
        // Bổ sung các API Sub-resource tại đây mà không sợ đụng chạm nhóm khác:
        // - POST   /api/classes/{id}/students  (Xếp học sinh vào lớp)
        // - POST   /api/classes/{id}/teachers  (Gán giáo viên phụ trách)
        // - POST   /api/classes/{id}/tas       (Gán trợ giảng)
        // - POST   /api/classes/{id}/schedules (Tạo lịch học cho lớp)
    }
}
