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

            var subjectGrades = (u.UserSubjectGrades ?? Enumerable.Empty<UserSubjectGrade>())
                .Where(usg => usg.Subject != null)
                .GroupBy(usg => new { usg.SubjectId, usg.Subject.SubjectName })
                .OrderBy(g => g.Key.SubjectId)
                .Select(g =>
                {
                    var grades = g.Where(x => x.Grade != null)
                                  .Select(x => x.Grade)
                                  .GroupBy(gr => gr.GradeId)
                                  .Select(gr => gr.First())
                                  .OrderBy(gr => gr.GradeId)
                                  .ToList();
                    return new UserSpecialtyGroupDto
                    {
                        SubjectId = g.Key.SubjectId,
                        SubjectName = g.Key.SubjectName,
                        GradeIds = grades.Select(gr => gr.GradeId).ToList(),
                        GradeNames = grades.Select(gr => gr.GradeName).ToList()
                    };
                })
                .ToList();

            if (subjectGrades.Count == 0 && orderedSubjects.Count > 0)
            {
                subjectGrades = orderedSubjects.Select(s => new UserSpecialtyGroupDto
                {
                    SubjectId = s.SubjectId,
                    SubjectName = s.SubjectName,
                    GradeIds = orderedGrades.Select(gr => gr.GradeId).ToList(),
                    GradeNames = orderedGrades.Select(gr => gr.GradeName).ToList()
                }).ToList();
            }

            var finalSubjectIds = orderedSubjects.Count > 0
                ? orderedSubjects.Select(s => s.SubjectId).ToList()
                : subjectGrades.Select(sg => sg.SubjectId).ToList();
            var finalSubjectNames = orderedSubjects.Count > 0
                ? orderedSubjects.Select(s => s.SubjectName).ToList()
                : subjectGrades.Select(sg => sg.SubjectName).ToList();
            var finalGradeIds = orderedGrades.Count > 0
                ? orderedGrades.Select(g => g.GradeId).ToList()
                : subjectGrades.SelectMany(sg => sg.GradeIds).Distinct().OrderBy(id => id).ToList();
            var finalGradeNames = orderedGrades.Count > 0
                ? orderedGrades.Select(g => g.GradeName).ToList()
                : subjectGrades.SelectMany(sg => sg.GradeIds.Zip(sg.GradeNames, (id, name) => new { id, name }))
                    .GroupBy(x => x.id)
                    .OrderBy(g => g.Key)
                    .Select(g => g.First().name)
                    .ToList();

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
                SubjectGrades = subjectGrades,
                SubjectIds = finalSubjectIds,
                SubjectNames = finalSubjectNames,
                GradeIds = finalGradeIds,
                GradeNames = finalGradeNames,
                EnrolledSince = u.EnrolledSince,
                Status = u.Status,
                CreatedAt = u.CreatedAt,
                Roles = u.UserRoles?.Where(ur => ur.Role != null).Select(ur => ur.Role.RoleName).ToList() ?? new List<string>()
            };
        }
    }
}
