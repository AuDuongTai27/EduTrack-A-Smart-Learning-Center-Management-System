using System.Data;
using EduTrack.API.Models.DTOs;
using EduTrack.API.Models.EF;
using EduTrack.API.Models.Entities;
using EduTrack.API.Repositories.Interfaces;
using EduTrack.API.Services.Management;
using Microsoft.EntityFrameworkCore;

namespace EduTrack.API.Repositories.Implementation;

public class GradeRepository(EduTrackDbContext context) : IGradeRepository
{
    private IQueryable<GradeDto> Summaries => context.Grades.AsNoTracking()
        .Select(g => new GradeDto { GradeId = g.GradeId, GradeName = g.GradeName, TotalClasses = g.Classes.Count });

    public async Task<IReadOnlyList<GradeDto>> ReadAllAsync() =>
        await Summaries.OrderBy(g => g.GradeId).ToListAsync();

    public Task<GradeDto?> ReadByIdAsync(int id) => Summaries.SingleOrDefaultAsync(g => g.GradeId == id);

    // Current schema uses assigned integer IDs. Serialize catalogue writes using
    // InnoDB row/gap locks so ID allocation and duplicate-name checks stay atomic.
    private Task<List<Grade>> LockCatalogueAsync() => context.Grades
        .FromSqlRaw("SELECT * FROM grades ORDER BY grade_id FOR UPDATE").AsTracking().ToListAsync();

    private async Task EnsureUniqueAsync(List<Grade> locked, string name, int? exceptId = null)
    {
        // Also compare in MySQL to respect the actual grade_name collation.
        if (locked.Any(g => g.GradeId != exceptId &&
                string.Equals(GradeNames.Normalize(g.GradeName), name, StringComparison.OrdinalIgnoreCase))
            || await context.Grades.AnyAsync(g => g.GradeId != exceptId && g.GradeName == name))
            throw new InvalidOperationException("Tên khối lớp đã tồn tại. Vui lòng chọn tên khác.");
    }

    public async Task<GradeDto> CreateAsync(string name)
    {
        await using var transaction = await context.Database.BeginTransactionAsync(IsolationLevel.Serializable);
        var locked = await LockCatalogueAsync();
        await EnsureUniqueAsync(locked, name);
        var highest = locked.Count == 0 ? 0 : locked.Max(g => g.GradeId);
        if (highest == int.MaxValue) throw new InvalidOperationException("Không thể cấp thêm mã khối lớp.");
        var entity = new Grade { GradeId = highest + 1, GradeName = name };
        context.Grades.Add(entity);
        await context.SaveChangesAsync();
        await transaction.CommitAsync();
        return new GradeDto { GradeId = entity.GradeId, GradeName = entity.GradeName, TotalClasses = 0 };
    }

    public async Task<GradeDto?> RenameAsync(int id, string name)
    {
        await using var transaction = await context.Database.BeginTransactionAsync(IsolationLevel.Serializable);
        var locked = await LockCatalogueAsync();
        var entity = locked.SingleOrDefault(g => g.GradeId == id);
        if (entity == null) return null;
        await EnsureUniqueAsync(locked, name, id);
        // Update only the name; never replace IDs or navigation collections.
        entity.GradeName = name;
        await context.SaveChangesAsync();
        var result = await ReadByIdAsync(id);
        await transaction.CommitAsync();
        return result;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        await using var transaction = await context.Database.BeginTransactionAsync(IsolationLevel.Serializable);
        var locked = await LockCatalogueAsync();
        var entity = locked.SingleOrDefault(g => g.GradeId == id);
        if (entity == null) return false;
        if (await context.Classes.AnyAsync(c => c.GradeId == id))
            throw new InvalidOperationException("Không thể xóa khối lớp đang có Class liên kết, kể cả lớp Inactive hoặc Completed. Hãy giữ khối để bảo toàn lịch sử.");
        if (await context.Users.AnyAsync(u => u.GradeId == id))
            throw new InvalidOperationException("Không thể xóa khối lớp đang được hồ sơ học sinh sử dụng. Hãy giữ khối để bảo toàn dữ liệu.");
        context.Grades.Remove(entity);
        await context.SaveChangesAsync();
        await transaction.CommitAsync();
        return true;
    }
}
