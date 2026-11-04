using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using EduTrack.API.Models.DTOs.Teaching;
using EduTrack.API.Models.EF;
using EduTrack.API.Models.Entities;
using EduTrack.API.Services.Teaching.Interfaces;

namespace EduTrack.API.Services.Teaching.Implementation
{
    public class TeachingProfileService : ITeachingProfileService
    {
        private readonly EduTrackDbContext _context;

        public TeachingProfileService(EduTrackDbContext context)
        {
            _context = context;
        }

        public async Task<TeacherProfileDto?> GetProfileAsync(int userId)
        {
            var user = await _context.Users
                .AsNoTracking()
                .Include(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                .Include(u => u.TeacherClasses)
                .Include(u => u.TaClasses)
                .FirstOrDefaultAsync(u => u.UserId == userId);

            if (user == null)
            {
                return null;
            }

            return await MapUserToProfileDtoAsync(user);
        }

        public async Task<TeacherProfileDto?> UpdateProfileAsync(int userId, UpdateTeacherProfileRequestDto request)
        {
            var user = await _context.Users
                .Include(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                .Include(u => u.TeacherClasses)
                .Include(u => u.TaClasses)
                .FirstOrDefaultAsync(u => u.UserId == userId);

            if (user == null)
            {
                return null;
            }

            if (!string.IsNullOrWhiteSpace(request.FullName))
            {
                user.FullName = request.FullName.Trim();
            }

            if (!string.IsNullOrWhiteSpace(request.Email))
            {
                user.Email = request.Email.Trim();
            }

            if (!string.IsNullOrWhiteSpace(request.Phone))
            {
                user.Phone = request.Phone.Trim();
            }

            if (!string.IsNullOrWhiteSpace(request.DateOfBirth) &&
                DateTime.TryParse(request.DateOfBirth, out var parsedDob))
            {
                user.DateOfBirth = parsedDob;
            }

            if (!string.IsNullOrWhiteSpace(request.Gender))
            {
                var g = request.Gender.Trim().ToLowerInvariant();
                if (g == "nữ" || g == "female") user.Gender = "female";
                else if (g == "khác" || g == "other") user.Gender = "other";
                else user.Gender = "male";
            }

            if (!string.IsNullOrWhiteSpace(request.Specialty))
            {
                user.Specialty = request.Specialty.Trim();
            }

            if (!string.IsNullOrWhiteSpace(request.AvatarUrl) && request.AvatarUrl.Length <= 500)
            {
                user.AvatarUrl = request.AvatarUrl.Trim();
            }

            await _context.SaveChangesAsync();
            return await MapUserToProfileDtoAsync(user);
        }

        public async Task<(bool Success, string Message)> ChangePasswordAsync(int userId, ChangePasswordRequestDto request)
        {
            if (request == null)
            {
                return (false, "Dữ liệu yêu cầu không hợp lệ.");
            }

            if (string.IsNullOrWhiteSpace(request.CurrentPassword))
            {
                return (false, "Vui lòng nhập mật khẩu hiện tại.");
            }

            if (string.IsNullOrWhiteSpace(request.NewPassword) || request.NewPassword.Length < 6)
            {
                return (false, "Mật khẩu mới phải có ít nhất 6 ký tự.");
            }

            if (request.NewPassword != request.ConfirmPassword)
            {
                return (false, "Xác nhận mật khẩu mới không trùng khớp.");
            }

            if (request.CurrentPassword == request.NewPassword)
            {
                return (false, "Mật khẩu mới không được trùng với mật khẩu hiện tại.");
            }

            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == userId);
            if (user == null)
            {
                return (false, $"Không tìm thấy người dùng ID = {userId}.");
            }

            // Lưu mật khẩu mới (trong DB seed dùng chuỗi hash/mock)
            user.PasswordHash = request.NewPassword.Trim();
            await _context.SaveChangesAsync();

            return (true, "Đổi mật khẩu thành công!");
        }

        private async Task<TeacherProfileDto> MapUserToProfileDtoAsync(User user)
        {
            var roleNames = user.UserRoles
                .Select(ur => ur.Role?.RoleName?.ToLower())
                .Where(r => r != null)
                .ToList();

            bool isTa = roleNames.Contains("teaching_assistant") || roleNames.Contains("ta");
            if (!isTa && !roleNames.Contains("teacher"))
            {
                bool hasTaClass = await _context.TaClasses.AnyAsync(tac => tac.TaId == user.UserId);
                bool hasTeacherClass = await _context.TeacherClasses.AnyAsync(tc => tc.TeacherId == user.UserId);
                if (hasTaClass && !hasTeacherClass)
                {
                    isTa = true;
                }
            }

            // Đếm số lớp phụ trách
            int activeClassesCount = isTa
                ? await _context.TaClasses.CountAsync(tac => tac.TaId == user.UserId && tac.Status == "active")
                : await _context.TeacherClasses.CountAsync(tc => tc.TeacherId == user.UserId && tc.Status == "active");

            // Lấy danh sách ID lớp phụ trách để đếm tổng số học sinh
            var classIds = isTa
                ? await _context.TaClasses.Where(tac => tac.TaId == user.UserId && tac.Status == "active").Select(tac => tac.ClassId).ToListAsync()
                : await _context.TeacherClasses.Where(tc => tc.TeacherId == user.UserId && tc.Status == "active").Select(tc => tc.ClassId).ToListAsync();

            int totalStudents = 0;
            if (classIds.Count > 0)
            {
                totalStudents = await _context.StudentClasses
                    .Where(sc => classIds.Contains(sc.ClassId) && sc.Status != "dropped")
                    .Select(sc => sc.StudentId)
                    .Distinct()
                    .CountAsync();
            }

            string dobFormatted = user.DateOfBirth.HasValue
                ? user.DateOfBirth.Value.ToString("yyyy-MM-dd")
                : (isTa ? "1998-05-15" : "1990-11-10");

            string enrolledFormatted = user.EnrolledSince.HasValue
                ? user.EnrolledSince.Value.ToString("dd/MM/yyyy")
                : user.CreatedAt.ToString("dd/MM/yyyy");

            string genderLabel = (user.Gender ?? "male").ToLower() switch
            {
                "female" => "Nữ",
                "other" => "Khác",
                _ => "Nam"
            };

            string defaultSpecialty = isTa ? "Trợ giảng Toán & Khoa học" : "Toán học & Luyện thi";

            return new TeacherProfileDto
            {
                UserId = user.UserId,
                UserCode = user.UserCode,
                FullName = user.FullName,
                Email = user.Email ?? string.Empty,
                Phone = user.Phone ?? string.Empty,
                DateOfBirth = dobFormatted,
                Gender = genderLabel,
                EnrolledSince = enrolledFormatted,
                Specialty = !string.IsNullOrWhiteSpace(user.Specialty) ? user.Specialty : defaultSpecialty,
                AvatarUrl = !string.IsNullOrWhiteSpace(user.AvatarUrl) ? user.AvatarUrl : "/assets/img/profiles/avatar-27.jpg",
                Address = "123 Nguyễn Văn Cừ, Quận 5, TP. Hồ Chí Minh",
                RoleTitle = isTa ? "Trợ giảng chuyên môn" : "Giáo viên chuyên môn",
                Role = isTa ? "teaching_assistant" : "teacher",
                ActiveClassesCount = activeClassesCount > 0 ? activeClassesCount : (isTa ? 3 : 2),
                TotalStudentsCount = totalStudents > 0 ? totalStudents : (isTa ? 50 : 35)
            };
        }
    }
}
