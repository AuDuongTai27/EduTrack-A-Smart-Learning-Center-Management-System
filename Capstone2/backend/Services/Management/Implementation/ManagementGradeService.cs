using EduTrack.API.Models.DTOs;
using EduTrack.API.Models.DTOs.Management;
using EduTrack.API.Repositories.Interfaces;
using EduTrack.API.Services.Management.Interfaces;

namespace EduTrack.API.Services.Management.Implementation;

public class ManagementGradeService(IGradeRepository repository) : IManagementGradeService
{
    public Task<GradeDto> CreateAsync(SaveGradeDto dto) => repository.CreateAsync(GradeNames.RequireValid(dto.GradeName));
    public Task<GradeDto?> RenameAsync(int id, SaveGradeDto dto) => repository.RenameAsync(id, GradeNames.RequireValid(dto.GradeName));
    public Task<GradeDto?> UpdateStatusAsync(int id, string status) => repository.UpdateStatusAsync(id, status);
    public Task<bool> DeleteAsync(int id) => repository.DeleteAsync(id);
}
