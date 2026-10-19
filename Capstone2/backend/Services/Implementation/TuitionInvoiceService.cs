using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using EduTrack.API.Models.DTOs;
using EduTrack.API.Models.Entities;
using EduTrack.API.Repositories.Interfaces;
using EduTrack.API.Services.Interfaces;

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
            return list.Select(MapToDto);
        }

        public async Task<TuitionInvoiceDto?> GetTuitionInvoiceByIdAsync(int id)
        {
            var item = await _repository.GetByIdAsync(id);
            return item == null ? null : MapToDto(item);
        }

        private static TuitionInvoiceDto MapToDto(TuitionInvoice x)
        {
            return new TuitionInvoiceDto
            {
                InvoiceId = x.InvoiceId,
                StudentId = x.StudentId,
                StudentName = x.Student?.FullName ?? string.Empty,
                StudentCode = x.Student?.UserCode ?? string.Empty,
                ClassId = x.ClassId,
                ClassName = x.Class?.ClassName ?? string.Empty,
                AmountDue = x.AmountDue,
                DueDate = x.DueDate,
                Status = x.Status
            };
        }
    }
}
