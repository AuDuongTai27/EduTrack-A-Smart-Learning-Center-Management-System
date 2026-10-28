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
        Task<StudentTuitionOverviewDto?> GetStudentTuitionOverviewAsync(int studentId);
        Task<StudentTuitionOverviewDto> PayStudentTuitionAsync(PayStudentTuitionRequestDto request);
        Task<StudentTuitionOverviewDto?> ResetDemoUnpaidTuitionAsync(int studentId);
        Task<List<LearnerFeedbackItemDto>> GetLearnerFeedbacksAsync(int userId, int? studentId = null);
        Task<LearnerFeedbackItemDto> CreateLearnerFeedbackAsync(CreateLearnerFeedbackRequestDto request);
        Task<LearnerFeedbackItemDto?> UpdateLearnerFeedbackAsync(int requestId, UpdateLearnerFeedbackRequestDto request);
        Task<List<LearnerNotificationItemDto>> GetStudentNotificationsAsync(int studentId);
        Task<List<LearnerNotificationItemDto>> GetParentNotificationsAsync(int parentId, int? studentId = null);
        Task<bool> MarkNotificationAsReadAsync(int notificationId);
        Task<int> MarkAllNotificationsAsReadAsync(int userId, int? studentId = null);
    }
}
