using System.Collections.Generic;
using System.Threading.Tasks;
using EduTrack.API.Models.DTOs.Learning;

namespace EduTrack.API.Services.Learning.Interfaces
{
    public interface ILearnerDashboardService
    {
        Task<StudentDashboardDto?> GetStudentDashboardAsync(int studentId);
        Task<List<ParentChildOverviewDto>> GetParentChildrenOverviewAsync(int parentId);
    }
}
