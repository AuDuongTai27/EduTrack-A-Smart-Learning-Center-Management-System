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
    public class TeachingAssignmentService : ITeachingAssignmentService
    {
        private readonly EduTrackDbContext _context;

        public TeachingAssignmentService(EduTrackDbContext context)
        {
            _context = context;
        }

        public async Task<TeachingAssignmentItemDto> CreateAssignmentAsync(CreateTeachingAssignmentRequestDto request)
        {
            if (string.IsNullOrWhiteSpace(request.Title))
            {
                throw new ArgumentException("Tiêu đề bài tập không được để trống.");
            }

            var cls = await _context.Classes.FindAsync(request.ClassId);
            if (cls == null)
            {
                throw new ArgumentException($"Không tìm thấy lớp học có ID = {request.ClassId}.");
            }

            var creator = await _context.Users.FindAsync(request.CreatedBy);
            if (creator == null)
            {
                // Fallback to teacher 3
                request.CreatedBy = 3;
            }

            var assignment = new Assignment
            {
                ClassId = request.ClassId,
                Title = request.Title.Trim(),
                Description = request.Description?.Trim(),
                DueDate = request.DueDate != default ? request.DueDate : DateTime.UtcNow.AddDays(7),
                MaxScore = request.MaxScore > 0 ? request.MaxScore : 10.00m,
                FileUrl = !string.IsNullOrWhiteSpace(request.FileUrl) ? request.FileUrl.Trim() : "/assets/docs/assignment_default.pdf",
                CreatedBy = request.CreatedBy,
                IsAiGradingEnabled = request.IsAiGradingEnabled
            };

            _context.Assignments.Add(assignment);
            await _context.SaveChangesAsync();

            return await MapToDtoAsync(assignment);
        }

        public async Task<List<TeachingAssignmentItemDto>> GetClassAssignmentsAsync(int classId)
        {
            var assignments = await _context.Assignments
                .AsNoTracking()
                .Include(a => a.Class)
                .Include(a => a.Creator)
                .Include(a => a.Submissions)
                .Where(a => a.ClassId == classId)
                .OrderByDescending(a => a.AssignmentId)
                .ToListAsync();

            var list = new List<TeachingAssignmentItemDto>();
            foreach (var a in assignments)
            {
                int submissionsCount = a.Submissions?.Count ?? 0;
                int gradedCount = a.Submissions?.Count(s => s.Score.HasValue) ?? 0;
                string status = DateTime.UtcNow > a.DueDate ? "overdue" : "active";

                list.Add(new TeachingAssignmentItemDto
                {
                    AssignmentId = a.AssignmentId,
                    ClassId = a.ClassId,
                    ClassName = a.Class?.ClassName ?? $"Class #{a.ClassId}",
                    Title = a.Title,
                    Description = a.Description,
                    FileUrl = a.FileUrl,
                    DueDate = a.DueDate.ToString("yyyy-MM-ddTHH:mm:ss"),
                    DueDateFormatted = a.DueDate.ToString("dd/MM/yyyy HH:mm"),
                    MaxScore = a.MaxScore,
                    CreatedBy = a.CreatedBy,
                    CreatorName = a.Creator?.FullName ?? "Giáo viên chuyên môn",
                    AssignmentType = "Written Assignment",
                    SubmissionCount = submissionsCount,
                    GradedCount = gradedCount,
                    Status = status,
                    IsAiGradingEnabled = a.IsAiGradingEnabled,
                    CreatedAt = DateTime.UtcNow.ToString("dd/MM/yyyy")
                });
            }

            return list;
        }

        public async Task<TeachingAssignmentItemDto?> GetAssignmentByIdAsync(int assignmentId)
        {
            var a = await _context.Assignments
                .AsNoTracking()
                .Include(x => x.Class)
                .Include(x => x.Creator)
                .Include(x => x.Submissions)
                .FirstOrDefaultAsync(x => x.AssignmentId == assignmentId);

            if (a == null) return null;

            int submissionsCount = a.Submissions?.Count ?? 0;
            int gradedCount = a.Submissions?.Count(s => s.Score.HasValue) ?? 0;
            string status = DateTime.UtcNow > a.DueDate ? "overdue" : "active";

            return new TeachingAssignmentItemDto
            {
                AssignmentId = a.AssignmentId,
                ClassId = a.ClassId,
                ClassName = a.Class?.ClassName ?? $"Class #{a.ClassId}",
                Title = a.Title,
                Description = a.Description,
                FileUrl = a.FileUrl,
                DueDate = a.DueDate.ToString("yyyy-MM-ddTHH:mm:ss"),
                DueDateFormatted = a.DueDate.ToString("dd/MM/yyyy HH:mm"),
                MaxScore = a.MaxScore,
                CreatedBy = a.CreatedBy,
                CreatorName = a.Creator?.FullName ?? "Giáo viên chuyên môn",
                AssignmentType = "Written Assignment",
                SubmissionCount = submissionsCount,
                GradedCount = gradedCount,
                Status = status,
                IsAiGradingEnabled = a.IsAiGradingEnabled,
                CreatedAt = DateTime.UtcNow.ToString("dd/MM/yyyy")
            };
        }

        public async Task<TeachingAssignmentItemDto> UpdateAssignmentAsync(int assignmentId, UpdateTeachingAssignmentRequestDto request)
        {
            var assignment = await _context.Assignments.FindAsync(assignmentId);
            if (assignment == null)
            {
                throw new KeyNotFoundException($"Không tìm thấy bài tập có ID = {assignmentId}.");
            }

            if (!string.IsNullOrWhiteSpace(request.Title))
            {
                assignment.Title = request.Title.Trim();
            }

            if (request.Description != null)
            {
                assignment.Description = request.Description.Trim();
            }

            if (request.DueDate.HasValue && request.DueDate.Value != default)
            {
                assignment.DueDate = request.DueDate.Value;
            }

            if (!string.IsNullOrWhiteSpace(request.FileUrl))
            {
                assignment.FileUrl = request.FileUrl.Trim();
            }

            if (request.MaxScore.HasValue && request.MaxScore.Value > 0)
            {
                assignment.MaxScore = request.MaxScore.Value;
            }

            if (request.IsAiGradingEnabled.HasValue)
            {
                assignment.IsAiGradingEnabled = request.IsAiGradingEnabled.Value;
            }

            await _context.SaveChangesAsync();
            return await MapToDtoAsync(assignment);
        }

        public async Task<bool> DeleteAssignmentAsync(int assignmentId)
        {
            var assignment = await _context.Assignments
                .Include(a => a.Submissions)
                .FirstOrDefaultAsync(a => a.AssignmentId == assignmentId);

            if (assignment == null)
            {
                return false;
            }

            if (assignment.Submissions != null && assignment.Submissions.Any())
            {
                _context.Submissions.RemoveRange(assignment.Submissions);
            }

            _context.Assignments.Remove(assignment);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<TeachingSubmissionItemDto>> GetAssignmentSubmissionsAsync(int assignmentId)
        {
            var assignment = await _context.Assignments
                .AsNoTracking()
                .FirstOrDefaultAsync(a => a.AssignmentId == assignmentId);

            if (assignment == null)
            {
                return new List<TeachingSubmissionItemDto>();
            }

            // 1. Lấy danh sách học sinh đang theo học trong lớp
            var enrolledStudents = await _context.StudentClasses
                .AsNoTracking()
                .Where(sc => sc.ClassId == assignment.ClassId && sc.Status != "dropped")
                .Include(sc => sc.Student)
                .OrderBy(sc => sc.StudentId)
                .ToListAsync();

            var studentsList = enrolledStudents.Select(sc => sc.Student).Where(s => s != null).ToList();
            if (studentsList.Count == 0)
            {
                studentsList = await _context.Users
                    .AsNoTracking()
                    .Where(u => u.UserRoles.Any(ur => ur.Role.RoleName == "student") || u.UserCode.StartsWith("STU"))
                    .Take(3)
                    .ToListAsync();
            }

            // 2. Lấy các bài nộp thực tế đã có trong bảng submissions
            var existingSubmissions = await _context.Submissions
                .AsNoTracking()
                .Where(s => s.AssignmentId == assignmentId)
                .Include(s => s.Student)
                .Include(s => s.Grader)
                .ToListAsync();

            var result = new List<TeachingSubmissionItemDto>();
            var processedStudentIds = new HashSet<int>();

            // 3. Với mỗi học sinh trong lớp, hiển thị bài nộp nếu có, hoặc hiển thị trạng thái chưa nộp
            foreach (var student in studentsList)
            {
                processedStudentIds.Add(student.UserId);
                var sub = existingSubmissions.FirstOrDefault(s => s.StudentId == student.UserId);

                if (sub != null)
                {
                    result.Add(new TeachingSubmissionItemDto
                    {
                        SubmissionId = sub.SubmissionId,
                        AssignmentId = assignmentId,
                        StudentId = student.UserId,
                        StudentName = student.FullName,
                        StudentCode = student.UserCode,
                        StudentAvatarUrl = student.AvatarUrl,
                        FileUrl = sub.FileUrl,
                        SubmittedAt = sub.SubmittedAt?.ToString("yyyy-MM-ddTHH:mm:ss") ?? string.Empty,
                        SubmittedAtFormatted = sub.SubmittedAt?.ToString("dd/MM/yyyy HH:mm") ?? "—",
                        Score = sub.Score,
                        Feedback = sub.Feedback,
                        AiScore = sub.AiScore,
                        Status = sub.Status,
                        GradedBy = sub.GradedBy,
                        GraderName = sub.Grader?.FullName ?? (sub.Score.HasValue ? "ThS. Hoàng Quốc Việt" : null)
                    });
                }
                else
                {
                    // Học sinh trong lớp chưa nộp bài
                    result.Add(new TeachingSubmissionItemDto
                    {
                        SubmissionId = 0,
                        AssignmentId = assignmentId,
                        StudentId = student.UserId,
                        StudentName = student.FullName,
                        StudentCode = student.UserCode,
                        StudentAvatarUrl = student.AvatarUrl,
                        FileUrl = null,
                        SubmittedAt = string.Empty,
                        SubmittedAtFormatted = "Chưa nộp bài",
                        Score = null,
                        Feedback = null,
                        AiScore = null,
                        Status = "not_submitted",
                        GradedBy = null,
                        GraderName = null
                    });
                }
            }

            // 4. Nếu có học sinh ngoài danh sách lớp mà đã nộp bài, bổ sung vào cuối
            foreach (var sub in existingSubmissions.Where(s => !processedStudentIds.Contains(s.StudentId)))
            {
                result.Add(new TeachingSubmissionItemDto
                {
                    SubmissionId = sub.SubmissionId,
                    AssignmentId = assignmentId,
                    StudentId = sub.StudentId,
                    StudentName = sub.Student?.FullName ?? $"Học sinh #{sub.StudentId}",
                    StudentCode = sub.Student?.UserCode ?? $"STU{sub.StudentId:D3}",
                    StudentAvatarUrl = sub.Student?.AvatarUrl,
                    FileUrl = sub.FileUrl,
                    SubmittedAt = sub.SubmittedAt?.ToString("yyyy-MM-ddTHH:mm:ss") ?? string.Empty,
                    SubmittedAtFormatted = sub.SubmittedAt?.ToString("dd/MM/yyyy HH:mm") ?? "—",
                    Score = sub.Score,
                    Feedback = sub.Feedback,
                    AiScore = sub.AiScore,
                    Status = sub.Status,
                    GradedBy = sub.GradedBy,
                    GraderName = sub.Grader?.FullName
                });
            }

            return result;
        }

        public async Task<TeachingSubmissionItemDto> GradeSubmissionAsync(int assignmentId, int submissionId, GradeTeachingSubmissionRequestDto request)
        {
            var sub = await _context.Submissions
                .Include(s => s.Student)
                .Include(s => s.Grader)
                .FirstOrDefaultAsync(s => s.SubmissionId == submissionId && s.AssignmentId == assignmentId);

            if (sub == null)
            {
                throw new KeyNotFoundException($"Không tìm thấy bài nộp ID = {submissionId} của bài tập ID = {assignmentId}.");
            }

            sub.Score = request.Score;
            sub.Feedback = request.Feedback?.Trim();
            sub.GradedBy = request.GradedBy > 0 ? request.GradedBy : 3;
            sub.Status = "graded";

            await _context.SaveChangesAsync();

            var grader = await _context.Users.FindAsync(sub.GradedBy);

            return new TeachingSubmissionItemDto
            {
                SubmissionId = sub.SubmissionId,
                AssignmentId = sub.AssignmentId,
                StudentId = sub.StudentId,
                StudentName = sub.Student?.FullName ?? $"Học sinh #{sub.StudentId}",
                StudentCode = sub.Student?.UserCode ?? $"STU{sub.StudentId:D3}",
                FileUrl = sub.FileUrl,
                SubmittedAt = sub.SubmittedAt?.ToString("yyyy-MM-ddTHH:mm:ss") ?? string.Empty,
                SubmittedAtFormatted = sub.SubmittedAt?.ToString("dd/MM/yyyy HH:mm") ?? string.Empty,
                Score = sub.Score,
                Feedback = sub.Feedback,
                AiScore = sub.AiScore,
                Status = sub.Status,
                GradedBy = sub.GradedBy,
                GraderName = grader?.FullName ?? "ThS. Hoàng Quốc Việt"
            };
        }

        private async Task<TeachingAssignmentItemDto> MapToDtoAsync(Assignment a)
        {
            var cls = await _context.Classes.FindAsync(a.ClassId);
            var creator = await _context.Users.FindAsync(a.CreatedBy);
            int subCount = await _context.Submissions.CountAsync(s => s.AssignmentId == a.AssignmentId);
            int gradedCount = await _context.Submissions.CountAsync(s => s.AssignmentId == a.AssignmentId && s.Score.HasValue);

            return new TeachingAssignmentItemDto
            {
                AssignmentId = a.AssignmentId,
                ClassId = a.ClassId,
                ClassName = cls?.ClassName ?? $"Class #{a.ClassId}",
                Title = a.Title,
                Description = a.Description,
                FileUrl = a.FileUrl,
                DueDate = a.DueDate.ToString("yyyy-MM-ddTHH:mm:ss"),
                DueDateFormatted = a.DueDate.ToString("dd/MM/yyyy HH:mm"),
                MaxScore = a.MaxScore,
                CreatedBy = a.CreatedBy,
                CreatorName = creator?.FullName ?? "ThS. Hoàng Quốc Việt",
                AssignmentType = "Written Assignment",
                SubmissionCount = subCount,
                GradedCount = gradedCount,
                Status = DateTime.UtcNow > a.DueDate ? "overdue" : "active",
                IsAiGradingEnabled = a.IsAiGradingEnabled,
                CreatedAt = DateTime.UtcNow.ToString("dd/MM/yyyy")
            };
        }
    }
}
