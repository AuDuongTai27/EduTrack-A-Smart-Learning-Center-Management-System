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
    }
}
