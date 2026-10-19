using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using EduTrack.API.Models.EF;
using EduTrack.API.Models.Entities;
using EduTrack.API.Repositories.Interfaces;

namespace EduTrack.API.Repositories.Implementation
{
    public class StudentClassRepository : GenericRepository<StudentClass>, IStudentClassRepository
    {
        public StudentClassRepository(EduTrackDbContext context) : base(context)
        {
        }

        public override async Task<IEnumerable<StudentClass>> GetAllAsync()
        {
            return await _dbSet
                .AsNoTracking()
                .Include(sc => sc.Student)
                .Include(sc => sc.Class)
                .ToListAsync();
        }

        public override async Task<StudentClass?> GetByIdAsync(int id)
        {
            return await _dbSet
                .AsNoTracking()
                .Include(sc => sc.Student)
                .Include(sc => sc.Class)
                .FirstOrDefaultAsync(x => x.ScId == id);
        }
    }
}
