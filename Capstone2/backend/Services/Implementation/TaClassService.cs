using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using EduTrack.API.Models.DTOs;
using EduTrack.API.Models.Entities;
using EduTrack.API.Repositories.Interfaces;
using EduTrack.API.Services.Interfaces;

namespace EduTrack.API.Services.Implementation
{
    public class TaClassService : ITaClassService
    {
        private readonly ITaClassRepository _repository;

        public TaClassService(ITaClassRepository repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<TaClassDto>> GetAllTaClassesAsync()
        {
            var list = await _repository.GetAllAsync();
            return list.Select(MapToDto);
        }

        public async Task<TaClassDto?> GetTaClassByIdAsync(int id)
        {
            var item = await _repository.GetByIdAsync(id);
            return item == null ? null : MapToDto(item);
        }

        private static TaClassDto MapToDto(TaClass x)
        {
            return new TaClassDto
            {
                TaClassId = x.TaClassId,
                TaId = x.TaId,
                TaName = x.Ta?.FullName ?? string.Empty,
                TaCode = x.Ta?.UserCode ?? string.Empty,
                ClassId = x.ClassId,
                ClassName = x.Class?.ClassName ?? string.Empty,
                AssignedAt = x.AssignedAt,
                Status = x.Status
            };
        }
    }
}
