using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using EduTrack.API.Models.EF;
using EduTrack.API.Models.Entities;
using EduTrack.API.Repositories.Interfaces;

namespace EduTrack.API.Repositories.Implementation
{
    /// <summary>
    /// UserRoleRepository kế thừa GenericRepository<UserRole>.
    /// </summary>
    public class UserRoleRepository : GenericRepository<UserRole>, IUserRoleRepository
    {
        public UserRoleRepository(EduTrackDbContext context) : base(context)
        {
        }

        public override async Task<IEnumerable<UserRole>> GetAllAsync()
        {
            return await _dbSet
                .AsNoTracking()
                .Include(ur => ur.User)
                .Include(ur => ur.Role)
                .ToListAsync();
        }

        public override async Task<UserRole?> GetByIdAsync(int id)
        {
            return await _dbSet
                .AsNoTracking()
                .Include(ur => ur.User)
                .Include(ur => ur.Role)
                .FirstOrDefaultAsync(ur => ur.UserRoleId == id);
        }
    }
}
