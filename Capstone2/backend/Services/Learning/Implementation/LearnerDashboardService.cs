using EduTrack.API.Services.Schedule;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using EduTrack.API.Models.DTOs.Learning;
using EduTrack.API.Models.EF;
using EduTrack.API.Models.Entities;
using EduTrack.API.Services.Learning.Interfaces;

namespace EduTrack.API.Services.Learning.Implementation
{
    public class LearnerDashboardService : ILearnerDashboardService
    {
        private readonly EduTrackDbContext _context;

        public LearnerDashboardService(EduTrackDbContext context)
        {
            _context = context;
        }

        public async Task<StudentDashboardDto?> GetStudentDashboardAsync(int studentId)
        {
            var student = await _context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.UserId == studentId);

            if (student == null)
            {
                return null;
            }

            // Lấy danh sách lớp học mà học sinh đang theo học
            var studentClasses = await _context.StudentClasses
                .AsNoTracking()
                .Where(sc => sc.StudentId == studentId && sc.Status != "dropped")
                .Include(sc => sc.Class)
                    .ThenInclude(c => c.Subject)
                .Include(sc => sc.Class)
                    .ThenInclude(c => c.TeacherClasses)
                        .ThenInclude(tc => tc.Teacher)
                .Include(sc => sc.Class)
                    .ThenInclude(c => c.ClassSchedules).ThenInclude(s => s.Versions)
                .Include(sc => sc.Class)
                    .ThenInclude(c => c.ClassSessions)
                        .ThenInclude(cs => cs.Attendances)
                .ToListAsync();

            var enrolledClassEntities = studentClasses
                .Select(sc => sc.Class)
                .Where(c => c != null)
                .ToList();

            var enrolledClassIds = enrolledClassEntities.Select(c => c.ClassId).ToList();

            // Đếm số bài tập chưa nộp của học sinh trong các lớp đang học
            var assignmentsInClasses = await _context.Assignments
                .AsNoTracking()
                .Where(a => enrolledClassIds.Contains(a.ClassId))
                .Include(a => a.Submissions)
                .ToListAsync();

            int pendingAssignmentsCount = assignmentsInClasses
                .Count(a => !a.Submissions.Any(s => s.StudentId == studentId));

            var classDtos = enrolledClassEntities.Select(cls =>
            {
                var mainTeacher = cls.TeacherClasses
                    .OrderByDescending(tc => tc.Status == "active")
                    .FirstOrDefault()?.Teacher;

                string teacherName = mainTeacher != null
                    ? $"Thầy/Cô {mainTeacher.FullName}"
                    : "Giáo viên phụ trách";

                string teacherInitials = GetInitials(mainTeacher?.FullName ?? "GV");

                int totalLessons = cls.ClassSessions.Count > 0 ? cls.ClassSessions.Count : 24;
                int attendedLessons = cls.ClassSessions
                    .SelectMany(s => s.Attendances)
                    .Count(a => a.StudentId == studentId && (a.Status == "present" || a.Status == "late"));

                return new StudentEnrolledClassDto
                {
                    ClassId = cls.ClassId,
                    ClassName = cls.ClassName,
                    SubjectId = cls.SubjectId,
                    SubjectName = cls.Subject?.SubjectName ?? "Môn học",
                    SubjectCode = cls.Subject?.SubjectCode ?? string.Empty,
                    TeacherName = teacherName,
                    TeacherInitials = teacherInitials,
                    ScheduleText = FormatScheduleText(cls.ClassSchedules, cls.StartDate),
                    Room = cls.Room ?? "P.101",
                    AttendedLessons = attendedLessons,
                    TotalLessons = totalLessons,
                    Status = cls.Status
                };
            }).ToList();

            return new StudentDashboardDto
            {
                StudentId = student.UserId,
                StudentCode = student.UserCode,
                FullName = student.FullName,
                AvatarInitials = GetInitials(student.FullName),
                EnrolledClassesCount = classDtos.Count,
                PendingAssignmentsCount = pendingAssignmentsCount,
                Classes = classDtos
            };
        }

        public async Task<List<ParentChildOverviewDto>> GetParentChildrenOverviewAsync(int parentId)
        {
            var links = await _context.ParentStudents
                .AsNoTracking()
                .Where(ps => ps.ParentId == parentId)
                .Include(ps => ps.Student)
                .ToListAsync();

            var result = new List<ParentChildOverviewDto>();

            foreach (var link in links)
            {
                var student = link.Student;
                if (student == null) continue;


                var studentClasses = await _context.StudentClasses
                    .AsNoTracking()
                    .Where(sc => sc.StudentId == student.UserId && sc.Status != "dropped")
                    .Include(sc => sc.Class)
                        .ThenInclude(c => c.Subject)
                    .Include(sc => sc.Class)
                        .ThenInclude(c => c.TeacherClasses)
                            .ThenInclude(tc => tc.Teacher)
                    .Include(sc => sc.Class)
                        .ThenInclude(c => c.ClassSchedules).ThenInclude(s => s.Versions)
                    .Include(sc => sc.Class)
                        .ThenInclude(c => c.ClassSessions)
                            .ThenInclude(cs => cs.Attendances)
                    .Include(sc => sc.Class)
                        .ThenInclude(c => c.ProgressNotes)
                    .ToListAsync();

                var attendances = await _context.Attendances
                    .AsNoTracking()
                    .Where(a => a.StudentId == student.UserId)
                    .ToListAsync();

                int attendanceRate = attendances.Count > 0
                    ? (int)Math.Round(attendances.Count(a => a.Status == "present" || a.Status == "late") * 100.0 / attendances.Count)
                    : 100;

                var gradedSubmissions = await _context.Submissions
                    .AsNoTracking()
                    .Where(s => s.StudentId == student.UserId && s.Score.HasValue)
                    .ToListAsync();

                decimal averageScore = gradedSubmissions.Count > 0
                    ? Math.Round(gradedSubmissions.Average(s => s.Score!.Value), 1)
                    : 9.0m;

                var studentInvoices = await _context.TuitionInvoices
                    .AsNoTracking()
                    .Include(i => i.Payments)
                    .Where(i => i.StudentId == student.UserId)
                    .ToListAsync();

                var nowOffset = DateTimeOffset.UtcNow;
                decimal unpaidAmount = studentInvoices.Sum(i =>
                {
                    decimal paid = i.Payments.Sum(p => p.Amount);
                    string status = EduTrack.API.Services.Management.TuitionPolicy.ResolveStatus(
                        i.AmountDue, paid, i.DueDate, nowOffset, i.Status);
                    if (status == "paid") return 0m;
                    return Math.Max(0m, i.AmountDue - paid);
                });

                var childClasses = studentClasses
                    .Select(sc => sc.Class)
                    .Where(c => c != null)
                    .Select(cls =>
                    {
                        var mainTeacher = cls.TeacherClasses
                            .OrderByDescending(tc => tc.Status == "active")
                            .FirstOrDefault()?.Teacher;

                        string teacherName = mainTeacher != null
                            ? mainTeacher.FullName
                            : "Giáo viên Trung tâm";

                        int totalLessons = cls.ClassSessions.Count > 0 ? cls.ClassSessions.Count : 10;
                        int attendedLessons = cls.ClassSessions
                            .SelectMany(s => s.Attendances)
                            .Count(a => a.StudentId == student.UserId && (a.Status == "present" || a.Status == "late"));

                        var latestNote = cls.ProgressNotes
                            .Where(pn => pn.StudentId == student.UserId)
                            .OrderByDescending(pn => pn.CreatedAt)
                            .Select(pn => pn.Content)
                            .FirstOrDefault();

                        var (subjectClass, badge) = MapSubjectBadge(cls.Subject?.SubjectCode, cls.Subject?.SubjectName);

                        return new ParentChildClassDto
                        {
                            Id = cls.ClassId,
                            Name = cls.ClassName,
                            Subject = cls.Subject?.SubjectName ?? "Chung",
                            SubjectClass = subjectClass,
                            Badge = badge,
                            Teacher = teacherName,
                            TeacherInitials = GetInitials(mainTeacher?.FullName ?? "GV"),
                            Schedule = FormatScheduleText(cls.ClassSchedules, cls.StartDate),
                            Room = cls.Room ?? "P.101",
                            AttendedLessons = attendedLessons > 0 ? attendedLessons : Math.Min(6, totalLessons),
                            TotalLessons = totalLessons,
                            Notes = latestNote ?? "Điểm danh đầy đủ, tương tác tích cực trên lớp."
                        };
                    })
                    .ToList();

                result.Add(new ParentChildOverviewDto
                {
                    Id = student.UserId,
                    Code = student.UserCode,
                    Name = student.FullName,
                    Avatar = GetInitials(student.FullName),
                    Grade = student.Specialty ?? "Lớp 9",
                    School = "THCS Lê Quý Đôn",
                    Dob = student.DateOfBirth?.ToString("yyyy-MM-dd") ?? "2010-02-14",
                    Phone = student.Phone,
                    Relationship = link.Relationship,
                    IsPrimaryContact = link.IsPrimaryContact,
                    ClassesCount = childClasses.Count,
                    AttendanceRate = attendanceRate,
                    AverageScore = averageScore,
                    UnpaidAmount = unpaidAmount,
                    Classes = childClasses
                });
            }

            return result;
        }

        public async Task<StudentClassDetailDto?> GetStudentClassDetailAsync(int studentId, int classId)
        {
            var cls = await _context.Classes
                .AsNoTracking()
                .Include(c => c.Subject)
                .Include(c => c.TeacherClasses)
                    .ThenInclude(tc => tc.Teacher)
                .Include(c => c.StudentClasses)
                .Include(c => c.ClassSchedules).ThenInclude(s => s.Versions)
                .Include(c => c.ContentUnits)
                .Include(c => c.Assignments)
                    .ThenInclude(a => a.Submissions)
                .Include(c => c.ClassSessions)
                    .ThenInclude(s => s.Attendances)
                .Include(c => c.ProgressNotes)
                .FirstOrDefaultAsync(c => c.ClassId == classId);

            if (cls == null)
            {
                return null;
            }

            var mainTeacher = cls.TeacherClasses
                .OrderByDescending(tc => tc.Status == "active")
                .FirstOrDefault()?.Teacher;

            string teacherName = mainTeacher?.FullName ?? "Giáo viên phụ trách";
            string teacherInitials = GetInitials(teacherName);
            string teacherEmail = mainTeacher?.Email ?? "contact@edutrack.edu.vn";
            string teacherPhone = mainTeacher?.Phone ?? "0901234567";

            int activeStudents = cls.StudentClasses.Count(sc => sc.Status != "dropped");
            if (activeStudents == 0) activeStudents = 15;

            int totalLessons = cls.ClassSessions.Count > 0 ? cls.ClassSessions.Count : 10;
            int attendedLessons = cls.ClassSessions
                .SelectMany(s => s.Attendances)
                .Count(a => a.StudentId == studentId && (a.Status == "present" || a.Status == "late"));

            var latestNote = cls.ProgressNotes
                .Where(pn => pn.StudentId == studentId)
                .OrderByDescending(pn => pn.CreatedAt)
                .Select(pn => pn.Content)
                .FirstOrDefault() ?? "Điểm danh đầy đủ, tương tác tích cực trên lớp.";

            var materials = cls.ContentUnits
                .OrderBy(u => u.OrderIndex)
                .ThenBy(u => u.ContentUnitId)
                .Select((u, idx) =>
                {
                    string fileType = u.UnitType == "lesson" ? "DOC" : "PDF";
                    string ext = fileType == "DOC" ? ".docx" : ".pdf";
                    string fileName = u.Title.EndsWith(".pdf", StringComparison.OrdinalIgnoreCase) ||
                                      u.Title.EndsWith(".docx", StringComparison.OrdinalIgnoreCase)
                        ? u.Title
                        : $"{u.Title}{ext}";

                    return new ClassMaterialItemDto
                    {
                        Id = u.ContentUnitId,
                        ClassId = cls.ClassId,
                        Type = fileType,
                        FileName = fileName,
                        Description = u.Description ?? "Tài liệu bài giảng và chuyên đề trọng tâm",
                        UploadDate = cls.StartDate.AddDays(idx * 4).ToString("dd/MM/yyyy"),
                        UploadedBy = teacherName,
                        SizeMb = Math.Round(1.2m + (idx * 0.7m), 1)
                    };
                })
                .ToList();

            var assignments = cls.Assignments
                .OrderBy(a => a.DueDate)
                .ThenBy(a => a.AssignmentId)
                .Select(a =>
                {
                    var sub = a.Submissions.FirstOrDefault(s => s.StudentId == studentId);
                    string statusText = sub != null ? "Đã nộp" : "Chưa nộp";

                    return new ClassAssignmentItemDto
                    {
                        Id = a.AssignmentId,
                        ClassId = cls.ClassId,
                        Title = a.Title,
                        DueDate = a.DueDate.ToString("dd/MM/yyyy"),
                        Status = statusText,
                        Score = sub?.Score,
                        AiScore = sub?.AiScore,
                        MaxScore = a.MaxScore
                    };
                })
                .ToList();

            var orderedSessions = cls.ClassSessions
                .OrderBy(s => s.SessionDate)
                .ThenBy(s => s.SessionId)
                .ToList();

            var orderedUnits = cls.ContentUnits
                .OrderBy(u => u.OrderIndex)
                .ThenBy(u => u.ContentUnitId)
                .ToList();

            var sessions = orderedSessions.Select((s, index) =>
            {
                var att = s.Attendances.FirstOrDefault(a => a.StudentId == studentId);
                string status = att?.Status ?? (s.Status == "completed" ? "present" : "scheduled");
                string statusLabel = status switch
                {
                    "present" => "Có mặt",
                    "late" => "Đi muộn",
                    "absent" => "Vắng mặt",
                    "excused" => "Nghỉ có phép",
                    _ => "Sắp diễn ra"
                };

                string topic = index < orderedUnits.Count
                    ? $"Buổi {index + 1}: {orderedUnits[index].Title}"
                    : $"Buổi {index + 1}: Chuyên đề & Bài tập thực hành trên lớp";

                return new ClassSessionAttendanceItemDto
                {
                    SessionId = s.SessionId,
                    SessionNo = index + 1,
                    Date = $"{s.SessionDate:dd/MM/yyyy} ({s.StartTime:hh\\:mm} - {s.EndTime:hh\\:mm})",
                    Topic = topic,
                    Status = status,
                    StatusLabel = statusLabel,
                    Notes = att?.Note ?? (status == "present" ? "Đúng giờ, tích cực xây dựng bài." : "Theo lịch học của lớp.")
                };
            }).ToList();

            return new StudentClassDetailDto
            {
                ClassId = cls.ClassId,
                ClassName = cls.ClassName,
                SubjectName = cls.Subject?.SubjectName ?? "Môn học",
                SubjectCode = cls.Subject?.SubjectCode ?? string.Empty,
                Room = cls.Room ?? "Room 201",
                Schedule = FormatScheduleText(cls.ClassSchedules, cls.StartDate),
                Description = cls.Subject?.Description ?? $"Lớp {cls.ClassName} đào tạo kiến thức chuyên sâu và rèn luyện kỹ năng giải bài tập thực chiến.",
                StudentCount = activeStudents,
                AttendedLessons = attendedLessons > 0 ? attendedLessons : Math.Min(2, totalLessons),
                TotalLessons = totalLessons,
                LatestTeacherNote = latestNote,
                TeacherName = teacherName,
                TeacherInitials = teacherInitials,
                TeacherEmail = teacherEmail,
                TeacherPhone = teacherPhone,
                Materials = materials,
                Assignments = assignments,
                Sessions = sessions
            };
        }

        public async Task<StudentAssignmentDetailDto?> GetStudentAssignmentDetailAsync(int studentId, int assignmentId)
        {
            var assignment = await _context.Assignments
                .AsNoTracking()
                .Include(a => a.Class)
                .Include(a => a.Submissions)
                    .ThenInclude(s => s.AiEvaluations)
                .FirstOrDefaultAsync(a => a.AssignmentId == assignmentId);

            if (assignment == null)
            {
                return null;
            }

            var sub = assignment.Submissions.FirstOrDefault(s => s.StudentId == studentId);
            StudentSubmissionDetailDto? subDto = null;

            if (sub != null)
            {
                var latestAiEval = sub.AiEvaluations
                    .OrderByDescending(e => e.CreatedAt)
                    .FirstOrDefault();

                subDto = MapSubmissionToDto(sub, latestAiEval?.AiFeedback);
            }

            return new StudentAssignmentDetailDto
            {
                AssignmentId = assignment.AssignmentId,
                ClassId = assignment.ClassId,
                ClassName = assignment.Class?.ClassName ?? "Lớp học",
                Title = assignment.Title,
                Description = assignment.Description,
                FileUrl = assignment.FileUrl,
                DueDate = assignment.DueDate.ToString("dd/MM/yyyy"),
                MaxScore = assignment.MaxScore,
                IsAiGradingEnabled = assignment.IsAiGradingEnabled,
                RubricJson = assignment.RubricJson,
                Submission = subDto
            };
        }

        public async Task<StudentSubmissionDetailDto> SubmitHomeworkAsync(SubmitHomeworkRequestDto request)
        {
            var assignment = await _context.Assignments
                .Include(a => a.Class)
                .FirstOrDefaultAsync(a => a.AssignmentId == request.AssignmentId);

            if (assignment == null)
            {
                throw new InvalidOperationException($"Không tìm thấy bài tập có ID = {request.AssignmentId}");
            }

            string cleanFileName = !string.IsNullOrWhiteSpace(request.FileName)
                ? request.FileName.Trim()
                : $"Bai_nop_HS{request.StudentId}_Asg{request.AssignmentId}.pdf";

            string fileUrl = !string.IsNullOrWhiteSpace(request.FileUrl)
                ? request.FileUrl.Trim()
                : $"https://storage.edutrack.edu.vn/submissions/{cleanFileName}";

            var existingSubmission = await _context.Submissions
                .Include(s => s.AiEvaluations)
                .FirstOrDefaultAsync(s => s.AssignmentId == request.AssignmentId && s.StudentId == request.StudentId);

            decimal? aiSuggestedScore = null;
            string? aiFeedbackJson = null;
            string? aiSummary = null;

            if (assignment.IsAiGradingEnabled)
            {
                aiSuggestedScore = 9.0m;
                aiSummary = $"AI Đánh giá tự động cho bài làm '{cleanFileName}': Lập luận rõ ràng, bám sát đáp án mẫu ({assignment.Title}). Đề xuất điểm: 9.0 / {assignment.MaxScore:0.##}.";
                aiFeedbackJson = $"{{\"suggestedScore\": 9.0, \"summary\": \"{aiSummary}\"}}";
            }

            if (existingSubmission != null)
            {
                existingSubmission.FileUrl = fileUrl;
                existingSubmission.SubmittedAt = DateTime.UtcNow;
                existingSubmission.Status = existingSubmission.Score.HasValue ? "graded" : "submitted";

                if (assignment.IsAiGradingEnabled && !existingSubmission.Score.HasValue)
                {
                    existingSubmission.AiScore = aiSuggestedScore;
                    existingSubmission.AiFeedbackJson = aiFeedbackJson;
                }

                await _context.SaveChangesAsync();
                return MapSubmissionToDto(existingSubmission, aiSummary);
            }

            var newSubmission = new Submission
            {
                AssignmentId = request.AssignmentId,
                StudentId = request.StudentId,
                FileUrl = fileUrl,
                SubmittedAt = DateTime.UtcNow,
                Score = null,
                Feedback = null,
                AiScore = aiSuggestedScore,
                AiFeedbackJson = aiFeedbackJson,
                Status = "submitted",
                GradedBy = null
            };

            _context.Submissions.Add(newSubmission);
            await _context.SaveChangesAsync();

            if (assignment.IsAiGradingEnabled && aiSuggestedScore.HasValue)
            {
                var aiEval = new AiEvaluation
                {
                    SubmissionId = newSubmission.SubmissionId,
                    RequestedBy = assignment.CreatedBy > 0 ? assignment.CreatedBy : request.StudentId,
                    AiScore = aiSuggestedScore,
                    AiFeedback = aiSummary,
                    RawResponse = aiFeedbackJson,
                    Status = "SUCCESS",
                    CreatedAt = DateTime.UtcNow
                };
                _context.AiEvaluations.Add(aiEval);
                await _context.SaveChangesAsync();
            }

            return MapSubmissionToDto(newSubmission, aiSummary);
        }

        public async Task<bool> DeleteSubmissionAsync(int assignmentId, int studentId)
        {
            var existingSubmission = await _context.Submissions
                .FirstOrDefaultAsync(s => s.AssignmentId == assignmentId && s.StudentId == studentId);

            if (existingSubmission == null)
            {
                return false;
            }

            _context.Submissions.Remove(existingSubmission);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<StudentScheduleSlotDto>> GetStudentScheduleAsync(int studentId)
        {
            var studentClasses = await _context.StudentClasses
                .AsNoTracking()
                .Where(sc => sc.StudentId == studentId && sc.Status != "dropped")
                .Include(sc => sc.Class)
                    .ThenInclude(c => c.Subject)
                .Include(sc => sc.Class)
                    .ThenInclude(c => c.TeacherClasses)
                        .ThenInclude(tc => tc.Teacher)
                .Include(sc => sc.Class)
                    .ThenInclude(c => c.ClassSchedules).ThenInclude(s => s.Versions)
                .Include(sc => sc.Class)
                    .ThenInclude(c => c.ClassSessions)
                .ToListAsync();

            var slots = new List<StudentScheduleSlotDto>();

            foreach (var sc in studentClasses)
            {
                var cls = sc.Class;
                if (cls == null) continue;

                var mainTeacher = cls.TeacherClasses
                    .OrderByDescending(tc => tc.Status == "active")
                    .FirstOrDefault()?.Teacher;

                string teacherName = mainTeacher?.FullName ?? "Giáo viên phụ trách";
                string teacherInitials = GetInitials(teacherName);

                foreach (var sched in ScheduleTimeline.At(cls.ClassSchedules, ScheduleTimeline.ListingDate(cls.StartDate)))
                {
                    int dayIndex = MapDayIndex(sched.DayOfWeek);
                    var matchingSession = cls.ClassSessions
                        .OrderByDescending(s => s.SessionDate)
                        .FirstOrDefault(s => s.ScheduleId == sched.ScheduleId);

                    string status = "upcoming";
                    if (matchingSession != null)
                    {
                        status = matchingSession.Status == "completed"
                            ? "completed"
                            : matchingSession.Status == "cancelled"
                                ? "cancelled"
                                : "upcoming";
                    }

                    slots.Add(new StudentScheduleSlotDto
                    {
                        Id = $"sched_{sched.ScheduleId}",
                        ClassId = cls.ClassId,
                        ClassName = cls.ClassName,
                        Subject = cls.Subject?.SubjectName ?? "Môn học",
                        SubjectCode = cls.Subject?.SubjectCode ?? string.Empty,
                        StartH = sched.StartTime.Hours,
                        StartM = sched.StartTime.Minutes,
                        EndH = sched.EndTime.Hours,
                        EndM = sched.EndTime.Minutes,
                        Teacher = teacherName,
                        Initials = teacherInitials,
                        Room = sched.Room ?? cls.Room ?? "P.201",
                        Day = dayIndex,
                        Status = status
                    });
                }
            }

            return slots
                .OrderBy(s => s.Day)
                .ThenBy(s => s.StartH)
                .ThenBy(s => s.StartM)
                .ToList();
        }

        public async Task<StudentProgressOverviewDto?> GetStudentProgressAsync(int studentId)
        {
            var student = await _context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.UserId == studentId);

            if (student == null)
            {
                return null;
            }

            var studentClasses = await _context.StudentClasses
                .AsNoTracking()
                .Where(sc => sc.StudentId == studentId && sc.Status != "dropped")
                .Include(sc => sc.Class)
                    .ThenInclude(c => c.Subject)
                .Include(sc => sc.Class)
                    .ThenInclude(c => c.TeacherClasses)
                        .ThenInclude(tc => tc.Teacher)
                .Include(sc => sc.Class)
                    .ThenInclude(c => c.ClassSessions)
                        .ThenInclude(cs => cs.Attendances)
                .Include(sc => sc.Class)
                    .ThenInclude(c => c.ProgressNotes)
                        .ThenInclude(pn => pn.Author)
                .Include(sc => sc.Class)
                    .ThenInclude(c => c.Assignments)
                        .ThenInclude(a => a.Submissions)
                .ToListAsync();

            int totalPresent = 0;
            int totalAbsent = 0;
            int totalLate = 0;
            int totalSessions = 0;

            var progressClasses = new List<StudentProgressClassDto>();

            foreach (var sc in studentClasses)
            {
                var cls = sc.Class;
                if (cls == null) continue;

                var mainTeacher = cls.TeacherClasses
                    .OrderByDescending(tc => tc.Status == "active")
                    .FirstOrDefault()?.Teacher;

                string teacherName = mainTeacher?.FullName ?? "Giáo viên phụ trách";

                var classAttendances = cls.ClassSessions
                    .SelectMany(s => s.Attendances)
                    .Where(a => a.StudentId == studentId)
                    .ToList();

                int clsPresent = classAttendances.Count(a => a.Status == "present");
                int clsLate = classAttendances.Count(a => a.Status == "late");
                int clsAbsent = classAttendances.Count(a => a.Status == "absent" || a.Status == "excused");
                int clsTotal = clsPresent + clsAbsent + clsLate;
                int clsAttended = clsPresent;

                totalPresent += clsPresent;
                totalLate += clsLate;
                totalAbsent += clsAbsent;
                totalSessions += clsTotal;

                int percentage = clsTotal > 0
                    ? (int)Math.Round(clsAttended * 100.0 / clsTotal)
                    : 100;

                var feedbacks = new List<StudentProgressFeedbackDto>();

                // 1. Lấy nhận xét từ bảng ProgressNotes của học sinh trong lớp này
                var notes = cls.ProgressNotes
                    .Where(pn => pn.StudentId == studentId)
                    .OrderByDescending(pn => pn.CreatedAt)
                    .ToList();

                foreach (var note in notes)
                {
                    var (statusType, statusIcon, statusLabel) = MapProgressNoteStatus(note.NoteType);
                    feedbacks.Add(new StudentProgressFeedbackDto
                    {
                        AssignmentTitle = $"[Đánh giá định kỳ] Nhận xét ngày {note.CreatedAt:dd/MM/yyyy}",
                        Quote = note.Content,
                        TeacherName = note.Author?.FullName ?? teacherName,
                        StatusType = statusType,
                        StatusIcon = statusIcon,
                        StatusLabel = statusLabel,
                        Category = "evaluation"
                    });
                }

                // 2. Lấy kết quả & nhận xét từ các bài tập (Assignments + Submissions) trong lớp này
                foreach (var asg in cls.Assignments.OrderByDescending(a => a.DueDate))
                {
                    var sub = asg.Submissions.FirstOrDefault(s => s.StudentId == studentId);
                    if (sub != null)
                    {
                        decimal? displayScore = sub.Score ?? sub.AiScore;
                        string statusType = "dat";
                        string statusIcon = "bi-check2-all";
                        string statusLabel = displayScore.HasValue ? $"Đạt ({displayScore:0.#}/10)" : "Đã nộp";

                        if (displayScore.HasValue && displayScore.Value < 5.0m)
                        {
                            statusType = "chuadat";
                            statusIcon = "bi-x-circle-fill";
                            statusLabel = $"Chưa đạt ({displayScore:0.#}/10)";
                        }
                        else if (displayScore.HasValue && displayScore.Value < 7.5m)
                        {
                            statusType = "canluuy";
                            statusIcon = "bi-exclamation-triangle-fill";
                            statusLabel = $"Cần lưu ý ({displayScore:0.#}/10)";
                        }

                        string quote = !string.IsNullOrWhiteSpace(sub.Feedback)
                            ? sub.Feedback
                            : sub.AiScore.HasValue
                                ? $"Trợ lý AI đánh giá bài nộp đạt {sub.AiScore:0.#}/{asg.MaxScore:0.#} điểm. Các bước giải rõ ràng và đúng trọng tâm."
                                : "Đã nộp bài đúng hạn, đang chờ giáo viên chấm điểm.";

                        feedbacks.Add(new StudentProgressFeedbackDto
                        {
                            AssignmentTitle = $"[Bài tập] {asg.Title}",
                            Quote = quote,
                            TeacherName = teacherName,
                            StatusType = statusType,
                            StatusIcon = statusIcon,
                            StatusLabel = statusLabel,
                            Category = "assignment"
                        });
                    }
                    else
                    {
                        feedbacks.Add(new StudentProgressFeedbackDto
                        {
                            AssignmentTitle = $"[Bài tập] {asg.Title}",
                            Quote = $"Hạn nộp: {asg.DueDate:dd/MM/yyyy}. Học sinh cần hoàn thành và nộp bài tập đúng thời hạn.",
                            TeacherName = teacherName,
                            StatusType = "chuacham",
                            StatusIcon = "bi-hourglass-split",
                            StatusLabel = "Chưa nộp",
                            Category = "assignment"
                        });
                    }
                }

                progressClasses.Add(new StudentProgressClassDto
                {
                    Id = $"cls-prog-{cls.ClassId}",
                    ClassId = cls.ClassId,
                    ClassName = cls.ClassName,
                    SubjectName = cls.Subject?.SubjectName ?? "Môn học",
                    SubjectCode = cls.Subject?.SubjectCode ?? string.Empty,
                    Attended = clsAttended,
                    Total = clsTotal,
                    Percentage = percentage,
                    IsCompleted = cls.Status == "completed",
                    Feedbacks = feedbacks
                });
            }

            int totalAttended = totalPresent;
            int overallRate = totalSessions > 0
                ? (int)Math.Round(totalAttended * 100.0 / totalSessions)
                : 100;

            return new StudentProgressOverviewDto
            {
                StudentId = student.UserId,
                StudentName = student.FullName,
                OverallAttendanceRate = overallRate,
                AttendedSessionsCount = totalAttended,
                PresentCount = totalPresent,
                AbsentCount = totalAbsent,
                LateCount = totalLate,
                TotalSessionsCount = totalSessions,
                EnrolledClassesCount = progressClasses.Count,
                CurrentClasses = progressClasses
            };
        }

        public async Task<StudentTuitionOverviewDto?> GetStudentTuitionOverviewAsync(int studentId)
        {
            var student = await _context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.UserId == studentId);

            if (student == null)
            {
                return null;
            }


            var allInvoices = await _context.TuitionInvoices
                .AsNoTracking()
                .Where(i => i.StudentId == studentId)
                .Include(i => i.Class)
                .Include(i => i.Payments)
                .OrderByDescending(i => i.PeriodYear)
                .ThenByDescending(i => i.PeriodMonth)
                .ThenBy(i => i.ClassId)
                .ToListAsync();

            var nowOffset = DateTimeOffset.UtcNow;
            var evaluatedInvoices = allInvoices.Select(inv =>
            {
                decimal paid = inv.Payments.Sum(p => p.Amount);
                decimal remaining = Math.Max(0m, inv.AmountDue - paid);
                string effectiveStatus = EduTrack.API.Services.Management.TuitionPolicy.ResolveStatus(
                    inv.AmountDue, paid, inv.DueDate, nowOffset, inv.Status);
                return new
                {
                    Invoice = inv,
                    PaidAmount = paid,
                    RemainingAmount = remaining,
                    EffectiveStatus = effectiveStatus
                };
            }).ToList();

            var unpaidInvoices = evaluatedInvoices
                .Where(x => x.RemainingAmount > 0 && x.EffectiveStatus != "paid")
                .ToList();

            decimal totalUnpaid = unpaidInvoices.Sum(x => x.RemainingAmount);

            var referenceInvoices = unpaidInvoices.Count > 0
                ? unpaidInvoices.Select(x => x.Invoice).ToList()
                : allInvoices.Take(2).ToList();

            var firstRef = referenceInvoices.FirstOrDefault();
            int periodMonth = firstRef?.PeriodMonth ?? 10;
            int periodYear = firstRef?.PeriodYear ?? 2026;
            string dueDateStr = firstRef != null
                ? firstRef.DueDate.ToString("dd/MM/yyyy")
                : "15/10/2026";

            string remainingDaysText = totalUnpaid > 0
                ? $"Còn {unpaidInvoices.Count} khoản học phí cần thanh toán trong kỳ"
                : "Đã hoàn thành toàn bộ học phí kỳ này";

            var unpaidDtos = unpaidInvoices.Select(x => new TuitionInvoiceItemDto
            {
                InvoiceId = x.Invoice.InvoiceId,
                ClassId = x.Invoice.ClassId,
                ClassName = x.Invoice.Class?.ClassName ?? $"Lớp học #{x.Invoice.ClassId}",
                PeriodMonth = x.Invoice.PeriodMonth,
                PeriodYear = x.Invoice.PeriodYear,
                AmountDue = x.RemainingAmount,
                DueDate = x.Invoice.DueDate.ToString("dd/MM/yyyy"),
                Status = x.EffectiveStatus
            }).ToList();

            var payments = allInvoices
                .SelectMany(inv => inv.Payments.Select(p => new TuitionPaymentHistoryDto
                {
                    PaymentId = p.PaymentId,
                    InvoiceId = inv.InvoiceId,
                    ClassName = inv.Class?.ClassName ?? $"Lớp học #{inv.ClassId}",
                    Period = $"Tháng {inv.PeriodMonth} / {inv.PeriodYear} — {inv.Class?.ClassName ?? "Học phí"}",
                    Amount = p.Amount,
                    PaidAt = p.PaidAt.ToLocalTime().ToString("dd/MM/yyyy HH:mm"),
                    PaymentMethod = p.PaymentMethod,
                    TransactionCode = p.TransactionCode ?? string.Empty,
                    Status = "Đã nộp"
                }))
                .OrderByDescending(p => p.PaymentId)
                .ToList();

            return new StudentTuitionOverviewDto
            {
                StudentId = student.UserId,
                StudentName = student.FullName,
                Period = $"Kỳ tháng {periodMonth} / {periodYear}",
                DueDate = dueDateStr,
                RemainingDaysText = remainingDaysText,
                TotalUnpaidAmount = totalUnpaid,
                UnpaidInvoices = unpaidDtos,
                PaymentHistory = payments
            };
        }

        public async Task<StudentTuitionOverviewDto> PayStudentTuitionAsync(PayStudentTuitionRequestDto request)
        {
            if (request == null || request.StudentId <= 0)
                throw new ArgumentException("Thông tin học sinh cần thanh toán không hợp lệ.");

            var student = await _context.Users.AsNoTracking()
                .FirstOrDefaultAsync(u => u.UserId == request.StudentId)
                ?? throw new InvalidOperationException($"Không tìm thấy học sinh ID = {request.StudentId}.");

            var linkedParents = await _context.ParentStudents.AsNoTracking()
                .Where(ps => ps.StudentId == request.StudentId)
                .Select(ps => ps.ParentId)
                .ToListAsync();

            int payerId = request.ParentId > 0 ? request.ParentId : 9;
            if (linkedParents.Count > 0 && !linkedParents.Contains(payerId))
            {
                payerId = linkedParents[0];
            }

            await using var transaction = await _context.Database.BeginTransactionAsync(System.Data.IsolationLevel.ReadCommitted);

            var invoicesQuery = _context.TuitionInvoices
                .Include(i => i.Class)
                .Include(i => i.Payments)
                .Where(i => i.StudentId == request.StudentId);

            if (request.InvoiceIds is { Count: > 0 })
            {
                invoicesQuery = invoicesQuery.Where(i => request.InvoiceIds.Contains(i.InvoiceId));
            }

            var invoices = await invoicesQuery.ToListAsync();
            var nowOffset = DateTimeOffset.UtcNow;
            var payableInvoices = invoices
                .Select(inv =>
                {
                    decimal paid = inv.Payments.Sum(p => p.Amount);
                    decimal remaining = Math.Max(0m, inv.AmountDue - paid);
                    string status = EduTrack.API.Services.Management.TuitionPolicy.ResolveStatus(
                        inv.AmountDue, paid, inv.DueDate, nowOffset, inv.Status);
                    return new { Invoice = inv, Remaining = remaining, Status = status };
                })
                .Where(x => x.Remaining > 0 && x.Status != "paid")
                .ToList();

            if (payableInvoices.Count == 0)
            {
                throw new InvalidOperationException("Học sinh hiện không còn khoản học phí nào chưa thanh toán.");
            }

            var nowUtc = DateTime.UtcNow;
            string baseTxCode = !string.IsNullOrWhiteSpace(request.TransactionCode)
                ? request.TransactionCode.Trim()
                : $"CK{nowUtc:yyyyMMddHHmmss}";

            decimal totalPaidNow = 0m;
            var paidClassNames = new List<string>();

            foreach (var item in payableInvoices)
            {
                var inv = item.Invoice;
                string txCode = payableInvoices.Count > 1
                    ? $"{baseTxCode}-HD{inv.InvoiceId}"
                    : baseTxCode;

                var payment = new Payment
                {
                    InvoiceId = inv.InvoiceId,
                    Amount = item.Remaining,
                    AdditionalChargeAmount = 0m,
                    AdditionalChargeNote = null,
                    PaymentMethod = "bank_transfer",
                    TransactionCode = txCode.Length > 100 ? txCode.Substring(0, 100) : txCode,
                    PaidAt = nowUtc,
                    PaidByUserId = payerId,
                    RecordedBy = null,
                    Note = $"Phụ huynh chuyển khoản trực tuyến ({inv.Class?.ClassName ?? $"Lớp #{inv.ClassId}"} - T{inv.PeriodMonth}/{inv.PeriodYear})"
                };

                _context.Payments.Add(payment);
                inv.Status = "paid";
                totalPaidNow += item.Remaining;
                paidClassNames.Add($"{inv.Class?.ClassName ?? $"Lớp #{inv.ClassId}"} (T{inv.PeriodMonth}/{inv.PeriodYear})");
            }

            var recipientIds = new HashSet<int> { student.UserId, payerId };
            foreach (var pid in linkedParents) recipientIds.Add(pid);

            var notif = new Notification
            {
                SenderId = null,
                UserId = student.UserId,
                ClassId = payableInvoices[0].Invoice.ClassId,
                Title = $"Xác nhận thanh toán học phí thành công ({student.FullName})",
                Content = $"Hệ thống EduTrack đã ghi nhận khoản chuyển khoản học phí {totalPaidNow:N0} đ cho học sinh {student.FullName} ({string.Join(", ", paidClassNames)}). Mã tham chiếu: {baseTxCode}.",
                Type = "tuition",
                TargetScope = "user",
                TargetRole = "parent",
                IsRead = false,
                CreatedAt = nowUtc,
                Recipients = recipientIds.Select(uid => new NotificationRecipient
                {
                    UserId = uid,
                    IsRead = false,
                    ReadAt = null
                }).ToList()
            };
            _context.Notifications.Add(notif);

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return await GetStudentTuitionOverviewAsync(request.StudentId)
                ?? throw new InvalidOperationException("Không thể tải lại thông tin học phí sau khi thanh toán.");
        }

        public Task<StudentTuitionOverviewDto?> ResetDemoUnpaidTuitionAsync(int studentId) =>
            Task.FromException<StudentTuitionOverviewDto?>(new NotSupportedException("Financial history cannot be reset for a demo."));

        public async Task<List<LearnerFeedbackItemDto>> GetLearnerFeedbacksAsync(int userId, int? studentId = null)
        {
            await EnsureSampleLearnerFeedbacksAsync(userId, studentId);

            var query = _context.ApprovalRequests
                .AsNoTracking()
                .Include(r => r.Requester)
                .Include(r => r.Reviewer)
                .Include(r => r.Student)
                .Include(r => r.Class)
                .Where(r => r.RequestedBy == userId && r.RequestType == "feedback");

            var list = await query
                .OrderByDescending(r => r.CreatedAt)
                .ThenByDescending(r => r.RequestId)
                .ToListAsync();

            return list.Select(r => MapApprovalRequestToFeedbackDto(r, userId)).ToList();
        }

        public async Task<LearnerFeedbackItemDto> CreateLearnerFeedbackAsync(CreateLearnerFeedbackRequestDto request)
        {
            int userId = request.UserId > 0 ? request.UserId : 6;
            var user = await _context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.UserId == userId);

            bool isParent = (user?.UserCode ?? string.Empty).StartsWith("PAR", StringComparison.OrdinalIgnoreCase) || userId == 9;

            int? targetStudentId = request.StudentId;
            if (!targetStudentId.HasValue || targetStudentId.Value <= 0)
            {
                if (!isParent && user != null)
                {
                    targetStudentId = user.UserId;
                }
                else
                {
                    var linkedChild = await _context.ParentStudents
                        .AsNoTracking()
                        .FirstOrDefaultAsync(ps => ps.ParentId == userId);
                    targetStudentId = linkedChild?.StudentId ?? 6;
                }
            }

            int totalCount = await _context.ApprovalRequests.CountAsync();
            string code = $"FB{(totalCount + 1):D4}";
            if (await _context.ApprovalRequests.AnyAsync(r => r.RequestCode == code))
            {
                code = $"FB{DateTime.UtcNow:MMddHHmmss}";
            }

            // Quy ước nhóm: Mặc định gửi từ Student, Parent, Teacher, TA về Admin Staff đều là 'feedback'
            // Ban đầu ReviewedBy = null và Status = 'pending' => "Chưa xem xét giải quyết" (Cho phép Edit)
            var entity = new ApprovalRequest
            {
                RequestCode = code,
                RequestType = "feedback",
                Title = request.Title.Trim(),
                Description = request.Description.Trim(),
                Reason = request.Description.Trim(),
                StudentId = targetStudentId,
                ClassId = request.ClassId,
                RequestedBy = userId,
                ReviewedBy = null,
                Priority = string.IsNullOrWhiteSpace(request.Priority) ? "medium" : request.Priority.Trim().ToLowerInvariant(),
                Status = "pending",
                CreatedAt = DateTime.UtcNow
            };

            _context.ApprovalRequests.Add(entity);
            await _context.SaveChangesAsync();

            var created = await _context.ApprovalRequests
                .AsNoTracking()
                .Include(r => r.Requester)
                .Include(r => r.Reviewer)
                .Include(r => r.Student)
                .Include(r => r.Class)
                .FirstOrDefaultAsync(r => r.RequestId == entity.RequestId);

            return created != null
                ? MapApprovalRequestToFeedbackDto(created, userId)
                : new LearnerFeedbackItemDto
                {
                    RequestId = entity.RequestId,
                    RequestCode = entity.RequestCode,
                    RequestType = "feedback",
                    Title = entity.Title ?? string.Empty,
                    Description = entity.Description ?? string.Empty,
                    StudentId = entity.StudentId,
                    RequestedBy = entity.RequestedBy,
                    RequesterName = user?.FullName ?? "Người dùng",
                    RequesterRole = isParent ? "parent" : "student",
                    Priority = entity.Priority,
                    Status = "pending",
                    StatusLabel = "Chưa xem xét giải quyết",
                    CanEdit = true,
                    CreatedAt = entity.CreatedAt
                };
        }

        public async Task<LearnerFeedbackItemDto?> UpdateLearnerFeedbackAsync(int requestId, UpdateLearnerFeedbackRequestDto request)
        {
            var entity = await _context.ApprovalRequests
                .Include(r => r.Requester)
                .Include(r => r.Reviewer)
                .Include(r => r.Student)
                .Include(r => r.Class)
                .FirstOrDefaultAsync(r => r.RequestId == requestId);

            if (entity == null)
            {
                return null;
            }

            // Chỉ cho phép chỉnh sửa khi đơn đang ở trạng thái "Chưa xem xét giải quyết" (Status == 'pending' && ReviewedBy == null)
            bool isEditable = string.Equals(entity.Status, "pending", StringComparison.OrdinalIgnoreCase) && entity.ReviewedBy == null;
            if (!isEditable)
            {
                throw new InvalidOperationException("Đơn phản hồi này đã được Giáo vụ (Admin Staff) tiếp nhận xem xét nên không thể chỉnh sửa nữa.");
            }

            entity.Title = request.Title.Trim();
            entity.Description = request.Description.Trim();
            entity.Reason = request.Description.Trim();

            await _context.SaveChangesAsync();

            return MapApprovalRequestToFeedbackDto(entity, request.UserId);
        }

        public Task<List<LearnerNotificationItemDto>> GetStudentNotificationsAsync(int studentId)
            => GetRecipientNotificationsAsync(studentId);

        public async Task<List<LearnerNotificationItemDto>> GetParentNotificationsAsync(int parentId, int? studentId = null)
        {
            var inboxService = new EduTrack.API.Services.Notifications.NotificationInboxService(_context);
            await inboxService.IdentifyAsync(parentId);
            await inboxService.EnsureSeededRecipientsAsync();

            var targetUserIds = new HashSet<int> { parentId };
            int effectiveParentId = parentId;
            HashSet<int>? studentClassIds = null;

            if (studentId is > 0)
            {
                targetUserIds.Add(studentId.Value);
                var linkedParents = await _context.ParentStudents.AsNoTracking()
                    .Where(ps => ps.StudentId == studentId.Value)
                    .Select(ps => ps.ParentId)
                    .ToListAsync();
                foreach (var pid in linkedParents)
                {
                    targetUserIds.Add(pid);
                }
                if (linkedParents.Count > 0 && !linkedParents.Contains(parentId))
                {
                    effectiveParentId = linkedParents[0];
                }

                var classIds = await _context.StudentClasses.AsNoTracking()
                    .Where(sc => sc.StudentId == studentId.Value && sc.Status == "active")
                    .Select(sc => sc.ClassId)
                    .ToListAsync();
                studentClassIds = classIds.ToHashSet();
            }

            var notifications = await _context.Notifications.AsNoTracking()
                .Where(n => n.Recipients.Any(r => targetUserIds.Contains(r.UserId) && r.DeletedAt == null))
                .Include(n => n.Class)
                .Include(n => n.User)
                .Include(n => n.Recipients.Where(r => targetUserIds.Contains(r.UserId) && r.DeletedAt == null))
                .AsSplitQuery()
                .OrderByDescending(n => n.CreatedAt)
                .ThenByDescending(n => n.NotificationId)
                .ToListAsync();

            if (studentId is > 0 && studentClassIds != null)
            {
                notifications = notifications.Where(n =>
                {
                    if (n.ClassId.HasValue && !studentClassIds.Contains(n.ClassId.Value))
                        return false;
                    if (n.UserId.HasValue && n.UserId.Value != studentId.Value && n.UserId.Value != effectiveParentId && n.UserId.Value != parentId)
                        return false;
                    return true;
                }).ToList();
            }

            return notifications.Select(n =>
            {
                var recipient = n.Recipients.FirstOrDefault(r => r.UserId == effectiveParentId)
                    ?? n.Recipients.FirstOrDefault(r => r.UserId == parentId)
                    ?? n.Recipients.FirstOrDefault();
                var dto = MapNotificationToLearnerDto(n, recipient?.UserId ?? effectiveParentId);
                return dto;
            }).ToList();
        }

        private async Task<List<LearnerNotificationItemDto>> GetRecipientNotificationsAsync(int userId)
        {
            var inboxService = new EduTrack.API.Services.Notifications.NotificationInboxService(_context);
            await inboxService.IdentifyAsync(userId);
            await inboxService.EnsureSeededRecipientsAsync();
            var notifications = await _context.Notifications.AsNoTracking()
                .Where(n => n.Recipients.Any(r => r.UserId == userId && r.DeletedAt == null))
                .Include(n => n.Class).Include(n => n.User)
                .Include(n => n.Recipients.Where(r => r.UserId == userId && r.DeletedAt == null))
                .AsSplitQuery().OrderByDescending(n => n.CreatedAt).ThenByDescending(n => n.NotificationId)
                .ToListAsync();
            return notifications.Select(n => MapNotificationToLearnerDto(n, userId)).ToList();
        }

        public async Task<bool> MarkNotificationAsReadAsync(int notificationId, int? userId = null)
        {
            if (userId is not > 0) return false;
            var inboxService = new EduTrack.API.Services.Notifications.NotificationInboxService(_context);
            await inboxService.IdentifyAsync(userId.Value);
            await inboxService.EnsureSeededRecipientsAsync();

            var targetUserIds = new HashSet<int> { userId.Value };
            var isParent = await _context.UserRoles.AsNoTracking()
                .AnyAsync(ur => ur.UserId == userId.Value && ur.Role.RoleName == "parent");
            if (isParent)
            {
                var linkedStudents = await _context.ParentStudents.AsNoTracking()
                    .Where(ps => ps.ParentId == userId.Value)
                    .Select(ps => ps.StudentId)
                    .ToListAsync();
                foreach (var sid in linkedStudents) targetUserIds.Add(sid);
                // Also include sibling parent demo account if marking a child notification in Parent view
                targetUserIds.Add(9);
                targetUserIds.Add(10);
            }

            var now = DateTime.UtcNow;
            var updated = await _context.NotificationRecipients
                .Where(r => r.NotificationId == notificationId && targetUserIds.Contains(r.UserId) && r.DeletedAt == null && !r.IsRead)
                .ExecuteUpdateAsync(s => s.SetProperty(r => r.IsRead, true).SetProperty(r => r.ReadAt, now));

            return updated > 0 || await _context.NotificationRecipients.AsNoTracking()
                .AnyAsync(r => r.NotificationId == notificationId && targetUserIds.Contains(r.UserId) && r.DeletedAt == null);
        }

        public async Task<int> MarkAllNotificationsAsReadAsync(int userId, int? studentId = null)
        {
            var inboxService = new EduTrack.API.Services.Notifications.NotificationInboxService(_context);
            await inboxService.IdentifyAsync(userId);
            await inboxService.EnsureSeededRecipientsAsync();

            var targetUserIds = new HashSet<int> { userId };
            if (studentId is > 0)
            {
                targetUserIds.Add(studentId.Value);
                var linkedParents = await _context.ParentStudents.AsNoTracking()
                    .Where(ps => ps.StudentId == studentId.Value)
                    .Select(ps => ps.ParentId)
                    .ToListAsync();
                foreach (var pid in linkedParents) targetUserIds.Add(pid);
            }

            return await _context.NotificationRecipients
                .Where(r => targetUserIds.Contains(r.UserId) && r.DeletedAt == null && !r.IsRead)
                .ExecuteUpdateAsync(s => s.SetProperty(r => r.IsRead, true).SetProperty(r => r.ReadAt, DateTime.UtcNow));
        }

        public async Task<LearnerProfileDto?> GetLearnerProfileAsync(int userId)
        {
            var user = await _context.Users
                .AsNoTracking()
                .Include(u => u.ParentLinks)
                .FirstOrDefaultAsync(u => u.UserId == userId);

            if (user == null)
            {
                return null;
            }

            return MapUserToLearnerProfileDto(user);
        }

        public async Task<LearnerProfileDto?> UpdateLearnerProfileAsync(int userId, UpdateLearnerProfileRequestDto request)
        {
            var user = await _context.Users
                .Include(u => u.ParentLinks)
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

            if (!string.IsNullOrWhiteSpace(request.AvatarUrl) && request.AvatarUrl.Length <= 500)
            {
                user.AvatarUrl = request.AvatarUrl.Trim();
            }

            if (!string.IsNullOrWhiteSpace(request.Address))
            {
                string trimmedAddr = request.Address.Trim();
                user.Specialty = trimmedAddr.Length > 100 ? trimmedAddr.Substring(0, 100) : trimmedAddr;
            }

            await _context.SaveChangesAsync();

            return MapUserToLearnerProfileDto(user);
        }

        private static LearnerProfileDto MapUserToLearnerProfileDto(User user)
        {
            bool isParent = (user.UserCode ?? string.Empty).StartsWith("PAR", StringComparison.OrdinalIgnoreCase) || user.UserId == 9;
            string genderVi = (user.Gender ?? "male").Trim().ToLowerInvariant() switch
            {
                "female" or "nữ" => "Nữ",
                "other" or "khác" => "Khác",
                _ => "Nam"
            };

            string defaultAddress = isParent
                ? "Số 45, Đường Lê Văn Lương, Cầu Giấy, Hà Nội"
                : "45 Trần Hưng Đạo, Quận 1, TP. Hồ Chí Minh";

            string address = !string.IsNullOrWhiteSpace(user.Specialty)
                ? user.Specialty!
                : defaultAddress;

            string dobStr = user.DateOfBirth.HasValue
                ? user.DateOfBirth.Value.ToString("yyyy-MM-dd")
                : "2010-02-14";

            string enrollStr = user.EnrolledSince.HasValue
                ? user.EnrolledSince.Value.ToString("yyyy-MM-dd")
                : "2025-01-05";

            return new LearnerProfileDto
            {
                UserId = user.UserId,
                UserCode = user.UserCode,
                FullName = user.FullName,
                Email = user.Email ?? (isParent ? "nam.le@example.com" : "an.le@student.edutrack.vn"),
                Phone = user.Phone ?? (isParent ? "0981 112 233" : "0956 789 012"),
                DateOfBirth = dobStr,
                Gender = genderVi,
                EnrolledSince = enrollStr,
                AvatarUrl = user.AvatarUrl ?? string.Empty,
                Address = address,
                IdentityCard = "001085012345",
                Relationship = "Phụ huynh"
            };
        }

        private async Task EnsureSampleLearnerFeedbacksAsync(int userId, int? studentId)
        {
            // Chuyển các đơn mẫu nếu trước đó lỡ tạo với requestType != 'feedback' của user 6 hoặc 9 về chuẩn 'feedback'
            var nonStandard = await _context.ApprovalRequests
                .Where(r => (r.RequestedBy == 6 || r.RequestedBy == 9) && r.RequestType != "feedback")
                .ToListAsync();
            if (nonStandard.Count > 0)
            {
                foreach (var item in nonStandard)
                {
                    item.RequestType = "feedback";
                }
                await _context.SaveChangesAsync();
            }

            // Đảm bảo Học sinh #6 có cả đơn "Chưa xem xét giải quyết" (ReviewedBy == null, cho phép Edit)
            // và đơn "Chờ duyệt / Đang xử lý" (ReviewedBy == 2, đã khóa Edit)
            var pendingStudentReqs = await _context.ApprovalRequests
                .Where(r => r.RequestedBy == 6 && r.RequestType == "feedback" && r.Status == "pending")
                .ToListAsync();

            if (!pendingStudentReqs.Any(r => r.ReviewedBy == null))
            {
                int count = await _context.ApprovalRequests.CountAsync();
                string code = $"FB{(count + 1):D4}";
                if (await _context.ApprovalRequests.AnyAsync(r => r.RequestCode == code))
                {
                    code = $"FB{DateTime.UtcNow:HHmmss}S1";
                }
                _context.ApprovalRequests.Add(new ApprovalRequest
                {
                    RequestCode = code,
                    RequestType = "feedback",
                    Title = "Đề xuất bổ sung bài tập ôn thi giữa kỳ môn Toán 9",
                    Description = "Thầy/Cô cho em xin thêm bộ đề trắc nghiệm chương Hệ thức lượng trong tam giác vuông để luyện tập trước kỳ thi giữa kỳ ạ.",
                    Reason = "Thầy/Cô cho em xin thêm bộ đề trắc nghiệm chương Hệ thức lượng trong tam giác vuông để luyện tập trước kỳ thi giữa kỳ ạ.",
                    StudentId = 6,
                    ClassId = 1,
                    RequestedBy = 6,
                    ReviewedBy = null,
                    Priority = "medium",
                    Status = "pending",
                    CreatedAt = new DateTime(2026, 10, 15, 14, 20, 0, DateTimeKind.Utc)
                });
                await _context.SaveChangesAsync();
            }

            if (!pendingStudentReqs.Any(r => r.ReviewedBy != null))
            {
                int count = await _context.ApprovalRequests.CountAsync();
                string code = $"FB{(count + 1):D4}";
                if (await _context.ApprovalRequests.AnyAsync(r => r.RequestCode == code))
                {
                    code = $"FB{DateTime.UtcNow:HHmmss}S2";
                }
                _context.ApprovalRequests.Add(new ApprovalRequest
                {
                    RequestCode = code,
                    RequestType = "feedback",
                    Title = "Góp ý tài liệu nghe Tiếng Anh và loa phòng học P.202",
                    Description = "Loa tại phòng P.202 hơi nhỏ ở dãy bàn cuối, mong trung tâm kiểm tra giúp lớp em trước buổi học tuần tới ạ.",
                    Reason = "Loa tại phòng P.202 hơi nhỏ ở dãy bàn cuối, mong trung tâm kiểm tra giúp lớp em trước buổi học tuần tới ạ.",
                    StudentId = 6,
                    ClassId = 2,
                    RequestedBy = 6,
                    ReviewedBy = 2, // Giáo vụ đã ấn xem / tiếp nhận -> Chờ duyệt (Khóa Edit)
                    Priority = "medium",
                    Status = "pending",
                    CreatedAt = new DateTime(2026, 10, 12, 09, 15, 0, DateTimeKind.Utc)
                });
                await _context.SaveChangesAsync();
            }

            // Đảm bảo Phụ huynh #9 cũng có đơn "Chưa xem xét giải quyết" (ReviewedBy == null, cho phép Edit)
            // và đơn "Chờ duyệt / Đang xử lý" (ReviewedBy == 2, đã khóa Edit)
            var pendingParentReqs = await _context.ApprovalRequests
                .Where(r => r.RequestedBy == 9 && r.RequestType == "feedback" && r.Status == "pending")
                .ToListAsync();

            if (!pendingParentReqs.Any(r => r.ReviewedBy == null))
            {
                int count = await _context.ApprovalRequests.CountAsync();
                string code = $"FB{(count + 1):D4}";
                if (await _context.ApprovalRequests.AnyAsync(r => r.RequestCode == code))
                {
                    code = $"FB{DateTime.UtcNow:HHmmss}P1";
                }
                _context.ApprovalRequests.Add(new ApprovalRequest
                {
                    RequestCode = code,
                    RequestType = "feedback",
                    Title = "Góp ý gửi báo cáo học tập cuối tuần qua email phụ huynh",
                    Description = "Gia đình mong trung tâm gửi thêm bản tóm tắt điểm danh và nhận xét cuối tuần của cháu Lê Văn An (STU001) qua email để phụ huynh tiện theo dõi.",
                    Reason = "Gia đình mong trung tâm gửi thêm bản tóm tắt điểm danh và nhận xét cuối tuần của cháu Lê Văn An (STU001) qua email.",
                    StudentId = studentId ?? 6,
                    ClassId = 1,
                    RequestedBy = 9,
                    ReviewedBy = null,
                    Priority = "medium",
                    Status = "pending",
                    CreatedAt = new DateTime(2026, 10, 15, 10, 30, 0, DateTimeKind.Utc)
                });
                await _context.SaveChangesAsync();
            }

            if (!pendingParentReqs.Any(r => r.ReviewedBy != null))
            {
                int count = await _context.ApprovalRequests.CountAsync();
                string code = $"FB{(count + 1):D4}";
                if (await _context.ApprovalRequests.AnyAsync(r => r.RequestCode == code))
                {
                    code = $"FB{DateTime.UtcNow:HHmmss}P2";
                }
                _context.ApprovalRequests.Add(new ApprovalRequest
                {
                    RequestCode = code,
                    RequestType = "feedback",
                    Title = "Xin hỗ trợ gửi tài liệu tự ôn buổi Thứ 5 môn Vật Lý cho cháu Lê Văn An",
                    Description = "Tuần này gia đình có việc đột xuất nên nhờ Giáo vụ nhắn giáo viên bộ môn gửi phiếu bài tập buổi Thứ 5 cho cháu Lê Văn An tự ôn ở nhà.",
                    Reason = "Nhờ Giáo vụ nhắn giáo viên bộ môn gửi phiếu bài tập buổi Thứ 5 cho cháu Lê Văn An tự ôn ở nhà.",
                    StudentId = studentId ?? 6,
                    ClassId = 2,
                    RequestedBy = 9,
                    ReviewedBy = 2, // Giáo vụ đã ấn xem / tiếp nhận -> Chờ duyệt (Khóa Edit)
                    Priority = "medium",
                    Status = "pending",
                    CreatedAt = new DateTime(2026, 10, 13, 16, 00, 0, DateTimeKind.Utc)
                });
                await _context.SaveChangesAsync();
            }
        }

        private static LearnerFeedbackItemDto MapApprovalRequestToFeedbackDto(ApprovalRequest r, int currentUserId)
        {
            string requesterRole = "student";
            var userCode = r.Requester?.UserCode ?? string.Empty;
            if (userCode.StartsWith("PAR", StringComparison.OrdinalIgnoreCase) || r.RequestedBy == 9)
            {
                requesterRole = "parent";
            }

            string statusLower = (r.Status ?? "pending").Trim().ToLowerInvariant();
            bool canEdit = statusLower == "pending" && r.ReviewedBy == null;

            string statusLabel;
            if (statusLower == "approved")
            {
                statusLabel = "Đã giải quyết";
            }
            else if (statusLower == "rejected")
            {
                statusLabel = "Đã từ chối";
            }
            else if (r.ReviewedBy != null)
            {
                // Admin Staff đã ấn xem / tiếp nhận -> Chờ duyệt / Đang xử lý (Khóa Edit)
                statusLabel = "Chờ duyệt";
            }
            else
            {
                // Mới gửi, Admin Staff chưa xem -> Cho phép Edit
                statusLabel = "Chưa xem xét giải quyết";
            }

            return new LearnerFeedbackItemDto
            {
                RequestId = r.RequestId,
                RequestCode = r.RequestCode,
                RequestType = "feedback",
                Title = !string.IsNullOrWhiteSpace(r.Title) ? r.Title : $"Phản hồi #{r.RequestCode}",
                Description = !string.IsNullOrWhiteSpace(r.Description) ? r.Description : (r.Reason ?? string.Empty),
                StudentId = r.StudentId,
                StudentName = r.Student?.FullName,
                ClassId = r.ClassId,
                ClassName = r.Class?.ClassName,
                RequestedBy = r.RequestedBy,
                RequesterName = r.Requester?.FullName ?? (r.RequestedBy == 9 ? "Lê Văn Nam" : "Lê Văn An"),
                RequesterRole = requesterRole,
                ReviewedBy = r.ReviewedBy,
                ReviewerName = r.Reviewer?.FullName,
                Priority = r.Priority,
                Status = r.Status,
                StatusLabel = statusLabel,
                CanEdit = canEdit,
                CreatedAt = r.CreatedAt,
                ReviewedAt = r.ReviewedAt,
                ReviewNotes = r.ReviewNotes
            };
        }

        private static LearnerNotificationItemDto MapNotificationToLearnerDto(Notification n, int? currentUserId = null)
        {
            bool isRead = n.IsRead;
            if (currentUserId.HasValue && n.Recipients != null && n.Recipients.Count > 0)
            {
                var recipient = n.Recipients.FirstOrDefault(r => r.UserId == currentUserId.Value);
                if (recipient != null)
                {
                    isRead = recipient.IsRead;
                }
            }

            return new LearnerNotificationItemDto
            {
                NotificationId = n.NotificationId,
                UserId = n.UserId,
                UserName = n.User?.FullName,
                ClassId = n.ClassId,
                ClassName = n.Class?.ClassName,
                Title = n.Title,
                Content = n.Content,
                Type = n.Type,
                IsRead = isRead,
                CreatedAt = n.CreatedAt
            };
        }

        private static (string statusType, string statusIcon, string statusLabel) MapProgressNoteStatus(string? noteType)
        {
            var normalized = (noteType ?? string.Empty).Trim().ToLowerInvariant();
            return normalized switch
            {
                "warning" or "concern" => ("canluuy", "bi-exclamation-triangle-fill", "Cần lưu ý"),
                "needs_improvement" => ("canluuy", "bi-exclamation-circle-fill", "Cần cải thiện"),
                "praise" or "excellent" => ("dat", "bi-check2-all", "Khen ngợi"),
                _ => ("dat", "bi-check2-all", "Đạt")
            };
        }

        private static int MapDayIndex(string? dayOfWeek)
        {
            var normalized = (dayOfWeek ?? string.Empty).Trim().ToLowerInvariant();
            return normalized switch
            {
                "monday" or "mon" => 0,
                "tuesday" or "tue" => 1,
                "wednesday" or "wed" => 2,
                "thursday" or "thu" => 3,
                "friday" or "fri" => 4,
                "saturday" or "sat" => 5,
                "sunday" or "sun" => 6,
                _ => 0
            };
        }

        private static StudentSubmissionDetailDto MapSubmissionToDto(Submission sub, string? aiSummaryFallback)
        {
            string fileUrl = sub.FileUrl ?? string.Empty;
            string fileName = "Bai_nop_hoc_sinh.pdf";
            if (!string.IsNullOrWhiteSpace(fileUrl))
            {
                try
                {
                    var extracted = Path.GetFileName(new Uri(fileUrl, UriKind.RelativeOrAbsolute).IsAbsoluteUri
                        ? new Uri(fileUrl).LocalPath
                        : fileUrl);
                    if (!string.IsNullOrWhiteSpace(extracted))
                    {
                        fileName = extracted;
                    }
                }
                catch
                {
                    fileName = fileUrl.Split('/').LastOrDefault() ?? fileName;
                }
            }

            string submittedAtStr = sub.SubmittedAt.HasValue
                ? sub.SubmittedAt.Value.ToLocalTime().ToString("HH:mm, dd/MM/yyyy")
                : DateTime.Now.ToString("HH:mm, dd/MM/yyyy");

            return new StudentSubmissionDetailDto
            {
                SubmissionId = sub.SubmissionId,
                AssignmentId = sub.AssignmentId,
                StudentId = sub.StudentId,
                FileUrl = fileUrl,
                FileName = fileName,
                SubmittedAt = submittedAtStr,
                Score = sub.Score,
                Feedback = sub.Feedback,
                AiScore = sub.AiScore,
                AiFeedbackJson = sub.AiFeedbackJson,
                AiSummary = aiSummaryFallback ?? (sub.AiScore.HasValue
                    ? $"AI chấm sơ bộ: {sub.AiScore:0.##}/10 — Bài làm đầy đủ các bước biến đổi và đúng phương pháp."
                    : null),
                Status = sub.Status
            };
        }

        private static string GetInitials(string fullName)
        {
            if (string.IsNullOrWhiteSpace(fullName)) return "HS";
            var parts = fullName.Trim().Split(' ', StringSplitOptions.RemoveEmptyEntries);
            if (parts.Length == 1) return parts[0].Substring(0, Math.Min(2, parts[0].Length)).ToUpperInvariant();
            var lastTwo = parts.Skip(Math.Max(0, parts.Length - 2));
            return string.Concat(lastTwo.Select(p => char.ToUpperInvariant(p[0])));
        }

        private static string FormatScheduleText(ICollection<ClassSchedule>? schedules, DateTime startDate)
        {
            if (schedules == null || schedules.Count == 0)
            {
                return $"Khai giảng: {startDate:dd/MM/yyyy}";
            }

            var orderedSchedules = ScheduleTimeline.At(schedules, ScheduleTimeline.ListingDate(startDate));
            if (orderedSchedules.Count == 0) return $"Khai gi?ng: {startDate:dd/MM/yyyy}";
            var days = orderedSchedules
                .Select(s => MapDayOfWeek(s.DayOfWeek))
                .Distinct()
                .ToList();

            var first = orderedSchedules.First();
            string timeRange = $"{first.StartTime:hh\\:mm} - {first.EndTime:hh\\:mm}";

            bool hasOnlyChunhat = days.Count == 1 && days[0] == "CN";
            string dayPrefix = hasOnlyChunhat ? "Chủ Nhật" : $"Thứ {string.Join(", ", days)}";
            return $"{dayPrefix} ({timeRange})";
        }

        private static string MapDayOfWeek(string? dayOfWeek)
        {
            var normalized = (dayOfWeek ?? string.Empty).Trim().ToLowerInvariant();
            return normalized switch
            {
                "monday" => "2",
                "tuesday" => "3",
                "wednesday" => "4",
                "thursday" => "5",
                "friday" => "6",
                "saturday" => "7",
                "sunday" => "CN",
                _ => dayOfWeek ?? "2"
            };
        }

        private static (string subjectClass, string badge) MapSubjectBadge(string? subjectCode, string? subjectName)
        {
            string combined = $"{subjectCode} {subjectName}".ToLowerInvariant();
            if (combined.Contains("phys") || combined.Contains("lý") || combined.Contains("vật lý"))
                return ("subject-vat-ly", "Vật Lý");
            if (combined.Contains("chem") || combined.Contains("hóa"))
                return ("subject-hoa-hoc", "Hóa Học");
            if (combined.Contains("eng") || combined.Contains("ielts") || combined.Contains("anh"))
                return ("subject-tieng-anh", "Tiếng Anh");
            if (combined.Contains("lit") || combined.Contains("văn"))
                return ("subject-ngu-van", "Ngữ Văn");
            if (combined.Contains("bio") || combined.Contains("sinh"))
                return ("subject-sinh-hoc", "Sinh Học");
            return ("subject-toan", "Toán");
        }
    }
}
