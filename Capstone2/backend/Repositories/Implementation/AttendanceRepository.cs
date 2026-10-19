using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using EduTrack.API.Models.EF;
using EduTrack.API.Models.Entities;
using EduTrack.API.Repositories.Interfaces;

namespace EduTrack.API.Repositories.Implementation
{
    public class AttendanceRepository : GenericRepository<Attendance>, IAttendanceRepository
    {
        public AttendanceRepository(EduTrackDbContext context) : base(context)
        {
        }

        public override async Task<IEnumerable<Attendance>> GetAllAsync()
        {
            return await _dbSet
                .AsNoTracking()
                .Include(a => a.Session).ThenInclude(s => s.Class)
                .Include(a => a.Student)
                .Include(a => a.Recorder)
                .ToListAsync();
        }

        public override async Task<Attendance?> GetByIdAsync(int id)
        {
            return await _dbSet
                .AsNoTracking()
                .Include(a => a.Session).ThenInclude(s => s.Class)
                .Include(a => a.Student)
                .Include(a => a.Recorder)
                .FirstOrDefaultAsync(x => x.AttendanceId == id);
        }
    }
}
