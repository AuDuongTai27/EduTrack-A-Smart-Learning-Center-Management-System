using EduTrack.API.Models.DTOs;

namespace EduTrack.API.Services.Interfaces;

public interface IGradeService
{
    Task<IEnumerable<GradeDto>> GetAllGradesAsync();
    Task<GradeDto?> GetGradeByIdAsync(int id);
}
