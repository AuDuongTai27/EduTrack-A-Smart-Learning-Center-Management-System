using System.Threading.Tasks;
using EduTrack.API.Models.Entities;

namespace EduTrack.API.Repositories.Interfaces
{
    public interface IParentStudentRepository : IGenericRepository<ParentStudent>
    {
        Task<ParentStudent?> GetByIdsAsync(int parentId, int studentId);
        Task<ParentStudent> AssignAsync(ParentStudent parentStudent, bool updateExisting = false, bool preserveRelationship = false, bool preservePrimaryContact = false);
        Task<bool> RemoveAsync(int parentId, int studentId);
    }
}

