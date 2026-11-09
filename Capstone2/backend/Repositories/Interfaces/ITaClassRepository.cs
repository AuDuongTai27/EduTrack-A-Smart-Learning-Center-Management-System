using System.Threading.Tasks;
using EduTrack.API.Models.Entities;

namespace EduTrack.API.Repositories.Interfaces
{
    public interface ITaClassRepository : IGenericRepository<TaClass>
    {
        Task<TaClass?> FindAssignmentAsync(int classId, int taId);
        Task<TaClass?> DeactivateAsync(int classId, int assignmentId);
    }
}
