using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using EduTrack.API.Models.DTOs;
using EduTrack.API.Models.Entities;
using EduTrack.API.Repositories.Interfaces;
using EduTrack.API.Services.Interfaces;

namespace EduTrack.API.Services.Implementation
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _userRepository;

        public UserService(IUserRepository userRepository)
        {
            _userRepository = userRepository;
        }

        public async Task<IEnumerable<UserDto>> GetAllUsersAsync()
        {
            var users = await _userRepository.GetAllAsync();
            return users.Select(MapToDto);
        }

        public async Task<UserDto?> GetUserByIdAsync(int id)
        {
            var user = await _userRepository.GetByIdAsync(id);
            return user == null ? null : MapToDto(user);
        }

        private static UserDto MapToDto(User u)
        {
            var orderedSubjects = u.UserSubjects?
                .Where(us => us.Subject != null)
                .OrderBy(us => us.SubjectId)
                .Select(us => us.Subject)
                .ToList() ?? new List<Subject>();

            var orderedGrades = u.UserGrades?
                .Where(ug => ug.Grade != null)
                .OrderBy(ug => ug.GradeId)
                .Select(ug => ug.Grade)
                .ToList() ?? new List<Grade>();

            return new UserDto
            {
                UserId = u.UserId,
                UserCode = u.UserCode,
                FullName = u.FullName,
                Email = u.Email,
                Phone = u.Phone,
                AvatarUrl = u.AvatarUrl,
                DateOfBirth = u.DateOfBirth,
                Gender = u.Gender,
                Specialty = u.Specialty,
                GradeId = u.GradeId,
                GradeName = u.Grade?.GradeName,
                SubjectIds = orderedSubjects.Select(s => s.SubjectId).ToList(),
                SubjectNames = orderedSubjects.Select(s => s.SubjectName).ToList(),
                GradeIds = orderedGrades.Select(g => g.GradeId).ToList(),
                GradeNames = orderedGrades.Select(g => g.GradeName).ToList(),
                EnrolledSince = u.EnrolledSince,
                Status = u.Status,
                CreatedAt = u.CreatedAt,
                Roles = u.UserRoles?.Where(ur => ur.Role != null).Select(ur => ur.Role.RoleName).ToList() ?? new List<string>()
            };
        }
    }
}
