using System;
using System.Threading.Tasks;
using EduTrack.API.Models.DTOs;
using EduTrack.API.Models.DTOs.Teaching;
using EduTrack.API.Models.Entities;
using EduTrack.API.Repositories.Interfaces;
using EduTrack.API.Services.Teaching.Interfaces;

namespace EduTrack.API.Services.Teaching.Implementation
{
    public class TeachingRequestService : ITeachingRequestService
    {
        private readonly IApprovalRequestRepository _approvalRequestRepository;

        public TeachingRequestService(IApprovalRequestRepository approvalRequestRepository)
        {
            _approvalRequestRepository = approvalRequestRepository;
        }

        public async Task<ApprovalRequestDto> CreateTeachingRequestAsync(CreateTeachingRequestDto dto)
        {
            // Bước 1: Khởi tạo Entity với mã tạm để insert vào database lấy RequestId tự tăng
            var entity = new ApprovalRequest
            {
                RequestCode = "TEMP",
                RequestType = dto.RequestType.Trim().ToLowerInvariant(),
                Title = dto.Title.Trim(),
                Description = dto.Description,
                ClassId = dto.ClassId,
                StudentId = dto.StudentId,
                RequestedBy = dto.RequestedBy,
                Priority = string.IsNullOrWhiteSpace(dto.Priority) ? "medium" : dto.Priority.Trim().ToLowerInvariant(),
                Status = "pending",
                Reason = dto.Reason,
                CreatedAt = DateTime.UtcNow
            };

            var added = await _approvalRequestRepository.AddAsync(entity);

            // Bước 2: Sinh RequestCode theo định dạng AR{request_id} (ví dụ: AR0006)
            added.RequestCode = $"AR{added.RequestId:D4}";
            await _approvalRequestRepository.UpdateAsync(added);

            var loaded = await _approvalRequestRepository.GetByIdAsync(added.RequestId);
            return MapToDto(loaded ?? added);
        }

        private static ApprovalRequestDto MapToDto(ApprovalRequest x)
        {
            return new ApprovalRequestDto
            {
                RequestId = x.RequestId,
                RequestCode = x.RequestCode,
                RequestType = x.RequestType,
                Title = x.Title,
                Description = x.Description,
                StudentId = x.StudentId,
                StudentName = x.Student?.FullName,
                InvoiceId = x.InvoiceId,
                ClassId = x.ClassId,
                ClassName = x.Class?.ClassName,
                RequestedBy = x.RequestedBy,
                RequesterName = x.Requester?.FullName ?? string.Empty,
                ReviewedBy = x.ReviewedBy,
                ReviewerName = x.Reviewer?.FullName,
                Priority = x.Priority,
                Status = x.Status,
                Reason = x.Reason,
                CreatedAt = x.CreatedAt,
                ReviewedAt = x.ReviewedAt,
                ReviewNotes = x.ReviewNotes
            };
        }
    }
}
