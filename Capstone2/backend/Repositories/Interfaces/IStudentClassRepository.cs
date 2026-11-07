using System.Threading.Tasks;
using EduTrack.API.Models.Entities;

namespace EduTrack.API.Repositories.Interfaces
{
    public interface IStudentClassRepository : IGenericRepository<StudentClass>
    {
        Task<IEnumerable<StudentClass>> GetForStudentAsync(int studentId);
        Task<IEnumerable<StudentClass>> EnrollAsync(int studentId, int gradeId, IReadOnlyCollection<int> classIds);
        Task<IEnumerable<StudentClass>> DropAsync(int studentId, int enrollmentId, string? reason);
    }
}
