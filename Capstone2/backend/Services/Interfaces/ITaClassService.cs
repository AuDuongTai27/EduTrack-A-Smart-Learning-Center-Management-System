using System.Collections.Generic;
using System.Threading.Tasks;
using EduTrack.API.Models.DTOs;

namespace EduTrack.API.Services.Interfaces
{
    public interface ITaClassService
    {
        Task<IEnumerable<TaClassDto>> GetAllTaClassesAsync();
        Task<TaClassDto?> GetTaClassByIdAsync(int id);
    }
}
