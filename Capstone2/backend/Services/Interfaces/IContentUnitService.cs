using System.Collections.Generic;
using System.Threading.Tasks;
using EduTrack.API.Models.DTOs;

namespace EduTrack.API.Services.Interfaces
{
    public interface IContentUnitService
    {
        Task<IEnumerable<ContentUnitDto>> GetAllContentUnitsAsync();
        Task<ContentUnitDto?> GetContentUnitByIdAsync(int id);
    }
}
