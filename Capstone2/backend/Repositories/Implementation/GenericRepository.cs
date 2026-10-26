using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using EduTrack.API.Models.EF;
using EduTrack.API.Repositories.Interfaces;

namespace EduTrack.API.Repositories.Implementation
{
    /// <summary>
    /// Generic Repository Implementation triển khai IGenericRepository dùng chung cho Entity Framework Core.
    /// </summary>
    /// <typeparam name="T">Kiểu Entity (class)</typeparam>
    public class GenericRepository<T> : IGenericRepository<T> where T : class
    {
        protected readonly EduTrackDbContext _context;
        protected readonly DbSet<T> _dbSet;

        public GenericRepository(EduTrackDbContext context)
        {
            _context = context;
            _dbSet = context.Set<T>();
        }

        public virtual async Task<IEnumerable<T>> GetAllAsync()
        {
            return await _dbSet.AsNoTracking().ToListAsync();
        }

        public virtual async Task<T?> GetByIdAsync(int id)
        {
            return await _dbSet.FindAsync(id);
        }

        public virtual async Task<T> AddAsync(T entity)
        {
            await _dbSet.AddAsync(entity);
            await _context.SaveChangesAsync();
            return entity;
        }

        public virtual async Task<T> UpdateAsync(T entity)
        {
            _dbSet.Update(entity);
            await _context.SaveChangesAsync();
            return entity;
        }

        public virtual async Task<bool> DeleteAsync(int id)
        {
            var entity = await _dbSet.FindAsync(id);
            if (entity == null) return false;
            _dbSet.Remove(entity);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}

