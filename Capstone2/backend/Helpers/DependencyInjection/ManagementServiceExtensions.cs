using Microsoft.Extensions.DependencyInjection;

namespace EduTrack.API.Helpers.DependencyInjection
{
    /// <summary>
    /// [Thành viên 1 - Center Manager & Admin Staff]
    /// Đăng ký các Services chuyên biệt thuộc Bounded Context: Management
    /// </summary>
    public static class ManagementServiceExtensions
    {
        public static IServiceCollection AddManagementServices(this IServiceCollection services)
        {
            // Thành viên 1 đăng ký thêm các Service mới của nhánh Management tại đây (tránh conflict Program.cs)
            return services;
        }
    }
}
