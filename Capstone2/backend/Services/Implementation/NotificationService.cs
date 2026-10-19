using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using EduTrack.API.Models.DTOs;
using EduTrack.API.Models.Entities;
using EduTrack.API.Repositories.Interfaces;
using EduTrack.API.Services.Interfaces;

namespace EduTrack.API.Services.Implementation
{
    public class NotificationService : INotificationService
    {
        private readonly INotificationRepository _repository;

        public NotificationService(INotificationRepository repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<NotificationDto>> GetAllNotificationsAsync()
        {
            var list = await _repository.GetAllAsync();
            return list.Select(MapToDto);
        }

        public async Task<NotificationDto?> GetNotificationByIdAsync(int id)
        {
            var item = await _repository.GetByIdAsync(id);
            return item == null ? null : MapToDto(item);
        }

        private static NotificationDto MapToDto(Notification x)
        {
            return new NotificationDto
            {
                NotificationId = x.NotificationId,
                UserId = x.UserId,
                UserName = x.User?.FullName,
                ClassId = x.ClassId,
                ClassName = x.Class?.ClassName,
                Title = x.Title,
                Content = x.Content,
                Type = x.Type,
                IsRead = x.IsRead,
                CreatedAt = x.CreatedAt
            };
        }
    }
}
