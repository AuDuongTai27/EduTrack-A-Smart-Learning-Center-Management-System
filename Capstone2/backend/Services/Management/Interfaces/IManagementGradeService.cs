using EduTrack.API.Models.DTOs;
using EduTrack.API.Models.DTOs.Management;

namespace EduTrack.API.Services.Management.Interfaces;

public interface IManagementGradeService
{
    Task<GradeDto> CreateAsync(SaveGradeDto dto);
    Task<GradeDto?> RenameAsync(int id, SaveGradeDto dto);
    Task<bool> DeleteAsync(int id);
}
