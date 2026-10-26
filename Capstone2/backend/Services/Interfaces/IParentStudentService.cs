using System.Collections.Generic;
using System.Threading.Tasks;
using EduTrack.API.Models.DTOs;

namespace EduTrack.API.Services.Interfaces
{
    public interface IParentStudentService
    {
        Task<IEnumerable<ParentStudentDto>> GetAllParentStudentsAsync();
        Task<ParentStudentDto?> GetByIdsAsync(int parentId, int studentId);
        Task<ParentStudentDto> AssignParentStudentAsync(AssignParentStudentDto dto);
        Task<bool> RemoveParentStudentAsync(int parentId, int studentId);
    }
}

