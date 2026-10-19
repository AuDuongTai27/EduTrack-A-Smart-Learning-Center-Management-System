using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using EduTrack.API.Models.DTOs;
using EduTrack.API.Models.Entities;
using EduTrack.API.Repositories.Interfaces;
using EduTrack.API.Services.Interfaces;

namespace EduTrack.API.Services.Implementation
{
    public class ContentUnitService : IContentUnitService
    {
        private readonly IContentUnitRepository _repository;

        public ContentUnitService(IContentUnitRepository repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<ContentUnitDto>> GetAllContentUnitsAsync()
        {
            var list = await _repository.GetAllAsync();
            return list.Select(MapToDto);
        }

        public async Task<ContentUnitDto?> GetContentUnitByIdAsync(int id)
        {
            var item = await _repository.GetByIdAsync(id);
            return item == null ? null : MapToDto(item);
        }

        private static ContentUnitDto MapToDto(ContentUnit x)
        {
            return new ContentUnitDto
            {
                ContentUnitId = x.ContentUnitId,
                ClassId = x.ClassId,
                ClassName = x.Class?.ClassName ?? string.Empty,
                ParentUnitId = x.ParentUnitId,
                ParentUnitTitle = x.ParentUnit?.Title,
                Title = x.Title,
                UnitType = x.UnitType,
                Description = x.Description,
                OrderIndex = x.OrderIndex
            };
        }
    }
}
