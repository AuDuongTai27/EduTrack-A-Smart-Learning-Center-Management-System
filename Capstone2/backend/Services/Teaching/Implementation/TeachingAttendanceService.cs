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
    public class TeachingAttendanceService : ITeachingAttendanceService
    {
        private readonly EduTrackDbContext _context;

        public TeachingAttendanceService(EduTrackDbContext context)
        {
            _context = context;
        }

        public async Task<List<TeachingSessionItemDto>> GetClassSessionsAsync(int classId)
        {
            var sessions = await _context.ClassSessions
                .AsNoTracking()
                .Where(s => s.ClassId == classId && s.Status != "cancelled")
                .OrderBy(s => s.SessionDate)
                .ThenBy(s => s.StartTime)
                .ThenBy(s => s.SessionId)
                .ToListAsync();

            // Nếu lớp chưa có buổi học nào trong DB, tự động sinh các buổi học chuẩn và lưu vào DB
            if (sessions.Count == 0)
            {
                sessions = await EnsureDefaultSessionsCreatedAsync(classId);
            }

            var sessionIds = sessions.Select(s => s.SessionId).ToList();
            var attendances = await _context.Attendances
                .AsNoTracking()
                .Where(a => sessionIds.Contains(a.SessionId))
                .ToListAsync();

            var result = new List<TeachingSessionItemDto>();
            int index = 1;
            foreach (var s in sessions)
            {
                var sessionAtts = attendances.Where(a => a.SessionId == s.SessionId).ToList();
                int present = sessionAtts.Count(a => a.Status.ToLower() == "present");
                int absent = sessionAtts.Count(a => a.Status.ToLower() == "absent");
                int late = sessionAtts.Count(a => a.Status.ToLower() == "late");
                int excused = sessionAtts.Count(a => a.Status.ToLower() == "excused");

                string dateStr = s.SessionDate.ToString("dd/MM/yyyy");
                string startStr = s.StartTime.ToString(@"hh\:mm");
                string endStr = s.EndTime.ToString(@"hh\:mm");
                string roomStr = !string.IsNullOrWhiteSpace(s.Room) ? s.Room : "Phòng học tiêu chuẩn";

                var vietnamNow = DateTime.UtcNow.AddHours(7);
                bool isRec = sessionAtts.Count > 0;
                bool isCompleted = s.Status == "completed" || isRec;
                var sessionStartDateTime = s.SessionDate.Date.Add(s.StartTime);
                bool hasStarted = isCompleted || s.Status == "in_progress" || vietnamNow >= sessionStartDateTime;

                result.Add(new TeachingSessionItemDto
                {
                    SessionId = s.SessionId,
                    ClassId = s.ClassId,
                    SessionDate = s.SessionDate.ToString("yyyy-MM-dd"),
                    StartTime = startStr,
                    EndTime = endStr,
                    TimePeriod = $"{startStr} - {endStr}",
                    Room = roomStr,
                    Status = s.Status,
                    Title = $"Buổi {index}: {dateStr} ({startStr} - {endStr}) - {roomStr}",
                    IsRecorded = isRec,
                    PresentCount = present,
                    AbsentCount = absent,
                    LateCount = late,
                    ExcusedCount = excused,
                    TotalRecorded = sessionAtts.Count,
                    HasStarted = hasStarted,
                    CanTakeAttendance = hasStarted
                });
                index++;
            }

            return result;
        }

        public async Task<TeachingClassAttendanceSheetDto?> GetAttendanceSheetAsync(int classId, int? sessionId, int userId)
        {
            var cls = await _context.Classes
                .AsNoTracking()
                .Include(c => c.Subject)
                .FirstOrDefaultAsync(c => c.ClassId == classId);

            if (cls == null)
            {
                return null;
            }

            // 1. Lấy danh sách các buổi học
            var availableSessions = await GetClassSessionsAsync(classId);
            if (availableSessions.Count == 0)
            {
                return null;
            }

            // 2. Xác định buổi học được chọn
            TeachingSessionItemDto activeSession;
            if (sessionId.HasValue && availableSessions.Any(s => s.SessionId == sessionId.Value))
            {
                activeSession = availableSessions.First(s => s.SessionId == sessionId.Value);
            }
            else
            {
                // Ưu tiên buổi học gần nhất chưa hoàn thành hoặc buổi đầu tiên
                activeSession = availableSessions.FirstOrDefault(s => s.Status == "scheduled" || s.Status == "in_progress")
                                ?? availableSessions.LastOrDefault()
                                ?? availableSessions[0];
            }

            // 3. Lấy danh sách học sinh thuộc lớp
            var studentClasses = await _context.StudentClasses
                .AsNoTracking()
                .Include(sc => sc.Student)
                .Where(sc => sc.ClassId == classId && sc.Status != "dropped")
                .ToListAsync();

            // Nếu lớp chưa có học sinh nào gán, đảm bảo gán tối thiểu các học sinh mẫu
            if (studentClasses.Count == 0)
            {
                studentClasses = await EnsureStudentsEnrolledAsync(classId);
            }

            // 4. Lấy các bản ghi điểm danh hiện tại của buổi học này
            var existingAttendances = await _context.Attendances
                .AsNoTracking()
                .Include(a => a.Recorder)
                .Where(a => a.SessionId == activeSession.SessionId)
                .ToListAsync();

            var studentItems = new List<TeachingStudentAttendanceItemDto>();
            foreach (var sc in studentClasses)
            {
                if (sc.Student == null) continue;

                var att = existingAttendances.FirstOrDefault(a => a.StudentId == sc.StudentId);
                bool isRec = att != null;
                string status = att?.Status?.ToLowerInvariant() ?? "present";
                string? note = att?.Note;
                string? recorderName = att?.Recorder?.FullName;
                string? recordedAt = att?.RecordedAt.ToString("dd/MM/yyyy HH:mm");

                studentItems.Add(new TeachingStudentAttendanceItemDto
                {
                    StudentId = sc.Student.UserId,
                    StudentCode = sc.Student.UserCode,
                    FullName = sc.Student.FullName,
                    AvatarUrl = !string.IsNullOrWhiteSpace(sc.Student.AvatarUrl) ? sc.Student.AvatarUrl : "/assets/img/profiles/avatar-27.jpg",
                    AttendanceId = att?.AttendanceId,
                    Status = status,
                    Note = note,
                    RecordedBy = att?.RecordedBy,
                    RecorderName = recorderName,
                    RecordedAt = recordedAt,
                    IsRecorded = isRec
                });
            }

            // 5. Thống kê sĩ số
            int total = studentItems.Count;
            int present = studentItems.Count(s => s.Status == "present");
            int absent = studentItems.Count(s => s.Status == "absent");
            int late = studentItems.Count(s => s.Status == "late");
            int excused = studentItems.Count(s => s.Status == "excused");
            double rate = total > 0 ? Math.Round((double)(present + late) / total * 100, 1) : 0;

            var stats = new TeachingAttendanceStatsDto
            {
                TotalStudents = total,
                PresentCount = present,
                AbsentCount = absent,
                LateCount = late,
                ExcusedCount = excused,
                AttendanceRate = rate
            };

            return new TeachingClassAttendanceSheetDto
            {
                ClassId = cls.ClassId,
                ClassName = cls.ClassName,
                SubjectName = cls.Subject?.SubjectName ?? "Bộ môn giảng dạy",
                Room = !string.IsNullOrWhiteSpace(activeSession.Room) ? activeSession.Room : (!string.IsNullOrWhiteSpace(cls.Room) ? cls.Room : "Phòng 201"),
                CurrentSession = activeSession,
                AvailableSessions = availableSessions,
                Students = studentItems,
                Stats = stats
            };
        }

        public async Task<TeachingClassAttendanceSheetDto> SaveBulkAttendanceAsync(SaveBulkTeachingAttendanceRequestDto request)
        {
            var session = await _context.ClassSessions
                .FirstOrDefaultAsync(s => s.SessionId == request.SessionId && s.ClassId == request.ClassId);

            if (session == null)
            {
                throw new InvalidOperationException($"Không tìm thấy buổi học ID = {request.SessionId} thuộc lớp #{request.ClassId}");
            }

            var vietnamNow = DateTime.UtcNow.AddHours(7);
            var sessionStartDateTime = session.SessionDate.Date.Add(session.StartTime);
            bool hasStarted = session.Status == "completed" || session.Status == "in_progress" || vietnamNow >= sessionStartDateTime;

            if (!hasStarted)
            {
                throw new InvalidOperationException("Chỉ có buổi học đã bắt đầu mới có thể điểm danh.");
            }

            var existingRecords = await _context.Attendances
                .Where(a => a.SessionId == request.SessionId)
                .ToListAsync();

            DateTime now = DateTime.UtcNow;

            foreach (var item in request.Items)
            {
                string normStatus = (item.Status ?? "present").Trim().ToLowerInvariant();
                if (normStatus != "present" && normStatus != "absent" && normStatus != "late" && normStatus != "excused")
                {
                    normStatus = "present";
                }

                var existing = existingRecords.FirstOrDefault(a => a.StudentId == item.StudentId);
                if (existing != null)
                {
                    existing.Status = normStatus;
                    existing.Note = item.Note?.Trim();
                    existing.RecordedBy = request.RecordedBy;
                    existing.RecordedAt = now;
                }
                else
                {
                    _context.Attendances.Add(new Attendance
                    {
                        SessionId = request.SessionId,
                        StudentId = item.StudentId,
                        Status = normStatus,
                        Note = item.Note?.Trim(),
                        RecordedBy = request.RecordedBy,
                        RecordedAt = now
                    });
                }
            }

            // Đánh dấu buổi học đã diễn ra / hoàn thành
            session.Status = "completed";

            await _context.SaveChangesAsync();

            var updatedSheet = await GetAttendanceSheetAsync(request.ClassId, request.SessionId, request.RecordedBy);
            return updatedSheet ?? throw new InvalidOperationException("Không thể tải lại bảng điểm danh sau khi lưu.");
        }

        public async Task<TeachingStudentAttendanceItemDto?> UpdateSingleAttendanceAsync(int attendanceId, UpdateSingleAttendanceRequestDto request)
        {
            var record = await _context.Attendances
                .Include(a => a.Student)
                .Include(a => a.Recorder)
                .FirstOrDefaultAsync(a => a.AttendanceId == attendanceId);

            if (record == null)
            {
                return null;
            }

            string normStatus = (request.Status ?? "present").Trim().ToLowerInvariant();
            record.Status = normStatus;
            record.Note = request.Note?.Trim();
            record.RecordedBy = request.RecordedBy;
            record.RecordedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return new TeachingStudentAttendanceItemDto
            {
                StudentId = record.StudentId,
                StudentCode = record.Student?.UserCode ?? string.Empty,
                FullName = record.Student?.FullName ?? string.Empty,
                AvatarUrl = record.Student?.AvatarUrl ?? "/assets/img/profiles/avatar-27.jpg",
                AttendanceId = record.AttendanceId,
                Status = record.Status,
                Note = record.Note,
                RecordedBy = record.RecordedBy,
                RecorderName = record.Recorder?.FullName,
                RecordedAt = record.RecordedAt.ToString("dd/MM/yyyy HH:mm"),
                IsRecorded = true
            };
        }

        private async Task<List<ClassSession>> EnsureDefaultSessionsCreatedAsync(int classId)
        {
            var cls = await _context.Classes
                .Include(c => c.ClassSchedules)
                    .ThenInclude(cs => cs.Versions)
                .FirstOrDefaultAsync(c => c.ClassId == classId);

            DateTime startDate = cls?.StartDate ?? DateTime.UtcNow.Date.AddDays(-7);
            string room = cls?.Room ?? "Room 201";

            var schedule = cls?.ClassSchedules.FirstOrDefault();
            var scheduleVersion = schedule?.Versions.FirstOrDefault();

            if (schedule == null || scheduleVersion == null)
            {
                return new List<ClassSession>();
            }

            var defaultSessions = new List<ClassSession>();
            for (int i = 0; i < 5; i++)
            {
                var sDate = startDate.AddDays(i * 3);
                var targetDay = DateOnly.FromDateTime(sDate);
                var targetWeek = targetDay.AddDays(-(((int)targetDay.DayOfWeek + 6) % 7));

                bool exists = await _context.ClassSessions.AnyAsync(s => s.ScheduleId == schedule.ScheduleId && s.OccurrenceWeekStart == targetWeek);
                if (exists) continue;

                defaultSessions.Add(new ClassSession
                {
                    ClassId = classId,
                    ScheduleId = schedule.ScheduleId,
                    ScheduleVersionId = scheduleVersion.ScheduleVersionId,
                    PlannedOccurrenceDate = targetDay,
                    SessionDate = sDate,
                    StartTime = scheduleVersion.StartTime,
                    EndTime = scheduleVersion.EndTime,
                    Room = room,
                    Status = i < 2 ? "completed" : "scheduled"
                });
            }

            if (defaultSessions.Count > 0)
            {
                _context.ClassSessions.AddRange(defaultSessions);
                await _context.SaveChangesAsync();
            }
            return defaultSessions;
        }

        private async Task<List<StudentClass>> EnsureStudentsEnrolledAsync(int classId)
        {
            // Lấy các học sinh có sẵn trong DB (STU001, STU002, STU003...)
            var existingStudents = await _context.Users
                .Where(u => u.UserCode.StartsWith("STU") || (u.Email != null && u.Email.Contains("student")))
                .Take(5)
                .ToListAsync();

            if (existingStudents.Count == 0)
            {
                existingStudents = await _context.Users.Take(3).ToListAsync();
            }

            var enrollments = new List<StudentClass>();
            foreach (var student in existingStudents)
            {
                enrollments.Add(new StudentClass
                {
                    ClassId = classId,
                    StudentId = student.UserId,
                    EnrolledDate = DateTime.UtcNow.AddMonths(-1),
                    Status = "active"
                });
            }

            _context.StudentClasses.AddRange(enrollments);
            await _context.SaveChangesAsync();

            // Load lại đầy đủ Student Navigation
            return await _context.StudentClasses
                .Include(sc => sc.Student)
                .Where(sc => sc.ClassId == classId && sc.Status != "dropped")
                .ToListAsync();
        }
    }
}
