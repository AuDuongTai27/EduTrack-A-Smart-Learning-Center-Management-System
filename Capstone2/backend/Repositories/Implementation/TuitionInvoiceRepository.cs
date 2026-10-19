using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using EduTrack.API.Models.EF;
using EduTrack.API.Models.Entities;
using EduTrack.API.Repositories.Interfaces;

namespace EduTrack.API.Repositories.Implementation
{
    public class TuitionInvoiceRepository : GenericRepository<TuitionInvoice>, ITuitionInvoiceRepository
    {
        public TuitionInvoiceRepository(EduTrackDbContext context) : base(context)
        {
        }

        public override async Task<IEnumerable<TuitionInvoice>> GetAllAsync()
        {
            return await _dbSet
                .AsNoTracking()
                .Include(ti => ti.Student)
                .Include(ti => ti.Class)
                .ToListAsync();
        }

        public override async Task<TuitionInvoice?> GetByIdAsync(int id)
        {
            return await _dbSet
                .AsNoTracking()
                .Include(ti => ti.Student)
                .Include(ti => ti.Class)
                .FirstOrDefaultAsync(x => x.InvoiceId == id);
        }
    }
}
