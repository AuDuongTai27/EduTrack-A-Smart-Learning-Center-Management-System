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
    }
}
