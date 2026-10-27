using System;
using System.Threading.Tasks;
using EduTrack.API.Models.DTOs;
using EduTrack.API.Models.DTOs.Management;
using EduTrack.API.Models.Entities;
using EduTrack.API.Repositories.Interfaces;
using EduTrack.API.Services.Management.Interfaces;

namespace EduTrack.API.Services.Management.Implementation
{
    public class ManagementClassService : IManagementClassService
    {
        private readonly IClassRepository _repository;

        public ManagementClassService(IClassRepository repository)
        {
            _repository = repository;
        }

        public async Task<ClassDto> CreateClassAsync(CreateClassDto dto)
        {
            var newClass = new Class
            {
                ClassName = dto.ClassName.Trim(),
                SubjectId = dto.SubjectId,
                Room = string.IsNullOrWhiteSpace(dto.Room) ? null : dto.Room.Trim(),
                TuitionFee = dto.TuitionFee,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                Status = string.IsNullOrWhiteSpace(dto.Status) ? "active" : dto.Status.Trim().ToLowerInvariant()
            };

            var added = await _repository.AddAsync(newClass);
            var loaded = await _repository.GetByIdAsync(added.ClassId);
            return MapToDto(loaded ?? added);
        }

        public async Task<ClassDto?> UpdateClassAsync(int id, UpdateClassDto dto)
        {
            var existing = await _repository.GetByIdAsync(id);
            if (existing == null) return null;

            existing.ClassName = dto.ClassName.Trim();
            existing.SubjectId = dto.SubjectId;
            existing.Room = string.IsNullOrWhiteSpace(dto.Room) ? null : dto.Room.Trim();
            existing.TuitionFee = dto.TuitionFee;
            existing.StartDate = dto.StartDate;
            existing.EndDate = dto.EndDate;
            existing.Status = string.IsNullOrWhiteSpace(dto.Status) ? "active" : dto.Status.Trim().ToLowerInvariant();

            await _repository.UpdateAsync(existing);
            var updated = await _repository.GetByIdAsync(id);
            return MapToDto(updated ?? existing);
        }

        public async Task<(bool Success, string Message)> DeleteClassAsync(int id)
        {
            try
            {
                var success = await _repository.DeleteAsync(id);
                if (!success)
                {
                    return (false, $"Không tìm thấy lớp học có ID = {id}");
                }
                return (true, "Xóa lớp học thành công.");
            }
            catch (InvalidOperationException ex)
            {
                return (false, ex.Message);
            }
            catch (Exception ex)
            {
                return (false, $"Lỗi khi xóa lớp học: {ex.Message}");
            }
        }

        private static ClassDto MapToDto(Class x)
        {
            return new ClassDto
            {
                ClassId = x.ClassId,
                ClassName = x.ClassName,
                SubjectId = x.SubjectId,
                SubjectName = x.Subject?.SubjectName ?? string.Empty,
                SubjectCode = x.Subject?.SubjectCode ?? string.Empty,
                Room = x.Room,
                TuitionFee = x.TuitionFee,
                StartDate = x.StartDate,
                EndDate = x.EndDate,
                Status = x.Status
            };
        }
    }
}
