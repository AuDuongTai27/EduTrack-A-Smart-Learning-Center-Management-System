using EduTrack.API.Models.DTOs;

namespace EduTrack.API.Services.Management.Interfaces
{
    public interface IManagementClassStaffService
    {
        Task<TeacherClassDto> AssignTeacherAsync(int classId, int userId);
        Task<TaClassDto> AssignAssistantAsync(int classId, int userId);
        Task<TeacherClassDto> DeactivateTeacherAsync(int classId, int assignmentId);
        Task<TaClassDto> DeactivateAssistantAsync(int classId, int assignmentId);
    }
}
