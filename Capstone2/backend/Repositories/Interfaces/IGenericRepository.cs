using System.Collections.Generic;
using System.Threading.Tasks;

namespace EduTrack.API.Repositories.Interfaces
{
    /// <summary>
    /// Generic Repository Interface định nghĩa GetAll và GetById dùng chung cho tất cả Entity.
    /// </summary>
    /// <typeparam name="T">Kiểu Entity (class)</typeparam>
    public interface IGenericRepository<T> where T : class
    {
        /// <summary>
        /// Lấy toàn bộ danh sách bản ghi (AsNoTracking).
        /// </summary>
        Task<IEnumerable<T>> GetAllAsync();

        /// <summary>
        /// Lấy một bản ghi theo khóa chính (int Id).
        /// </summary>
        Task<T?> GetByIdAsync(int id);
    }
}
