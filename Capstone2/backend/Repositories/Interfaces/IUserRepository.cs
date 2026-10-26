using EduTrack.API.Models.Entities;

namespace EduTrack.API.Repositories.Interfaces
{
    /// <summary>
    /// IUserRepository kế thừa IGenericRepository<User>.
    /// </summary>
    public interface IUserRepository : IGenericRepository<User>
    {
        Task<User> CreateUserWithRoleAsync(User user, string roleName);
        Task<User?> UpdateUserWithRoleAsync(int id, User updatedUser, string? roleName);
        Task<bool> UpdateStatusAsync(int id, string status);
        Task<bool> DeleteUserAsync(int id);
    }
}

