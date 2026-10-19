using System.Collections.Generic;
using System.Threading.Tasks;
using EduTrack.API.Models.DTOs;

namespace EduTrack.API.Services.Interfaces
{
    public interface IClassSessionService
    {
        Task<IEnumerable<ClassSessionDto>> GetAllClassSessionsAsync();
        Task<ClassSessionDto?> GetClassSessionByIdAsync(int id);
    }
}
