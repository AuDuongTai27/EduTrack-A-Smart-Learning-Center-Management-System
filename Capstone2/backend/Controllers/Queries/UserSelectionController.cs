using EduTrack.API.Models.EF;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EduTrack.API.Controllers.Queries;

// Public data selection, not an authentication or authorization endpoint.
[ApiController, Route("api/user-selection")]
[ResponseCache(NoStore = true, Location = ResponseCacheLocation.None)]
public sealed class UserSelectionController(EduTrackDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Get([FromQuery] string role, CancellationToken ct)
    {
        var roles = new[] { "center_manager", "admin_staff", "teacher", "teaching_assistant", "student", "parent" };
        if (!roles.Contains(role)) return BadRequest(new { message = "Vai trò chọn dữ liệu không hợp lệ." });
        var users = await db.Users.AsNoTracking().Where(u => u.Status == "active" && u.UserRoles.Any(r => r.Role.RoleName == role || role == "teaching_assistant" && r.Role.RoleName == "ta"))
            .OrderBy(u => u.UserId).Select(u => new { u.UserId, u.UserCode, u.FullName, u.Email, u.AvatarUrl, u.Status, Roles = u.UserRoles.Select(r => r.Role.RoleName).ToArray() }).ToListAsync(ct);
        return Ok(users);
    }
}
