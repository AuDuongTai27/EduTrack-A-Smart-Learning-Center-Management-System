using System.Threading.Tasks;
using EduTrack.API.Models.DTOs.Teaching;

namespace EduTrack.API.Services.Teaching.Interfaces
{
    /// <summary>
    /// Service phục vụ xem và quản lý tiến độ học tập của học viên theo lớp (Dành cho Giáo viên & Trợ giảng)
    /// </summary>
    public interface ITeachingLearningProgressService
    {
        Task<TeachingClassProgressDto?> GetClassLearningProgressAsync(int classId, int? userId = null);
        Task<TeachingStudentProgressDetailDto?> GetStudentProgressDetailAsync(int classId, int studentId);
        Task<TeachingStudentEvaluationItemDto?> CreateStudentEvaluationAsync(int classId, int studentId, CreateTeachingEvaluationRequest request, int authorId);
    }
}
