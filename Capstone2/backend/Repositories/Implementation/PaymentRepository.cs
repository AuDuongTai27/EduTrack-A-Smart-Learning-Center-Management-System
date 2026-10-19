using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using EduTrack.API.Models.EF;
using EduTrack.API.Models.Entities;
using EduTrack.API.Repositories.Interfaces;

namespace EduTrack.API.Repositories.Implementation
{
    public class PaymentRepository : GenericRepository<Payment>, IPaymentRepository
    {
        public PaymentRepository(EduTrackDbContext context) : base(context)
        {
        }

        public override async Task<IEnumerable<Payment>> GetAllAsync()
        {
            return await _dbSet
                .AsNoTracking()
                .Include(p => p.Invoice)
                .Include(p => p.Payer)
                .Include(p => p.Recorder)
                .ToListAsync();
        }

        public override async Task<Payment?> GetByIdAsync(int id)
        {
            return await _dbSet
                .AsNoTracking()
                .Include(p => p.Invoice)
                .Include(p => p.Payer)
                .Include(p => p.Recorder)
                .FirstOrDefaultAsync(x => x.PaymentId == id);
        }
    }
}
