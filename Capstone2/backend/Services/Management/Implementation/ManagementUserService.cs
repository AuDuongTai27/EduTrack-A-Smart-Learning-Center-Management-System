using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using EduTrack.API.Models.DTOs;
using EduTrack.API.Models.DTOs.Management;
using EduTrack.API.Models.Entities;
using EduTrack.API.Repositories.Interfaces;
using EduTrack.API.Services.Management.Interfaces;

namespace EduTrack.API.Services.Management.Implementation
{
    public class ManagementUserService : IManagementUserService
    {
        private readonly IUserRepository _userRepository;
        private readonly IParentStudentRepository _parentStudentRepository;

        public ManagementUserService(
            IUserRepository userRepository,
            IParentStudentRepository parentStudentRepository)
        {
            _userRepository = userRepository;
            _parentStudentRepository = parentStudentRepository;
        }

        public async Task<UserDto> CreateUserAsync(CreateUserDto dto)
        {
            var role = string.IsNullOrWhiteSpace(dto.Role) ? "teacher" : dto.Role.Trim().ToLower();
            var prefix = role switch
            {
                "center_manager" => "MGR",
                "admin_staff" => "ADM",
                "teaching_assistant" => "TA",
                "student" => "STU",
                "parent" => "PAR",
                _ => "TEA"
            };

            var userCode = !string.IsNullOrWhiteSpace(dto.UserCode)
                ? dto.UserCode.Trim().ToUpper()
                : role == "parent"
                    ? $"{prefix}{Guid.NewGuid():N}"[..20].ToUpperInvariant()
                    : $"{prefix}{DateTime.UtcNow:MMddHHmm}";

            var user = BuildUser(dto, userCode);
            var subjectGradePairs = dto.SubjectGrades?
                .Select(sg => (sg.SubjectId, (IReadOnlyCollection<int>)(sg.GradeIds ?? new List<int>())))
                .ToList();
            var created = await _userRepository.CreateUserWithRoleAsync(user, role, dto.SubjectIds, dto.GradeIds, subjectGradePairs);
            return MapUserToDto(created);
        }

        public async Task<UserDto> CreateStudentAsync(CreateStudentDto dto)
        {
            if (!string.Equals(dto.Role?.Trim(), "student", StringComparison.OrdinalIgnoreCase))
                throw new ArgumentException("Luồng này chỉ dùng để tạo học sinh.");
            if (string.IsNullOrWhiteSpace(dto.UserCode) || dto.UserCode.Trim().Length > 20)
                throw new ArgumentException("Thiếu mã yêu cầu tạo học sinh hợp lệ. Vui lòng mở lại form.");
            if (string.IsNullOrWhiteSpace(dto.FullName))
                throw new ArgumentException("Họ và tên là bắt buộc.");
            if (dto.ClassIds == null)
                throw new ArgumentException("Danh sách lớp không hợp lệ.");
            var user = BuildUser(dto, dto.UserCode.Trim().ToUpperInvariant());
            user.GradeId = dto.GradeId;
            var created = await _userRepository.CreateStudentWithClassesAsync(user, dto.GradeId, dto.ClassIds);
            return MapUserToDto(created);
        }

        private static User BuildUser(CreateUserDto dto, string userCode)
        {
            return new User
            {
                UserCode = userCode,
                FullName = dto.FullName.Trim(),
                Email = dto.Email?.Trim(),
                Phone = dto.Phone?.Trim(),
                PasswordHash = "$2a$11$N87b.lQp8p9m0Yl4w1e5xe4RzO.B1hO.3r0f7a2.b3c4d5e6f7g8h",
                AvatarUrl = $"https://api.dicebear.com/7.x/avataaars/svg?seed={userCode}",
                Gender = dto.Gender?.Trim() ?? "other",
                Specialty = dto.Specialty?.Trim(),
                Status = "active",
                CreatedAt = DateTime.UtcNow,
                EnrolledSince = DateTime.UtcNow
            };

        }

        public async Task<UserDto?> UpdateUserAsync(int id, UpdateUserDto dto)
        {
            var updatedUser = new User
            {
                FullName = dto.FullName.Trim(),
                Email = dto.Email?.Trim(),
                Phone = dto.Phone?.Trim(),
                Specialty = dto.Specialty?.Trim(),
                Gender = dto.Gender?.Trim(),
                GradeId = dto.GradeId,
                Status = dto.Status?.Trim() ?? "active"
            };

            var subjectGradePairs = dto.SubjectGrades?
                .Select(sg => (sg.SubjectId, (IReadOnlyCollection<int>)(sg.GradeIds ?? new List<int>())))
                .ToList();

            var result = await _userRepository.UpdateUserWithRoleAsync(
                id,
                updatedUser,
                dto.Role?.Trim().ToLower(),
                dto.GradeSpecified,
                dto.SubjectIds,
                dto.SubjectsSpecified,
                dto.GradeIds,
                dto.GradesSpecified,
                subjectGradePairs,
                dto.SubjectGradesSpecified);
            return result == null ? null : MapUserToDto(result);
        }

        public async Task<bool> UpdateStatusAsync(int id, string status)
        {
            return await _userRepository.UpdateStatusAsync(id, status.Trim().ToLower());
        }

        public async Task<bool> DeleteUserAsync(int id)
        {
            return await _userRepository.DeleteUserAsync(id);
        }

        public async Task<ParentStudentDto> AssignParentStudentAsync(AssignParentStudentDto dto)
        {
            if (dto.ParentId <= 0 || dto.StudentId <= 0 || dto.ParentId == dto.StudentId)
                throw new ArgumentException("Vui lòng chọn đầy đủ phụ huynh và học sinh hợp lệ.");
            if (string.IsNullOrWhiteSpace(dto.Relationship))
                throw new ArgumentException("Vui lòng chọn mối quan hệ.");
            var entity = new ParentStudent
            {
                ParentId = dto.ParentId,
                StudentId = dto.StudentId,
                Relationship = string.IsNullOrWhiteSpace(dto.Relationship) ? "Parent" : dto.Relationship.Trim(),
                IsPrimaryContact = dto.IsPrimaryContact,
                CreatedAt = DateTime.UtcNow
            };

            var saved = await _parentStudentRepository.AssignAsync(entity, dto.UpdateExisting,
                preserveRelationship: dto.UpdateExisting && !dto.RelationshipSpecified,
                preservePrimaryContact: dto.UpdateExisting && !dto.PrimaryContactSpecified);
            return new ParentStudentDto
            {
                ParentId = saved.ParentId,
                ParentName = saved.Parent?.FullName ?? string.Empty,
                ParentPhone = saved.Parent?.Phone ?? string.Empty,
                ParentEmail = saved.Parent?.Email ?? string.Empty,
                StudentId = saved.StudentId,
                StudentName = saved.Student?.FullName ?? string.Empty,
                StudentCode = saved.Student?.UserCode ?? string.Empty,
                Relationship = saved.Relationship,
                IsPrimaryContact = saved.IsPrimaryContact,
                CreatedAt = saved.CreatedAt
            };
        }

        public async Task<bool> RemoveParentStudentAsync(int parentId, int studentId)
        {
            return await _parentStudentRepository.RemoveAsync(parentId, studentId);
        }

        private static UserDto MapUserToDto(User u)
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
