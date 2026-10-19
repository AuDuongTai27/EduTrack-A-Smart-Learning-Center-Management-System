using System.Collections.Generic;
using System.Threading.Tasks;
using EduTrack.API.Models.DTOs;

namespace EduTrack.API.Services.Interfaces
{
    public interface ITeacherClassService
    {
        Task<IEnumerable<TeacherClassDto>> GetAllTeacherClassesAsync();
        Task<TeacherClassDto?> GetTeacherClassByIdAsync(int id);
    }
}
