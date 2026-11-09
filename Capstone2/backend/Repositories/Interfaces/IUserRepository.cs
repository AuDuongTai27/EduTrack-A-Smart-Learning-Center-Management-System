using EduTrack.API.Models.Entities;

namespace EduTrack.API.Repositories.Interfaces
{
    /// <summary>
    /// IUserRepository kế thừa IGenericRepository<User>.
    /// </summary>
    public interface IUserRepository : IGenericRepository<User>
    {
        Task<User> CreateUserWithRoleAsync(User user, string roleName);
        Task<User> CreateStudentWithClassesAsync(User user, int? gradeId, IReadOnlyCollection<int> classIds);
        Task<User?> UpdateUserWithRoleAsync(int id, User updatedUser, string? roleName, bool gradeSpecified = false);
        Task<bool> UpdateStatusAsync(int id, string status);
        Task<bool> DeleteUserAsync(int id);
    }
}

