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

        private async Task<TeachingAssignmentItemDto> MapToDtoAsync(Assignment a)
        {
            var cls = await _context.Classes.FindAsync(a.ClassId);
            var creator = await _context.Users.FindAsync(a.CreatedBy);

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
                SubmissionCount = 0,
                GradedCount = 0,
                Status = "active",
                IsAiGradingEnabled = a.IsAiGradingEnabled,
                CreatedAt = DateTime.UtcNow.ToString("dd/MM/yyyy")
            };
        }
    }
}

