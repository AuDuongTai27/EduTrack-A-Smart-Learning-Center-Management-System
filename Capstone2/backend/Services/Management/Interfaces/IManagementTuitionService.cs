using System.Threading.Tasks;
using EduTrack.API.Models.DTOs;
using EduTrack.API.Models.DTOs.Management;

namespace EduTrack.API.Services.Management.Interfaces
{
    public interface IManagementTuitionService
    {
        Task<TuitionInvoiceDto> CreateTuitionInvoiceAsync(
            CreateTuitionInvoiceDto dto
        );

        Task<TuitionInvoiceDto?> UpdateTuitionInvoiceAsync(
            int id,
            UpdateTuitionInvoiceDto dto
        );

        Task<PaymentDto> RecordPaymentAsync(
            int invoiceId,
            CreatePaymentDto dto
        );
    }
}