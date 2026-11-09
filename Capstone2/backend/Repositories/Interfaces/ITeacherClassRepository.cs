using System.Threading.Tasks;
using EduTrack.API.Models.Entities;

namespace EduTrack.API.Repositories.Interfaces
{
    public interface ITeacherClassRepository : IGenericRepository<TeacherClass>
    {
        Task<TeacherClass?> FindAssignmentAsync(int classId, int teacherId);
        Task<TeacherClass?> DeactivateAsync(int classId, int assignmentId);
    }
}
