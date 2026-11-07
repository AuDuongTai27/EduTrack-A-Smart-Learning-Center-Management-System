using EduTrack.API.Models.DTOs;
using EduTrack.API.Repositories.Interfaces;
using EduTrack.API.Services.Interfaces;

namespace EduTrack.API.Services.Implementation;

public class GradeService(IGradeRepository repository) : IGradeService
{
    public async Task<IEnumerable<GradeDto>> GetAllGradesAsync() =>
        await repository.ReadAllAsync();

    public Task<GradeDto?> GetGradeByIdAsync(int id) => repository.ReadByIdAsync(id);
}
