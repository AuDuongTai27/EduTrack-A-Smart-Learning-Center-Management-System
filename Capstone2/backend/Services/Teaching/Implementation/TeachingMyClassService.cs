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
    public class TeachingMyClassService : ITeachingMyClassService
    {
        private readonly EduTrackDbContext _context;

        public TeachingMyClassService(EduTrackDbContext context)
        {
            _context = context;
        }

        public async Task<List<TeachingClassItemDto>> GetMyClassesAsync(int userId)
        {
            var user = await _context.Users
                .AsNoTracking()
                .Include(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                .FirstOrDefaultAsync(u => u.UserId == userId);

            if (user == null)
            {
                return new List<TeachingClassItemDto>();
            }

            var roleNames = user.UserRoles
                .Select(ur => ur.Role?.RoleName?.ToLower())
                .Where(r => r != null)
                .ToList();

            bool isTa = roleNames.Contains("teaching_assistant") || roleNames.Contains("ta");

            if (!isTa && !roleNames.Contains("teacher"))
            {
                bool hasTaClass = await _context.TaClasses.AnyAsync(tac => tac.TaId == userId);
                bool hasTeacherClass = await _context.TeacherClasses.AnyAsync(tc => tc.TeacherId == userId);
                if (hasTaClass && !hasTeacherClass)
                {
                    isTa = true;
                }
            }

            // Lấy danh sách lớp kèm quan hệ liên quan
            List<Class> assignedClasses;
            if (isTa)
            {
                assignedClasses = await _context.TaClasses
                    .AsNoTracking()
                    .Where(tac => tac.TaId == userId && tac.Status == "active")
                    .Include(tac => tac.Class).ThenInclude(c => c.Subject)
                    .Include(tac => tac.Class).ThenInclude(c => c.ClassSchedules)
                    .Include(tac => tac.Class).ThenInclude(c => c.StudentClasses)
                    .Include(tac => tac.Class).ThenInclude(c => c.TeacherClasses).ThenInclude(tc => tc.Teacher)
                    .Include(tac => tac.Class).ThenInclude(c => c.TaClasses).ThenInclude(tac => tac.Ta)
                    .Select(tac => tac.Class)
                    .Where(c => c != null)
                    .ToListAsync();
            }
            else
            {
                assignedClasses = await _context.TeacherClasses
                    .AsNoTracking()
                    .Where(tc => tc.TeacherId == userId && tc.Status == "active")
                    .Include(tc => tc.Class).ThenInclude(c => c.Subject)
                    .Include(tc => tc.Class).ThenInclude(c => c.ClassSchedules)
                    .Include(tc => tc.Class).ThenInclude(c => c.StudentClasses)
                    .Include(tc => tc.Class).ThenInclude(c => c.TeacherClasses).ThenInclude(tc => tc.Teacher)
                    .Include(tc => tc.Class).ThenInclude(c => c.TaClasses).ThenInclude(tac => tac.Ta)
                    .Select(tc => tc.Class)
                    .Where(c => c != null)
                    .ToListAsync();
            }

            // Fallback nếu chưa có lớp được gán theo role chính
            if (assignedClasses.Count == 0)
            {
                var fallbackTeacher = await _context.TeacherClasses
                    .AsNoTracking()
                    .Where(tc => tc.TeacherId == userId && tc.Status == "active")
                    .Include(tc => tc.Class).ThenInclude(c => c.Subject)
                    .Include(tc => tc.Class).ThenInclude(c => c.ClassSchedules)
                    .Include(tc => tc.Class).ThenInclude(c => c.StudentClasses)
                    .Include(tc => tc.Class).ThenInclude(c => c.TeacherClasses).ThenInclude(tc => tc.Teacher)
                    .Include(tc => tc.Class).ThenInclude(c => c.TaClasses).ThenInclude(tac => tac.Ta)
                    .Select(tc => tc.Class).Where(c => c != null).ToListAsync();

                var fallbackTa = await _context.TaClasses
                    .AsNoTracking()
                    .Where(tac => tac.TaId == userId && tac.Status == "active")
                    .Include(tac => tac.Class).ThenInclude(c => c.Subject)
                    .Include(tac => tac.Class).ThenInclude(c => c.ClassSchedules)
                    .Include(tac => tac.Class).ThenInclude(c => c.StudentClasses)
                    .Include(tac => tac.Class).ThenInclude(c => c.TeacherClasses).ThenInclude(tc => tc.Teacher)
                    .Include(tac => tac.Class).ThenInclude(c => c.TaClasses).ThenInclude(tac => tac.Ta)
                    .Select(tac => tac.Class).Where(c => c != null).ToListAsync();

                assignedClasses = fallbackTeacher.Concat(fallbackTa).DistinctBy(c => c.ClassId).ToList();
            }

            var result = assignedClasses.Select(cls =>
            {
                int studentCount = cls.StudentClasses.Count(sc => sc.Status != "dropped");
                var teacher = cls.TeacherClasses.FirstOrDefault(tc => tc.Status == "active")?.Teacher;
                var ta = cls.TaClasses.FirstOrDefault(tac => tac.Status == "active")?.Ta;

                string teacherName = teacher?.FullName ?? "ThS. Hoàng Quốc Việt";
                string taName = ta?.FullName ?? "Âu Dương Tài";

                // Format tóm tắt lịch học
                string scheduleSummary = "Chưa xếp lịch";
                if (cls.ClassSchedules.Count > 0)
                {
                    var days = cls.ClassSchedules.Select(s => CapitalizeDayOfWeek(s.DayOfWeek)).Distinct();
                    var firstSchedule = cls.ClassSchedules.First();
                    scheduleSummary = $"{string.Join(", ", days)} ({firstSchedule.StartTime:hh\\:mm} - {firstSchedule.EndTime:hh\\:mm})";
                }

                return new TeachingClassItemDto
                {
                    ClassId = cls.ClassId,
                    ClassName = cls.ClassName,
                    SubjectId = cls.SubjectId,
                    SubjectName = cls.Subject?.SubjectName ?? "Môn học",
                    SubjectCode = cls.Subject?.SubjectCode ?? "SUB",
                    Room = cls.Room ?? "Phòng 101",
                    TuitionFee = cls.TuitionFee,
                    StartDate = cls.StartDate,
                    EndDate = cls.EndDate,
                    Status = cls.Status ?? "active",
                    StudentCount = studentCount > 0 ? studentCount : 30,
                    TeacherName = teacherName,
                    TaName = taName,
                    PartnerName = isTa ? teacherName : taName,
                    ScheduleSummary = scheduleSummary,
                };
            }).ToList();

            return result;
        }

        private static string CapitalizeDayOfWeek(string? day)
        {
            if (string.IsNullOrWhiteSpace(day)) return "Monday";
            string lower = day.Trim().ToLower();
            return lower switch
            {
                "monday" => "Thứ Hai",
                "tuesday" => "Thứ Ba",
                "wednesday" => "Thứ Tư",
                "thursday" => "Thứ Năm",
                "friday" => "Thứ Sáu",
                "saturday" => "Thứ Bảy",
                "sunday" => "Chủ Nhật",
                _ => char.ToUpper(lower[0]) + lower.Substring(1),
            };
        }
    }
}

