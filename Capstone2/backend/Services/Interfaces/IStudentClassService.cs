using System.Collections.Generic;
using System.Threading.Tasks;
using EduTrack.API.Models.DTOs;

namespace EduTrack.API.Services.Interfaces
{
    public interface IStudentClassService
    {
        Task<IEnumerable<StudentClassDto>> GetAllStudentClassesAsync();
        Task<StudentClassDto?> GetStudentClassByIdAsync(int id);
    }
}
