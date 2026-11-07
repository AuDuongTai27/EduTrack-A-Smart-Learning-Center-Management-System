using System.Collections.Generic;
using System.Threading.Tasks;
using EduTrack.API.Models.DTOs;

namespace EduTrack.API.Services.Interfaces
{
    public interface IStudentClassService
    {
        Task<IEnumerable<StudentClassDto>> GetAllStudentClassesAsync(int? studentId = null);
        Task<StudentClassDto?> GetStudentClassByIdAsync(int id);
        Task<IEnumerable<StudentClassDto>> EnrollAsync(int studentId, int gradeId, IReadOnlyCollection<int> classIds);
        Task<IEnumerable<StudentClassDto>> DropAsync(int studentId, int enrollmentId, string? reason);
    }
}
