using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using EduTrack.API.Models.EF;
using EduTrack.API.Models.Entities;
using EduTrack.API.Repositories.Interfaces;

namespace EduTrack.API.Repositories.Implementation
{
    public class NotificationRepository : GenericRepository<Notification>, INotificationRepository
    {
        public NotificationRepository(EduTrackDbContext context) : base(context)
        {
        }

        public override async Task<IEnumerable<Notification>> GetAllAsync()
        {
            return await _dbSet
                .AsNoTracking()
                .Include(n => n.User)
                .Include(n => n.Class)
                .ToListAsync();
        }

        public override async Task<Notification?> GetByIdAsync(int id)
        {
            return await _dbSet
                .AsNoTracking()
                .Include(n => n.User)
                .Include(n => n.Class)
                .FirstOrDefaultAsync(x => x.NotificationId == id);
        }
    }
}
