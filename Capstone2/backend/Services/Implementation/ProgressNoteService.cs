using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using EduTrack.API.Models.DTOs;
using EduTrack.API.Models.Entities;
using EduTrack.API.Repositories.Interfaces;
using EduTrack.API.Services.Interfaces;

namespace EduTrack.API.Services.Implementation
{
    public class ProgressNoteService : IProgressNoteService
    {
        private readonly IProgressNoteRepository _repository;

        public ProgressNoteService(IProgressNoteRepository repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<ProgressNoteDto>> GetAllProgressNotesAsync()
        {
            var list = await _repository.GetAllAsync();
            return list.Select(MapToDto);
        }

        public async Task<ProgressNoteDto?> GetProgressNoteByIdAsync(int id)
        {
            var item = await _repository.GetByIdAsync(id);
            return item == null ? null : MapToDto(item);
        }

        private static ProgressNoteDto MapToDto(ProgressNote x)
        {
            return new ProgressNoteDto
            {
                NoteId = x.NoteId,
                StudentId = x.StudentId,
                StudentName = x.Student?.FullName ?? string.Empty,
                StudentCode = x.Student?.UserCode ?? string.Empty,
                ClassId = x.ClassId,
                ClassName = x.Class?.ClassName ?? string.Empty,
                WrittenBy = x.WrittenBy,
                AuthorName = x.Author?.FullName ?? string.Empty,
                Content = x.Content,
                NoteType = x.NoteType,
                CreatedAt = x.CreatedAt
            };
        }
    }
}
