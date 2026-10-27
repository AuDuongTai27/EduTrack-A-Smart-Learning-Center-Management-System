using System.Threading.Tasks;
using EduTrack.API.Models.DTOs;
using EduTrack.API.Models.DTOs.Management;

namespace EduTrack.API.Services.Management.Interfaces
{
    public interface IManagementClassService
    {
        Task<ClassDto> CreateClassAsync(CreateClassDto dto);
        Task<ClassDto?> UpdateClassAsync(int id, UpdateClassDto dto);
        Task<(bool Success, string Message)> DeleteClassAsync(int id);
    }
}
