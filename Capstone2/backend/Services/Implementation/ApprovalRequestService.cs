using System;
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
            var statusLower = (x.Status ?? "pending").Trim().ToLowerInvariant();
            bool canEdit = statusLower == "pending" && x.ReviewedBy == null;

            string statusLabel;
            if (statusLower == "approved")
            {
                statusLabel = "Approved";
            }
            else if (statusLower == "rejected")
            {
                statusLabel = "Rejected";
            }
            else if (x.ReviewedBy != null)
            {
                statusLabel = "Pending";
            }
            else
            {
                statusLabel = "Chờ phê duyệt";
            }

            var requesterRole = x.Requester?.UserRoles?
                .Select(ur => ur.Role?.RoleName)
                .FirstOrDefault(r => !string.IsNullOrWhiteSpace(r));

            if (string.IsNullOrWhiteSpace(requesterRole))
            {
                var code = x.Requester?.UserCode ?? string.Empty;
                if (code.StartsWith("PAR", StringComparison.OrdinalIgnoreCase) || x.RequestedBy is 9 or 10)
                    requesterRole = "parent";
                else if (code.StartsWith("STU", StringComparison.OrdinalIgnoreCase) || x.RequestedBy is 6 or 7 or 8)
                    requesterRole = "student";
                else if (code.StartsWith("TEA", StringComparison.OrdinalIgnoreCase) || x.RequestedBy is 3 or 4)
                    requesterRole = "teacher";
                else if (code.StartsWith("TA", StringComparison.OrdinalIgnoreCase) || x.RequestedBy == 5)
                    requesterRole = "ta";
                else if (x.RequestedBy == 2)
                    requesterRole = "admin_staff";
                else if (x.RequestedBy == 1)
                    requesterRole = "center_manager";
            }

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
                RequesterRole = requesterRole,
                ReviewedBy = x.ReviewedBy,
                ReviewerName = x.Reviewer?.FullName,
                Priority = x.Priority ?? "medium",
                Status = x.Status ?? "pending",
                StatusLabel = statusLabel,
                CanEdit = canEdit,
                Reason = x.Reason,
                CreatedAt = x.CreatedAt,
                ReviewedAt = x.ReviewedAt,
                ReviewNotes = x.ReviewNotes
            };
        }
    }
}
