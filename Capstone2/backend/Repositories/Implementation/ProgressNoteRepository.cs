using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using EduTrack.API.Models.EF;
using EduTrack.API.Models.Entities;
using EduTrack.API.Repositories.Interfaces;

namespace EduTrack.API.Repositories.Implementation
{
    public class ProgressNoteRepository : GenericRepository<ProgressNote>, IProgressNoteRepository
    {
        public ProgressNoteRepository(EduTrackDbContext context) : base(context)
        {
        }

        public override async Task<IEnumerable<ProgressNote>> GetAllAsync()
        {
            return await _dbSet
                .AsNoTracking()
                .Include(pn => pn.Student)
                .Include(pn => pn.Class)
                .Include(pn => pn.Author)
                .ToListAsync();
        }

        public override async Task<ProgressNote?> GetByIdAsync(int id)
        {
            return await _dbSet
                .AsNoTracking()
                .Include(pn => pn.Student)
                .Include(pn => pn.Class)
                .Include(pn => pn.Author)
                .FirstOrDefaultAsync(x => x.NoteId == id);
        }
    }
}
