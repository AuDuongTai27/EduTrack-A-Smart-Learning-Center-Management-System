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
            var created = await _userRepository.CreateUserWithRoleAsync(user, role);
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

            var result = await _userRepository.UpdateUserWithRoleAsync(id, updatedUser, dto.Role?.Trim().ToLower(), dto.GradeSpecified);
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
                EnrolledSince = u.EnrolledSince,
                Status = u.Status,
                CreatedAt = u.CreatedAt,
                Roles = u.UserRoles?.Where(ur => ur.Role != null).Select(ur => ur.Role.RoleName).ToList() ?? new List<string>()
            };
        }
    }
}
