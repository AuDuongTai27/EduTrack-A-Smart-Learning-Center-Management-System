using System.Collections.Generic;
using System.Threading.Tasks;
using EduTrack.API.Models.DTOs;

namespace EduTrack.API.Services.Interfaces
{
    public interface IProgressNoteService
    {
        Task<IEnumerable<ProgressNoteDto>> GetAllProgressNotesAsync();
        Task<ProgressNoteDto?> GetProgressNoteByIdAsync(int id);
    }
}
