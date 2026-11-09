using System.ComponentModel.DataAnnotations;

namespace EduTrack.API.Models.DTOs.Management
{
    public class AssignClassStaffDto
    {
        [Range(1, int.MaxValue, ErrorMessage = "Vui lòng chọn tài khoản hợp lệ.")]
        public int UserId { get; set; }
    }
}
