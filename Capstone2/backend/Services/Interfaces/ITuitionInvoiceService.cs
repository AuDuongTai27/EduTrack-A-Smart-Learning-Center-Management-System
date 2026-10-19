using System.Collections.Generic;
using System.Threading.Tasks;
using EduTrack.API.Models.DTOs;

namespace EduTrack.API.Services.Interfaces
{
    public interface ITuitionInvoiceService
    {
        Task<IEnumerable<TuitionInvoiceDto>> GetAllTuitionInvoicesAsync();
        Task<TuitionInvoiceDto?> GetTuitionInvoiceByIdAsync(int id);
    }
}
