using System;
using System.Linq;
using System.Threading.Tasks;
using EduTrack.API.Models.DTOs;
using EduTrack.API.Models.DTOs.Management;
using EduTrack.API.Models.Entities;
using EduTrack.API.Repositories.Interfaces;
using EduTrack.API.Services.Management.Interfaces;
using System.Data;
using EduTrack.API.Models.EF;
using Microsoft.EntityFrameworkCore;

namespace EduTrack.API.Services.Management.Implementation
{
    public class ManagementTuitionService : IManagementTuitionService
    {
        private readonly ITuitionInvoiceRepository _tuitionRepository;
        private readonly IUserRepository _userRepository;
        private readonly IClassRepository _classRepository;
        private readonly IPaymentRepository _paymentRepository;
        private readonly EduTrackDbContext _context;

        public ManagementTuitionService(
    ITuitionInvoiceRepository tuitionRepository,
    IUserRepository userRepository,
    IClassRepository classRepository,
    IPaymentRepository paymentRepository,
    EduTrackDbContext context)
        {
            _tuitionRepository = tuitionRepository;
            _userRepository = userRepository;
            _classRepository = classRepository;
            _paymentRepository = paymentRepository;
            _context = context;
        }

        public async Task<TuitionInvoiceDto> CreateTuitionInvoiceAsync(
            CreateTuitionInvoiceDto dto)
        {
            var student = await _userRepository.GetByIdAsync(dto.StudentId);

            if (student == null)
            {
                throw new InvalidOperationException(
                    $"Không tìm thấy học viên có ID = {dto.StudentId}"
                );
            }

            var isStudent = student.UserRoles.Any(
                ur => ur.Role != null &&
                      ur.Role.RoleName.ToLower() == "student"
            );

            if (!isStudent)
            {
                throw new InvalidOperationException(
                    $"User ID = {dto.StudentId} không phải học viên."
                );
            }

            var classItem = await _classRepository.GetByIdAsync(dto.ClassId);

            if (classItem == null)
            {
                throw new InvalidOperationException(
                    $"Không tìm thấy lớp học có ID = {dto.ClassId}"
                );
            }

            var invoice = new TuitionInvoice
            {
                StudentId = dto.StudentId,
                ClassId = dto.ClassId,
                PeriodMonth = dto.PeriodMonth,
                PeriodYear = dto.PeriodYear,
                AmountDue = dto.AmountDue,
                DueDate = TuitionPolicy.DueDateForCreation(DateTimeOffset.UtcNow),
                Status = "unpaid"
            };

            var added = await _tuitionRepository.AddAsync(invoice);

            var loaded =
                await _tuitionRepository.GetByIdAsync(added.InvoiceId);

            return MapToDto(loaded ?? added);
        }

        public async Task<TuitionInvoiceDto?> UpdateTuitionInvoiceAsync(
    int id,
    UpdateTuitionInvoiceDto dto)
        {
            var existing = await _tuitionRepository.GetByIdAsync(id);

            if (existing == null)
            {
                return null;
            }

            var status = dto.Status.Trim().ToLowerInvariant();

            var validStatuses = new[]
            {
        "unpaid",
        "paid",
        "overdue",
        "pending_adjustment"
    };

            if (!validStatuses.Contains(status))
            {
                throw new InvalidOperationException(
                    "Trạng thái hóa đơn không hợp lệ."
                );
            }

            var payments = await _paymentRepository.GetAllAsync();

            var totalPaid = payments
                .Where(p => p.InvoiceId == id)
                .Sum(p => p.Amount);

            if (dto.AmountDue < totalPaid)
            {
                throw new InvalidOperationException(
                    "Số tiền phải thu không thể nhỏ hơn tổng đã thanh toán."
                );
            }

            if (status == "paid" && totalPaid < dto.AmountDue)
            {
                throw new InvalidOperationException(
                    "Không thể đánh dấu Paid khi chưa thanh toán đủ."
                );
            }

            status = TuitionPolicy.ResolveStatus(
                dto.AmountDue, totalPaid, dto.DueDate, DateTimeOffset.UtcNow, status);

            var updatedInvoice = new TuitionInvoice
            {
                InvoiceId = existing.InvoiceId,

                StudentId = existing.StudentId,
                ClassId = existing.ClassId,

                PeriodMonth = dto.PeriodMonth,
                PeriodYear = dto.PeriodYear,
                AmountDue = dto.AmountDue,
                DueDate = dto.DueDate,
                Status = status
            };

            await _tuitionRepository.UpdateAsync(updatedInvoice);

            var updated =
                await _tuitionRepository.GetByIdAsync(id);

            return MapToDto(updated ?? updatedInvoice);
        }
        public async Task<PaymentDto> RecordPaymentAsync(
            int invoiceId,
            CreatePaymentDto dto)
        {
            await using var transaction =
            await _context.Database.BeginTransactionAsync(
                IsolationLevel.Serializable
            );
            var invoice =
                await _tuitionRepository.GetByIdAsync(invoiceId);

            if (invoice == null)
            {
                throw new InvalidOperationException(
                    $"Không tìm thấy hóa đơn có ID = {invoiceId}"
                );
            }

            var paymentMethod =
                dto.PaymentMethod.Trim().ToLowerInvariant();

            var validMethods = new[]
            {
                "cash",
                "bank_transfer",
                "vnpay",
                "momo"
            };

            if (!validMethods.Contains(paymentMethod))
            {
                throw new InvalidOperationException(
                    "Phương thức thanh toán không hợp lệ."
                );
            }

            if (dto.PaidByUserId.HasValue)
            {
                var payer =
                    await _userRepository.GetByIdAsync(
                        dto.PaidByUserId.Value
                    );

                if (payer == null)
                {
                    throw new InvalidOperationException(
                        $"Không tìm thấy người thanh toán ID = {dto.PaidByUserId}"
                    );
                }
            }

            if (dto.RecordedBy.HasValue)
            {
                var recorder =
                    await _userRepository.GetByIdAsync(
                        dto.RecordedBy.Value
                    );

                if (recorder == null)
                {
                    throw new InvalidOperationException(
                        $"Không tìm thấy nhân viên ID = {dto.RecordedBy}"
                    );
                }
            }

            // Tổng số tiền đã thanh toán trước đó
            var payments =
                await _paymentRepository.GetAllAsync();

            var alreadyPaid = payments
                .Where(p => p.InvoiceId == invoiceId)
                .Sum(p => p.Amount);

            var remaining = invoice.AmountDue - alreadyPaid;
            var extra = dto.AdditionalChargeAmount;

            if (dto.Amount <= 0)
                throw new InvalidOperationException(
                    "Số tiền thanh toán phải lớn hơn 0.");

            if (extra < 0)
                throw new InvalidOperationException(
                    "Phí bổ sung không được âm.");

            if (extra > 0 &&
                string.IsNullOrWhiteSpace(dto.AdditionalChargeNote))
                throw new InvalidOperationException(
                    "Phải nhập lý do thu thêm phí.");

            if (remaining < 0)
                throw new InvalidOperationException(
                    "Công nợ không hợp lệ, cần kiểm tra lại.");

            if (remaining == 0 && extra == 0)
                throw new InvalidOperationException(
                    "Hóa đơn đã thanh toán đầy đủ.");

            if (extra > dto.Amount)
                throw new InvalidOperationException(
                    "Phí bổ sung không thể lớn hơn tiền thanh toán.");

            if (dto.Amount > remaining + extra)
                throw new InvalidOperationException(
                    "Số tiền vượt quá công nợ và phí bổ sung.");

            var newAmountDue = invoice.AmountDue + extra;

            var payment = new Payment
            {
                InvoiceId = invoiceId,
                Amount = dto.Amount,
                AdditionalChargeAmount = extra,
                AdditionalChargeNote = extra > 0
    ? dto.AdditionalChargeNote!.Trim()
    : null,
                PaymentMethod = paymentMethod,
                TransactionCode =
                    string.IsNullOrWhiteSpace(dto.TransactionCode)
                        ? null
                        : dto.TransactionCode.Trim(),
                PaidAt = DateTime.UtcNow,
                PaidByUserId = dto.PaidByUserId,
                RecordedBy = dto.RecordedBy,
                Note = string.IsNullOrWhiteSpace(dto.Note)
                    ? null
                    : dto.Note.Trim()
            };

            var added =
                await _paymentRepository.AddAsync(payment);

            // Sau khi payment được lưu, tính trạng thái mới
            var totalPaid = alreadyPaid + dto.Amount;

            var newStatus = TuitionPolicy.ResolveStatus(
                newAmountDue, totalPaid, invoice.DueDate, DateTimeOffset.UtcNow, invoice.Status);

            var updatedInvoice = new TuitionInvoice
            {
                InvoiceId = invoice.InvoiceId,
                StudentId = invoice.StudentId,
                ClassId = invoice.ClassId,
                PeriodMonth = invoice.PeriodMonth,
                PeriodYear = invoice.PeriodYear,
                AmountDue = newAmountDue,
                DueDate = invoice.DueDate,
                Status = newStatus
            };

            await _tuitionRepository.UpdateAsync(updatedInvoice);

            var loadedPayment =
                await _paymentRepository.GetByIdAsync(
                    added.PaymentId
                );

            var paymentDto = MapPaymentToDto(loadedPayment ?? added);

            await transaction.CommitAsync();

            return paymentDto;
        }

        private static TuitionInvoiceDto MapToDto(
            TuitionInvoice invoice)
        {
            return new TuitionInvoiceDto
            {
                InvoiceId = invoice.InvoiceId,
                StudentId = invoice.StudentId,
                StudentName = invoice.Student?.FullName ?? string.Empty,
                StudentCode = invoice.Student?.UserCode ?? string.Empty,
                ClassId = invoice.ClassId,
                ClassName = invoice.Class?.ClassName ?? string.Empty,
                PeriodMonth = invoice.PeriodMonth,
                PeriodYear = invoice.PeriodYear,
                AmountDue = invoice.AmountDue,
                DueDate = invoice.DueDate,
                Status = TuitionPolicy.ResolveStatus(
                    invoice.AmountDue, invoice.Payments.Sum(payment => payment.Amount),
                    invoice.DueDate, DateTimeOffset.UtcNow, invoice.Status)
            };
        }
        private static PaymentDto MapPaymentToDto(
    Payment payment)
        {
            return new PaymentDto
            {
                PaymentId = payment.PaymentId,
                InvoiceId = payment.InvoiceId,
                Amount = payment.Amount,
                AdditionalChargeAmount = payment.AdditionalChargeAmount,
                AdditionalChargeNote = payment.AdditionalChargeNote,
                PaymentMethod = payment.PaymentMethod,
                TransactionCode = payment.TransactionCode,
                // Keep the response timezone explicit, including after a MySQL reload.
                PaidAt = DateTime.SpecifyKind(payment.PaidAt, DateTimeKind.Utc),
                PaidByUserId = payment.PaidByUserId,
                PayerName = payment.Payer?.FullName,
                RecordedBy = payment.RecordedBy,
                RecorderName = payment.Recorder?.FullName,
                Note = payment.Note
            };
        }
    }
}
