using EduTrack.API.Models.DTOs;

namespace EduTrack.API.Repositories.Interfaces;

public interface IGradeRepository
{
    Task<IReadOnlyList<GradeDto>> ReadAllAsync();
    Task<GradeDto?> ReadByIdAsync(int id);
    Task<GradeDto> CreateAsync(string name);
    Task<GradeDto?> RenameAsync(int id, string name);
    Task<GradeDto?> UpdateStatusAsync(int id, string status);
    Task<bool> DeleteAsync(int id);
}
