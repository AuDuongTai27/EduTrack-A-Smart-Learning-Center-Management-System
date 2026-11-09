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
            var grade = await _context.Classes.AsNoTracking().Where(c => c.ClassId == dto.ClassId).Select(c => c.GradeId).SingleOrDefaultAsync();
            if (grade == null) throw new ArgumentException("Class không tồn tại hoặc chưa phân Grade; cần kiểm tra trước khi lập hóa đơn.");
            var request = new GenerateTuitionDto { Mode = "individual", GradeId = grade.Value, ClassId = dto.ClassId, StudentId = dto.StudentId,
                PeriodMonth = dto.PeriodMonth, PeriodYear = dto.PeriodYear, AmountDue = dto.AmountDue };
            var generator = new TuitionGenerationService(_context);
            var preview = await generator.Preview(request);
            if (preview.Rows.Single().Outcome is not ("eligible" or "already_exists")) throw new ArgumentException(preview.Rows.Single().Reason);
            request.PreviewToken = preview.PreviewToken;
            var result = await generator.Confirm(request);
            var id = result.Rows.Single().InvoiceId ?? throw new InvalidOperationException("Chưa xác nhận được hóa đơn.");
            return MapToDto((await _tuitionRepository.GetByIdAsync(id))!);
        }

        public Task<GenerationPreview> PreviewAsync(GenerateTuitionDto dto) => new TuitionGenerationService(_context).Preview(dto);
        public Task<GenerationPreview> GenerateAsync(GenerateTuitionDto dto) => new TuitionGenerationService(_context).Confirm(dto);

        public async Task<TuitionInvoiceDto?> UpdateTuitionInvoiceAsync(
    int id,
    UpdateTuitionInvoiceDto dto)
        {
            var existing = await _tuitionRepository.GetByIdAsync(id);

            if (existing == null)
            {
                return null;
            }

            await using var editTransaction = await _context.Database.BeginTransactionAsync(IsolationLevel.ReadCommitted);
            await TuitionGenerationService.LockClass(_context, existing.ClassId);
            // Refresh only after taking the lock, so Payment and Edit cannot use stale balances.
            existing = (await _tuitionRepository.GetByIdAsync(id))!;
            if (!TuitionGenerationPolicy.ValidAmount(dto.AmountDue) || dto.PeriodMonth is < 1 or > 12 || dto.PeriodYear is < 2000 or > 2100 || dto.DueDate == default)
                throw new ArgumentException("Kỳ thu, số tiền hoặc hạn nộp không hợp lệ.");
            if (await _context.TuitionInvoices.AnyAsync(i => i.InvoiceId != id && i.StudentId == existing.StudentId && i.ClassId == existing.ClassId && i.PeriodMonth == dto.PeriodMonth && i.PeriodYear == dto.PeriodYear))
                throw new InvalidOperationException("Đã có hóa đơn Student–Class trong kỳ này; không ghi đè hoặc gộp hóa đơn.");
            var totalPaid = existing.Payments.Sum(p => p.Amount);
            var currentStatus = TuitionPolicy.ResolveStatus(existing.AmountDue, totalPaid, existing.DueDate, DateTimeOffset.UtcNow, existing.Status);
            var financialChanged = dto.AmountDue != existing.AmountDue || dto.DueDate.Date != existing.DueDate.Date
                || dto.PeriodMonth != existing.PeriodMonth || dto.PeriodYear != existing.PeriodYear;
            if (dto.Status != null && !string.Equals(dto.Status.Trim(), currentStatus, StringComparison.OrdinalIgnoreCase))
                throw new InvalidOperationException("Trạng thái do hệ thống tính từ thanh toán; không đặt trạng thái hoặc chuyển bước phê duyệt bằng cập nhật trực tiếp.");
            if (financialChanged && (existing.Payments.Any() || currentStatus is "paid" or "pending_adjustment"))
                throw new InvalidOperationException("Hóa đơn đã có khoản thu, đã tất toán hoặc đang chờ điều chỉnh: không sửa tiền/kỳ/hạn trực tiếp. Cần xử lý theo quy trình phê duyệt hiện có.");
            if (!financialChanged)
            {
                // Return the effective status without rewriting stale historical data.
                await editTransaction.CommitAsync();
                return MapToDto(existing);
            }
            var status = TuitionPolicy.ResolveStatus(dto.AmountDue, totalPaid, dto.DueDate, DateTimeOffset.UtcNow, existing.Status);

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

            await editTransaction.CommitAsync();
            return MapToDto(updated ?? updatedInvoice);
        }
        public async Task<PaymentDto> RecordPaymentAsync(
            int invoiceId,
            CreatePaymentDto dto)
        {
            await using var transaction =
            await _context.Database.BeginTransactionAsync(
                IsolationLevel.ReadCommitted
            );
            var invoice =
                await _tuitionRepository.GetByIdAsync(invoiceId);

            if (invoice == null)
            {
                throw new InvalidOperationException(
                    $"Không tìm thấy hóa đơn có ID = {invoiceId}"
                );
            }

            await TuitionGenerationService.LockClass(_context, invoice.ClassId);
            invoice = (await _tuitionRepository.GetByIdAsync(invoiceId))!;
            if (!TuitionPolicy.IsValidAmount(invoice.AmountDue) || invoice.Payments.Any(p => !TuitionPolicy.IsValidAmount(p.Amount)))
                throw new InvalidOperationException("Dữ liệu tiền hóa đơn hoặc khoản thu cũ không hợp lệ; cần đối soát trước khi thu tiếp.");
            if (!TuitionGenerationPolicy.ValidAmount(dto.Amount) || dto.AdditionalChargeAmount < 0 || decimal.Round(dto.AdditionalChargeAmount, 2) != dto.AdditionalChargeAmount
                || invoice.AmountDue + dto.AdditionalChargeAmount > 9999999999.99m)
                throw new ArgumentException("Số tiền hoặc phụ phí không hợp lệ.");
            var paymentMethod =
                dto.PaymentMethod.Trim().ToLowerInvariant();

            if (paymentMethod != "cash" && (!dto.ExternalPaymentVerified || string.IsNullOrWhiteSpace(dto.TransactionCode)))
                throw new ArgumentException("Cần mã giao dịch và xác nhận đối soát khoản thu bên ngoài; không xác nhận cổng online tự động.");
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
            var alreadyPaid = invoice.Payments.Sum(p => p.Amount);

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

            if (remaining == 0)
                throw new InvalidOperationException(
                    "Hóa đơn đã tất toán. Không thu tiếp hoặc tăng học phí qua phụ phí Payment; cần xử lý khoản phát sinh theo quy trình hợp lệ riêng.");

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
                ClassGradeId = invoice.Class?.GradeId,
                ClassGradeName = invoice.Class?.Grade?.GradeName,
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
