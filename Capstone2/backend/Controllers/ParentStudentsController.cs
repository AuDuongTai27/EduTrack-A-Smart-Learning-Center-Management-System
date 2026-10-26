using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using EduTrack.API.Models.DTOs;
using EduTrack.API.Services.Interfaces;

namespace EduTrack.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ParentStudentsController : ControllerBase
    {
        private readonly IParentStudentService _service;

        public ParentStudentsController(IParentStudentService service)
        {
            _service = service;
        }

        /// <summary>
        /// Lấy toàn bộ danh sách liên kết Phụ huynh - Học sinh
        /// GET: api/parentstudents
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ParentStudentDto>>> GetAll()
        {
            var list = await _service.GetAllParentStudentsAsync();
            return Ok(list);
        }

        /// <summary>
        /// Lấy liên kết theo cặp ParentId và StudentId (GetById cho Composite Key)
        /// GET: api/parentstudents/{parentId}/{studentId}
        /// </summary>
        [HttpGet("{parentId:int}/{studentId:int}")]
        public async Task<ActionResult<ParentStudentDto>> GetById(int parentId, int studentId)
        {
            var item = await _service.GetByIdsAsync(parentId, studentId);
            if (item == null)
            {
                return NotFound(new { message = $"Không tìm thấy quan hệ giữa Phụ huynh ID {parentId} và Học sinh ID {studentId}" });
            }
            return Ok(item);
        }

        /// <summary>
        /// Gán hoặc cập nhật liên kết Phụ huynh - Học sinh
        /// POST: api/parentstudents
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<ParentStudentDto>> Assign([FromBody] AssignParentStudentDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var result = await _service.AssignParentStudentAsync(dto);
                return Ok(result);
            }
            catch (System.Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Hủy liên kết giữa Phụ huynh và Học sinh
        /// DELETE: api/parentstudents/{parentId}/{studentId}
        /// </summary>
        [HttpDelete("{parentId:int}/{studentId:int}")]
        public async Task<ActionResult> Remove(int parentId, int studentId)
        {
            try
            {
                var success = await _service.RemoveParentStudentAsync(parentId, studentId);
                if (!success)
                {
                    return NotFound(new { message = $"Không tìm thấy liên kết giữa Phụ huynh {parentId} và Học sinh {studentId}" });
                }

                return Ok(new { success = true, message = "Đã hủy liên kết Phụ huynh - Học sinh thành công." });
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi hủy liên kết: " + ex.Message });
            }
        }
    }
}

