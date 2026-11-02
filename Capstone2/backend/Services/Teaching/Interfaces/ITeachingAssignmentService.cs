using System.Collections.Generic;
using System.Threading.Tasks;
using EduTrack.API.Models.DTOs.Teaching;

namespace EduTrack.API.Services.Teaching.Interfaces
{
    public interface ITeachingAssignmentService
    {
        /// <summary>
        /// Tạo bài tập mới cho lớp học
        /// </summary>
        Task<TeachingAssignmentItemDto> CreateAssignmentAsync(CreateTeachingAssignmentRequestDto request);

        /// <summary>
        /// Lấy danh sách bài tập của một lớp
        /// </summary>
        Task<List<TeachingAssignmentItemDto>> GetClassAssignmentsAsync(int classId);

        /// <summary>
        /// Lấy chi tiết một bài tập theo ID
        /// </summary>
        Task<TeachingAssignmentItemDto?> GetAssignmentByIdAsync(int assignmentId);

        /// <summary>
        /// Cập nhật thông tin bài tập
        /// </summary>
        Task<TeachingAssignmentItemDto> UpdateAssignmentAsync(int assignmentId, UpdateTeachingAssignmentRequestDto request);

        /// <summary>
        /// Xóa bài tập
        /// </summary>
        Task<bool> DeleteAssignmentAsync(int assignmentId);

        /// <summary>
        /// Lấy danh sách bài nộp của học sinh theo bài tập
        /// </summary>
        Task<List<TeachingSubmissionItemDto>> GetAssignmentSubmissionsAsync(int assignmentId);

        /// <summary>
        /// Chấm điểm và gửi nhận xét cho bài nộp học sinh
        /// </summary>
        Task<TeachingSubmissionItemDto> GradeSubmissionAsync(int assignmentId, int submissionId, GradeTeachingSubmissionRequestDto request);
    }
}
