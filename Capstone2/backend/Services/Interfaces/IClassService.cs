using System.Collections.Generic;
using System.Threading.Tasks;
using EduTrack.API.Models.DTOs;

namespace EduTrack.API.Services.Interfaces
{
    public interface IClassService
    {
        Task<IEnumerable<ClassDto>> GetAllClassesAsync();
        Task<ClassDto?> GetClassByIdAsync(int id);
        Task<ClassDto> CreateClassAsync(CreateClassDto dto);
        Task<ClassDto?> UpdateClassAsync(int id, UpdateClassDto dto);
        Task<(bool Success, string Message)> DeleteClassAsync(int id);
    }
}
