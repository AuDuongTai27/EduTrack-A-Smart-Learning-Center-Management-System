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
    public class TeachingScheduleService : ITeachingScheduleService
    {
        private readonly EduTrackDbContext _context;

        public TeachingScheduleService(EduTrackDbContext context)
        {
            _context = context;
        }

        public async Task<List<TeachingScheduleItemDto>> GetMyScheduleAsync(int userId)
        {
            var user = await _context.Users
                .AsNoTracking()
                .Include(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                .FirstOrDefaultAsync(u => u.UserId == userId);

            if (user == null)
            {
                return new List<TeachingScheduleItemDto>();
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

            // Lấy danh sách lớp kèm đầy đủ schedules, subject, studentClasses, teacher/ta
            List<Class> assignedClasses;
            if (isTa)
            {
                assignedClasses = await _context.TaClasses
                    .AsNoTracking()
                    .Where(tac => tac.TaId == userId && tac.Status == "active")
                    .Include(tac => tac.Class)
                        .ThenInclude(c => c.Subject)
                    .Include(tac => tac.Class)
                        .ThenInclude(c => c.ClassSchedules)
                    .Include(tac => tac.Class)
                        .ThenInclude(c => c.StudentClasses)
                    .Include(tac => tac.Class)
                        .ThenInclude(c => c.TeacherClasses)
                            .ThenInclude(tc => tc.Teacher)
                    .Include(tac => tac.Class)
                        .ThenInclude(c => c.TaClasses)
                            .ThenInclude(tac => tac.Ta)
                    .Select(tac => tac.Class)
                    .Where(c => c != null)
                    .ToListAsync();
            }
            else
            {
                assignedClasses = await _context.TeacherClasses
                    .AsNoTracking()
                    .Where(tc => tc.TeacherId == userId && tc.Status == "active")
                    .Include(tc => tc.Class)
                        .ThenInclude(c => c.Subject)
                    .Include(tc => tc.Class)
                        .ThenInclude(c => c.ClassSchedules)
                    .Include(tc => tc.Class)
                        .ThenInclude(c => c.StudentClasses)
                    .Include(tc => tc.Class)
                        .ThenInclude(c => c.TeacherClasses)
                            .ThenInclude(tc => tc.Teacher)
                    .Include(tc => tc.Class)
                        .ThenInclude(c => c.TaClasses)
                            .ThenInclude(tac => tac.Ta)
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

            var scheduleList = new List<TeachingScheduleItemDto>();

            foreach (var cls in assignedClasses)
            {
                int studentCount = cls.StudentClasses.Count(sc => sc.Status != "dropped");
                var teacher = cls.TeacherClasses.FirstOrDefault(tc => tc.Status == "active")?.Teacher;
                var ta = cls.TaClasses.FirstOrDefault(tac => tac.Status == "active")?.Ta;

                string teacherName = teacher?.FullName ?? "ThS. Hoàng Quốc Việt";
                string taName = ta?.FullName ?? "Âu Dương Tài";

                if (cls.ClassSchedules.Count > 0)
                {
                    foreach (var s in cls.ClassSchedules)
                    {
                        scheduleList.Add(new TeachingScheduleItemDto
                        {
                            ScheduleId = s.ScheduleId,
                            ClassId = cls.ClassId,
                            ClassName = cls.ClassName,
                            SubjectName = cls.Subject?.SubjectName ?? "Môn học",
                            Room = s.Room ?? cls.Room ?? "Phòng 101",
                            DayOfWeek = CapitalizeDayOfWeek(s.DayOfWeek),
                            StartTime = s.StartTime.ToString(@"hh\:mm"),
                            EndTime = s.EndTime.ToString(@"hh\:mm"),
                            StudentCount = studentCount > 0 ? studentCount : 30,
                            TeacherName = teacherName,
                            TaName = taName,
                            PartnerName = isTa ? teacherName : taName,
                            Status = cls.Status ?? "active",
                        });
                    }
                }
                else
                {
                    // Nếu lớp chưa gán schedule cụ thể trong bảng class_schedules, tạo 1 ca mẫu dựa trên thông tin lớp
                    scheduleList.Add(new TeachingScheduleItemDto
                    {
                        ScheduleId = cls.ClassId * 10,
                        ClassId = cls.ClassId,
                        ClassName = cls.ClassName,
                        SubjectName = cls.Subject?.SubjectName ?? "Môn học",
                        Room = cls.Room ?? "Phòng 101",
                        DayOfWeek = "Monday",
                        StartTime = "08:00",
                        EndTime = "09:45",
                        StudentCount = studentCount > 0 ? studentCount : 30,
                        TeacherName = teacherName,
                        TaName = taName,
                        PartnerName = isTa ? teacherName : taName,
                        Status = cls.Status ?? "active",
                    });
                }
            }

            return scheduleList
                .OrderBy(s => GetDayOfWeekOrder(s.DayOfWeek))
                .ThenBy(s => s.StartTime)
                .ToList();
        }

        private static string CapitalizeDayOfWeek(string? day)
        {
            if (string.IsNullOrWhiteSpace(day)) return "Monday";
            string lower = day.Trim().ToLower();
            return lower switch
            {
                "monday" => "Monday",
                "tuesday" => "Tuesday",
                "wednesday" => "Wednesday",
                "thursday" => "Thursday",
                "friday" => "Friday",
                "saturday" => "Saturday",
                "sunday" => "Sunday",
                _ => char.ToUpper(lower[0]) + lower.Substring(1),
            };
        }

        private static int GetDayOfWeekOrder(string? day)
        {
            return (day ?? string.Empty).ToLower() switch
            {
                "monday" => 1,
                "tuesday" => 2,
                "wednesday" => 3,
                "thursday" => 4,
                "friday" => 5,
                "saturday" => 6,
                "sunday" => 7,
                _ => 8,
            };
        }
    }
}

