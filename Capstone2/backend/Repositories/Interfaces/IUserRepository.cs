using EduTrack.API.Models.Entities;

namespace EduTrack.API.Repositories.Interfaces
{
    /// <summary>
    /// IUserRepository kế thừa IGenericRepository<User>.
    /// </summary>
    public interface IUserRepository : IGenericRepository<User>
    {
        Task<User> CreateUserWithRoleAsync(
            User user,
            string roleName,
            IReadOnlyCollection<int>? subjectIds = null,
            IReadOnlyCollection<int>? gradeIds = null,
            IReadOnlyCollection<(int SubjectId, IReadOnlyCollection<int> GradeIds)>? subjectGrades = null,
            IReadOnlyCollection<string>? roleNames = null);
        Task<User> CreateStudentWithClassesAsync(User user, int? gradeId, IReadOnlyCollection<int> classIds);
        Task<User?> UpdateUserWithRoleAsync(
            int id,
            User updatedUser,
            string? roleName,
            bool gradeSpecified = false,
            IReadOnlyCollection<int>? subjectIds = null,
            bool subjectsSpecified = false,
            IReadOnlyCollection<int>? gradeIds = null,
            bool gradesSpecified = false,
            IReadOnlyCollection<(int SubjectId, IReadOnlyCollection<int> GradeIds)>? subjectGrades = null,
            bool subjectGradesSpecified = false,
            IReadOnlyCollection<string>? roleNames = null);
        Task<bool> UpdateStatusAsync(int id, string status);
        Task<bool> DeleteUserAsync(int id);
    }
}

