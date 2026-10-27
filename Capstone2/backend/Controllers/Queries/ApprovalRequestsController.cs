using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using EduTrack.API.Models.DTOs;
using EduTrack.API.Services.Interfaces;

namespace EduTrack.API.Controllers.Queries
{
    [ApiController]
    [Route("api/[controller]")]
    public class ApprovalRequestsController : ControllerBase
    {
        private readonly IApprovalRequestService _service;

        public ApprovalRequestsController(IApprovalRequestService service)
        {
            _service = service;
        }

        /// <summary>
        /// Láº¥y toÃ n bá»™ danh sÃ¡ch ApprovalRequest
        /// GET: api/approvalrequests
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ApprovalRequestDto>>> GetAll()
        {
            var list = await _service.GetAllApprovalRequestsAsync();
            return Ok(list);
        }

        /// <summary>
        /// Láº¥y chi tiáº¿t ApprovalRequest theo ID
        /// GET: api/approvalrequests/{id}
        /// </summary>
        [HttpGet("{id:int}")]
        public async Task<ActionResult<ApprovalRequestDto>> GetById(int id)
        {
            var item = await _service.GetApprovalRequestByIdAsync(id);
            if (item == null)
            {
                return NotFound(new { message = "KhÃ´ng tÃ¬m tháº¥y dá»¯ liá»‡u cÃ³ ID = " + id });
            }

            return Ok(item);
        }
    }
}

