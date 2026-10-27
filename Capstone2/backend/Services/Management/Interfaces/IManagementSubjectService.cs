using System.Threading.Tasks;
using EduTrack.API.Models.DTOs;
using EduTrack.API.Models.DTOs.Management;

namespace EduTrack.API.Services.Management.Interfaces
{
    public interface IManagementSubjectService
    {
        Task<SubjectDto> CreateSubjectAsync(CreateSubjectDto dto);
        Task<SubjectDto?> UpdateSubjectAsync(int id, UpdateSubjectDto dto);
        Task<bool> DeleteSubjectAsync(int id);
    }
}
