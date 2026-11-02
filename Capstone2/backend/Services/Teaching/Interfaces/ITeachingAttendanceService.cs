using System.Collections.Generic;
using System.Threading.Tasks;
using EduTrack.API.Models.DTOs.Teaching;

namespace EduTrack.API.Services.Teaching.Interfaces
{
    public interface ITeachingAttendanceService
    {
        /// <summary>
        /// Lấy danh sách các buổi học của một lớp học
        /// </summary>
        Task<List<TeachingSessionItemDto>> GetClassSessionsAsync(int classId);

        /// <summary>
        /// Lấy bảng điểm danh của lớp theo buổi học cụ thể
        /// </summary>
        Task<TeachingClassAttendanceSheetDto?> GetAttendanceSheetAsync(int classId, int? sessionId, int userId);

        /// <summary>
        /// Lưu điểm danh đồng loạt cho buổi học vào cơ sở dữ liệu
        /// </summary>
        Task<TeachingClassAttendanceSheetDto> SaveBulkAttendanceAsync(SaveBulkTeachingAttendanceRequestDto request);

        /// <summary>
        /// Cập nhật nhanh một bản ghi điểm danh
        /// </summary>
        Task<TeachingStudentAttendanceItemDto?> UpdateSingleAttendanceAsync(int attendanceId, UpdateSingleAttendanceRequestDto request);
    }
}

