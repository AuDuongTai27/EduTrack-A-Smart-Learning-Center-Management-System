using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using EduTrack.API.Models.DTOs;
using EduTrack.API.Models.Entities;
using EduTrack.API.Repositories.Interfaces;
using EduTrack.API.Services.Interfaces;

namespace EduTrack.API.Services.Implementation
{
    public class PaymentService : IPaymentService
    {
        private readonly IPaymentRepository _repository;

        public PaymentService(IPaymentRepository repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<PaymentDto>> GetAllPaymentsAsync()
        {
            var list = await _repository.GetAllAsync();
            return list.Select(MapToDto);
        }

        public async Task<PaymentDto?> GetPaymentByIdAsync(int id)
        {
            var item = await _repository.GetByIdAsync(id);
            return item == null ? null : MapToDto(item);
        }

        private static PaymentDto MapToDto(Payment x)
        {
            return new PaymentDto
            {
                PaymentId = x.PaymentId,
                InvoiceId = x.InvoiceId,
                Amount = x.Amount,
                PaymentMethod = x.PaymentMethod,
                TransactionCode = x.TransactionCode,
                PaidAt = x.PaidAt,
                PaidByUserId = x.PaidByUserId,
                PayerName = x.Payer?.FullName,
                RecordedBy = x.RecordedBy,
                RecorderName = x.Recorder?.FullName,
                Note = x.Note
            };
        }
    }
}
