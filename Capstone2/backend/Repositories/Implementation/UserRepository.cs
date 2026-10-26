using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using EduTrack.API.Models.EF;
using EduTrack.API.Models.Entities;
using EduTrack.API.Repositories.Interfaces;

namespace EduTrack.API.Repositories.Implementation
{
    /// <summary>
    /// UserRepository kế thừa GenericRepository<User> và implement IUserRepository.
    /// </summary>
    public class UserRepository : GenericRepository<User>, IUserRepository
    {
        public UserRepository(EduTrackDbContext context) : base(context)
        {
        }

        public override async Task<IEnumerable<User>> GetAllAsync()
        {
            return await _dbSet
                .AsNoTracking()
                .Include(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                .ToListAsync();
        }

        public override async Task<User?> GetByIdAsync(int id)
        {
            return await _dbSet
                .AsNoTracking()
                .Include(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                .FirstOrDefaultAsync(u => u.UserId == id);
        }

        public async Task<User> CreateUserWithRoleAsync(User user, string roleName)
        {
            await _dbSet.AddAsync(user);
            await _context.SaveChangesAsync();

            var role = await _context.Roles.FirstOrDefaultAsync(r => r.RoleName.ToLower() == roleName.ToLower());
            if (role != null)
            {
                var userRole = new UserRole
                {
                    UserId = user.UserId,
                    RoleId = role.RoleId
                };
                await _context.UserRoles.AddAsync(userRole);
                await _context.SaveChangesAsync();
            }

            return await GetByIdAsync(user.UserId) ?? user;
        }

        public async Task<User?> UpdateUserWithRoleAsync(int id, User updatedUser, string? roleName)
        {
            var existing = await _dbSet
                .Include(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                .FirstOrDefaultAsync(u => u.UserId == id);

            if (existing == null) return null;

            existing.FullName = updatedUser.FullName;
            existing.Email = updatedUser.Email;
            existing.Phone = updatedUser.Phone;
            existing.Specialty = updatedUser.Specialty;
            if (!string.IsNullOrWhiteSpace(updatedUser.Gender)) existing.Gender = updatedUser.Gender;
            if (!string.IsNullOrWhiteSpace(updatedUser.Status)) existing.Status = updatedUser.Status;

            if (!string.IsNullOrWhiteSpace(roleName))
            {
                var role = await _context.Roles.FirstOrDefaultAsync(r => r.RoleName.ToLower() == roleName.ToLower());
                if (role != null)
                {
                    _context.UserRoles.RemoveRange(existing.UserRoles);
                    existing.UserRoles.Add(new UserRole
                    {
                        UserId = existing.UserId,
                        RoleId = role.RoleId,
                        Role = role
                    });
                }
            }

            await _context.SaveChangesAsync();
            return await GetByIdAsync(id);
        }

        public async Task<bool> UpdateStatusAsync(int id, string status)
        {
            var user = await _dbSet.FindAsync(id);
            if (user == null) return false;

            user.Status = status;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteUserAsync(int id)
        {
            var user = await _dbSet
                .Include(u => u.UserRoles)
                .FirstOrDefaultAsync(u => u.UserId == id);

            if (user == null) return false;

            _context.UserRoles.RemoveRange(user.UserRoles);
            _dbSet.Remove(user);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}

