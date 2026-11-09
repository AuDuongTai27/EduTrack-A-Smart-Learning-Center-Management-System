using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using EduTrack.API.Models.DTOs;
using EduTrack.API.Models.Entities;
using EduTrack.API.Repositories.Interfaces;
using EduTrack.API.Services.Interfaces;
using EduTrack.API.Services.Management;

namespace EduTrack.API.Services.Implementation
{
    public class TuitionInvoiceService : ITuitionInvoiceService
    {
        private readonly ITuitionInvoiceRepository _repository;

        public TuitionInvoiceService(ITuitionInvoiceRepository repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<TuitionInvoiceDto>> GetAllTuitionInvoicesAsync()
        {
            var list = await _repository.GetAllAsync();
            var now = DateTimeOffset.UtcNow;
            return list.Select(invoice => MapToDto(invoice, now));
        }

        public async Task<TuitionInvoiceDto?> GetTuitionInvoiceByIdAsync(int id)
        {
            var item = await _repository.GetByIdAsync(id);
            return item == null ? null : MapToDto(item, DateTimeOffset.UtcNow);
        }

        private static TuitionInvoiceDto MapToDto(TuitionInvoice x, DateTimeOffset now)
        {
            return new TuitionInvoiceDto
            {
                InvoiceId = x.InvoiceId,
                StudentId = x.StudentId,
                StudentName = x.Student?.FullName ?? string.Empty,
                StudentCode = x.Student?.UserCode ?? string.Empty,
                ClassId = x.ClassId,
                ClassName = x.Class?.ClassName ?? string.Empty,
                ClassGradeId = x.Class?.GradeId,
                ClassGradeName = x.Class?.Grade?.GradeName,
                PeriodMonth = x.PeriodMonth,
                PeriodYear = x.PeriodYear,
                AmountDue = x.AmountDue,
                DueDate = x.DueDate,
                Status = TuitionPolicy.ResolveStatus(
                    x.AmountDue, x.Payments.Sum(payment => payment.Amount), x.DueDate, now, x.Status)
            };
        }
    }
}
