using System.Collections.Generic;
using System.Threading.Tasks;
using EduTrack.API.Models.DTOs;

namespace EduTrack.API.Services.Interfaces
{
    public interface ISubjectService
    {
        Task<IEnumerable<SubjectDto>> GetAllSubjectsAsync();
        Task<SubjectDto?> GetSubjectByIdAsync(int id);
        Task<SubjectDto> CreateSubjectAsync(CreateSubjectDto dto);
        Task<SubjectDto?> UpdateSubjectAsync(int id, UpdateSubjectDto dto);
        Task<bool> DeleteSubjectAsync(int id);
    }
}

