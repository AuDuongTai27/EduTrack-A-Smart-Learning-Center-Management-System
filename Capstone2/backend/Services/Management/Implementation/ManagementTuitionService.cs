using System;
using System.Linq;
using System.Threading.Tasks;
using EduTrack.API.Models.DTOs;
using EduTrack.API.Models.DTOs.Management;
using EduTrack.API.Models.Entities;
using EduTrack.API.Repositories.Interfaces;
using EduTrack.API.Services.Management.Interfaces;

namespace EduTrack.API.Services.Management.Implementation
{
    public class ManagementTuitionService : IManagementTuitionService
    {
        private readonly ITuitionInvoiceRepository _tuitionRepository;
        private readonly IUserRepository _userRepository;
        private readonly IClassRepository _classRepository;
        private readonly IPaymentRepository _paymentRepository;

        public ManagementTuitionService(
    ITuitionInvoiceRepository tuitionRepository,
    IUserRepository userRepository,
    IClassRepository classRepository,
    IPaymentRepository paymentRepository)
        {
            _tuitionRepository = tuitionRepository;
            _userRepository = userRepository;
            _classRepository = classRepository;
            _paymentRepository = paymentRepository;
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
                DueDate = dto.DueDate,
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

            if (remaining <= 0)
            {
                throw new InvalidOperationException(
                    "Hóa đơn này đã được thanh toán đầy đủ."
                );
            }

            if (dto.Amount > remaining)
            {
                throw new InvalidOperationException(
                    $"Số tiền thanh toán vượt quá công nợ còn lại ({remaining:N0} VND)."
                );
            }

            var payment = new Payment
            {
                InvoiceId = invoiceId,
                Amount = dto.Amount,
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

            var newStatus =
                totalPaid >= invoice.AmountDue
                    ? "paid"
                    : invoice.DueDate.Date < DateTime.UtcNow.Date
                        ? "overdue"
                        : "unpaid";

            var updatedInvoice = new TuitionInvoice
            {
                InvoiceId = invoice.InvoiceId,
                StudentId = invoice.StudentId,
                ClassId = invoice.ClassId,
                PeriodMonth = invoice.PeriodMonth,
                PeriodYear = invoice.PeriodYear,
                AmountDue = invoice.AmountDue,
                DueDate = invoice.DueDate,
                Status = newStatus
            };

            await _tuitionRepository.UpdateAsync(updatedInvoice);

            var loadedPayment =
                await _paymentRepository.GetByIdAsync(
                    added.PaymentId
                );

            return MapPaymentToDto(
                loadedPayment ?? added
            );
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
                AmountDue = invoice.AmountDue,
                DueDate = invoice.DueDate,
                Status = invoice.Status
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
                PaymentMethod = payment.PaymentMethod,
                TransactionCode = payment.TransactionCode,
                PaidAt = payment.PaidAt,
                PaidByUserId = payment.PaidByUserId,
                PayerName = payment.Payer?.FullName,
                RecordedBy = payment.RecordedBy,
                RecorderName = payment.Recorder?.FullName,
                Note = payment.Note
            };
        }
    }
}