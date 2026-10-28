using System.Collections.Generic;
using System.Threading.Tasks;
using EduTrack.API.Models.DTOs.Learning;

namespace EduTrack.API.Services.Learning.Interfaces
{
    public interface ILearnerDashboardService
    {
        Task<StudentDashboardDto?> GetStudentDashboardAsync(int studentId);
        Task<List<ParentChildOverviewDto>> GetParentChildrenOverviewAsync(int parentId);
        Task<StudentClassDetailDto?> GetStudentClassDetailAsync(int studentId, int classId);
        Task<StudentAssignmentDetailDto?> GetStudentAssignmentDetailAsync(int studentId, int assignmentId);
        Task<StudentSubmissionDetailDto> SubmitHomeworkAsync(SubmitHomeworkRequestDto request);
        Task<bool> DeleteSubmissionAsync(int assignmentId, int studentId);
        Task<List<StudentScheduleSlotDto>> GetStudentScheduleAsync(int studentId);
        Task<StudentProgressOverviewDto?> GetStudentProgressAsync(int studentId);
    }
}
