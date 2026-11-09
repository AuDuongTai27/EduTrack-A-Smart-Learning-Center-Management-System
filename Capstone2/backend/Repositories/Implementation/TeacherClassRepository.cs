using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using EduTrack.API.Models.EF;
using EduTrack.API.Models.Entities;
using EduTrack.API.Repositories.Interfaces;

namespace EduTrack.API.Repositories.Implementation
{
    public class TeacherClassRepository : GenericRepository<TeacherClass>, ITeacherClassRepository
    {
        public TeacherClassRepository(EduTrackDbContext context) : base(context)
        {
        }

        public Task<TeacherClass?> FindAssignmentAsync(int classId, int teacherId) =>
            _dbSet.FirstOrDefaultAsync(x => x.ClassId == classId && x.TeacherId == teacherId);

        public async Task<TeacherClass?> DeactivateAsync(int classId, int assignmentId)
        {
            await _dbSet.Where(x => x.ClassId == classId && x.TeacherClassId == assignmentId && x.Status != "inactive")
                .ExecuteUpdateAsync(update => update.SetProperty(x => x.Status, "inactive"));
            var assignment = await GetByIdAsync(assignmentId);
            return assignment?.ClassId == classId ? assignment : null;
        }

        public override async Task<IEnumerable<TeacherClass>> GetAllAsync()
        {
            return await _dbSet
                .AsNoTracking()
                .Include(tc => tc.Teacher)
                .Include(tc => tc.Class)
                .ToListAsync();
        }

        public override async Task<TeacherClass?> GetByIdAsync(int id)
        {
            return await _dbSet
                .AsNoTracking()
                .Include(tc => tc.Teacher)
                .Include(tc => tc.Class)
                .FirstOrDefaultAsync(x => x.TeacherClassId == id);
        }
    }
}
