using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using EduTrack.API.Models.DTOs;
using EduTrack.API.Models.DTOs.Management;
using EduTrack.API.Models.Entities;
using EduTrack.API.Repositories.Interfaces;
using EduTrack.API.Services.Interfaces;
using EduTrack.API.Services.Management.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace EduTrack.API.Services.Management.Implementation
{
    public class ManagementApprovalRequestService : IManagementApprovalRequestService
    {
        private static readonly HashSet<string> AllowedTypes = new(StringComparer.Ordinal)
        {
            "tuition_adjustment", "due_date_extension", "refund_request",
            "student_information_change", "other", "academic_support",
            "class_transfer", "leave_request", "feedback"
        };

        private readonly IApprovalRequestRepository _requestRepository;
        private readonly IUserRepository _userRepository;
        private readonly IClassRepository _classRepository;
        private readonly ITuitionInvoiceRepository _invoiceRepository;
        private readonly IApprovalRequestService _queryService;

        public ManagementApprovalRequestService(
            IApprovalRequestRepository requestRepository,
            IUserRepository userRepository,
            IClassRepository classRepository,
            ITuitionInvoiceRepository invoiceRepository,
            IApprovalRequestService queryService)
        {
            _requestRepository = requestRepository;
            _userRepository = userRepository;
            _classRepository = classRepository;
            _invoiceRepository = invoiceRepository;
            _queryService = queryService;
        }

        public async Task<ApprovalRequestDto> CreateAsync(CreateApprovalRequestDto dto)
        {
            await EnsureRoleAsync(dto.RequestedBy, "admin_staff", "gửi yêu cầu");

            var type = NormalizeType(dto.RequestType);
            if (!AllowedTypes.Contains(type))
                throw new InvalidOperationException("Loại yêu cầu không hợp lệ.");

            var priority = dto.Priority?.Trim().ToLowerInvariant() ?? "";
            if (priority is not ("low" or "medium" or "high"))
                throw new InvalidOperationException("Độ ưu tiên phải là low, medium hoặc high.");

            if (string.IsNullOrWhiteSpace(dto.Title) || string.IsNullOrWhiteSpace(dto.Reason))
                throw new InvalidOperationException("Vui lòng nhập tiêu đề và lý do yêu cầu.");

            // Financial requests must be tied to an actual invoice so they can be audited.
            if ((type is "tuition_adjustment" or "refund_request" or "due_date_extension")
                && !dto.InvoiceId.HasValue)
                throw new InvalidOperationException("Yêu cầu học phí cần chọn hóa đơn (InvoiceId).");

            if (type == "student_information_change" && !dto.StudentId.HasValue)
                throw new InvalidOperationException("Yêu cầu thay đổi thông tin cần chọn học viên.");

            if (dto.StudentId.HasValue)
            {
                var student = await _userRepository.GetByIdAsync(dto.StudentId.Value);
                if (student == null || !HasRole(student, "student"))
                    throw new InvalidOperationException("StudentId không phải học viên hợp lệ.");
            }

            if (dto.ClassId.HasValue &&
                await _classRepository.GetByIdAsync(dto.ClassId.Value) == null)
                throw new InvalidOperationException("Không tìm thấy lớp học được chọn.");

            int? studentId = dto.StudentId;
            int? classId = dto.ClassId;

            if (dto.InvoiceId.HasValue)
            {
                var invoice = await _invoiceRepository.GetByIdAsync(dto.InvoiceId.Value);
                if (invoice == null)
                    throw new InvalidOperationException("Không tìm thấy hóa đơn được chọn.");
                if (studentId.HasValue && invoice.StudentId != studentId.Value)
                    throw new InvalidOperationException("Hóa đơn không thuộc học viên được chọn.");
                if (classId.HasValue && invoice.ClassId != classId.Value)
                    throw new InvalidOperationException("Hóa đơn không thuộc lớp được chọn.");

                // If the user selects an invoice, link its actual student and class.
                studentId ??= invoice.StudentId;
                classId ??= invoice.ClassId;
            }

            // Existing schema has a unique index on request_code; GUID avoids a separate counter.
            var request = new ApprovalRequest
            {
                RequestCode = "AR" + Guid.NewGuid().ToString("N")[..12].ToUpperInvariant(),
                RequestType = type,
                Title = dto.Title.Trim(),
                Reason = dto.Reason.Trim(),
                Description = string.IsNullOrWhiteSpace(dto.Description)
                    ? dto.Reason.Trim()
                    : dto.Description.Trim(),
                StudentId = studentId,
                ClassId = classId,
                InvoiceId = dto.InvoiceId,
                RequestedBy = dto.RequestedBy,
                Priority = priority,
                Status = "pending",
                CreatedAt = DateTime.UtcNow
            };

            var created = await _requestRepository.AddAsync(request);
            return await _queryService.GetApprovalRequestByIdAsync(created.RequestId)
                   ?? throw new InvalidOperationException("Không tải được yêu cầu vừa tạo.");
        }

        public async Task<ApprovalRequestDto?> ReviewAsync(int id, ReviewApprovalRequestDto dto)
        {
            await EnsureRoleAsync(dto.ReviewedBy, "center_manager", "duyệt yêu cầu");
            var status = dto.Status?.Trim().ToLowerInvariant() ?? "";
            if (status is not ("approved" or "rejected"))
                throw new InvalidOperationException("Chỉ được chọn approved hoặc rejected.");

            var reviewNotes = dto.ReviewNotes?.Trim();
            if (status == "rejected" && string.IsNullOrWhiteSpace(reviewNotes))
                throw new InvalidOperationException("Khi từ chối phải nhập lý do.");

            var existing = await _requestRepository.GetByIdAsync(id);
            if (existing == null) return null;

            if (!string.Equals(existing.Status, "pending", StringComparison.OrdinalIgnoreCase))
                throw new InvalidOperationException("Yêu cầu đã được xử lý và không thể duyệt lại.");

            if (existing.RequestedBy == dto.ReviewedBy)
                throw new InvalidOperationException("Người tạo yêu cầu không được tự phê duyệt.");

            // Atomic conditional UPDATE: concurrent reviewers cannot both win.
            var updated = await _requestRepository.TryReviewPendingAsync(
                id, status, dto.ReviewedBy, reviewNotes, DateTime.UtcNow);

            if (!updated)
                throw new DbUpdateConcurrencyException(
                    "Yêu cầu đã được người khác xử lý. Vui lòng tải lại danh sách.");

            // Deliberately does NOT change an invoice or student record.
            return await _queryService.GetApprovalRequestByIdAsync(id)
                   ?? throw new InvalidOperationException("Không tải được yêu cầu sau khi duyệt.");
        }

        private async Task EnsureRoleAsync(int userId, string role, string action)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null || !HasRole(user, role) ||
                !string.Equals(user.Status, "active", StringComparison.OrdinalIgnoreCase))
            {
                throw new InvalidOperationException(
                    $"Tài khoản không hợp lệ hoặc không có quyền {action} ({role}).");
            }
        }

        private static bool HasRole(User user, string role) =>
            user.UserRoles.Any(ur => ur.Role != null &&
                string.Equals(ur.Role.RoleName, role, StringComparison.OrdinalIgnoreCase));

        private static string NormalizeType(string value)
        {
            var t = (value ?? "").Trim().ToLowerInvariant()
                .Replace('-', '_').Replace(' ', '_');
            return t switch
            {
                "refund" => "refund_request",
                "student_info_change" => "student_information_change",
                "academic" => "academic_support",
                _ => t
            };
        }
    }
}
