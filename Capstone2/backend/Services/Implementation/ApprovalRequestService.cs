using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using EduTrack.API.Models.DTOs;
using EduTrack.API.Models.Entities;
using EduTrack.API.Repositories.Interfaces;
using EduTrack.API.Services.Interfaces;

namespace EduTrack.API.Services.Implementation
{
    public class ApprovalRequestService : IApprovalRequestService
    {
        private readonly IApprovalRequestRepository _repository;

        public ApprovalRequestService(IApprovalRequestRepository repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<ApprovalRequestDto>> GetAllApprovalRequestsAsync()
        {
            var list = await _repository.GetAllAsync();
            return list.Select(MapToDto);
        }

        public async Task<ApprovalRequestDto?> GetApprovalRequestByIdAsync(int id)
        {
            var item = await _repository.GetByIdAsync(id);
            return item == null ? null : MapToDto(item);
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
