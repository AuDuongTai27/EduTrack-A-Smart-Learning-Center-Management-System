using System.Data;
using System.Security.Cryptography;
using System.Text;
using EduTrack.API.Models.EF;
using Microsoft.EntityFrameworkCore;

namespace EduTrack.API.Services.Schedule;

// All Phase 2 template/session writes share one database-scoped lock across API processes.
// Serializable reads also protect the rows/ranges used to validate assignments and conflicts.
// This is cooperative: legacy Attendance/SQL writers do not honor the named lock. See Phase 2 report.
internal static class ScheduleWriteTransaction
{
    public static async Task<T> Run<T>(EduTrackDbContext db, Func<Task<T>> write, CancellationToken ct)
    {
        await db.Database.OpenConnectionAsync(ct);
        var connection = db.Database.GetDbConnection();
        var name = "edutrack_schedule_" + Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(connection.Database)))[..40];
        var acquired = false;
        try
        {
            await using (var command = connection.CreateCommand())
            {
                command.CommandText = "SELECT GET_LOCK(@name, 10)";
                var parameter = command.CreateParameter(); parameter.ParameterName = "@name"; parameter.Value = name; command.Parameters.Add(parameter);
                var lockResult = await command.ExecuteScalarAsync(ct);
                acquired = lockResult != null && lockResult != DBNull.Value && Convert.ToInt32(lockResult) == 1;
            }
            if (!acquired) throw new ScheduleAccessException(409, "Lịch đang được cập nhật. Vui lòng xem lại Preview và thử lại.");
            await using var transaction = await db.Database.BeginTransactionAsync(IsolationLevel.Serializable, ct);
            var result = await write();
            await db.SaveChangesAsync(ct);
            await transaction.CommitAsync(ct);
            return result;
        }
        finally
        {
            // Named locks are connection scoped, NOT released by COMMIT/ROLLBACK.
            // Always release before returning the connection to the pool, even on request cancellation.
            try
            {
                // Also release if cancellation raced with the GET_LOCK response: the server
                // may have granted it before the client observed success. Releasing an
                // unowned lock is harmless and cannot release another session's lock.
                if (connection.State == ConnectionState.Open)
                {
                    await using var release = connection.CreateCommand(); release.CommandText = "SELECT RELEASE_LOCK(@name)";
                    var parameter = release.CreateParameter(); parameter.ParameterName = "@name"; parameter.Value = name; release.Parameters.Add(parameter);
                    await release.ExecuteScalarAsync(CancellationToken.None);
                }
            }
            finally { await db.Database.CloseConnectionAsync(); }
        }
    }
}
