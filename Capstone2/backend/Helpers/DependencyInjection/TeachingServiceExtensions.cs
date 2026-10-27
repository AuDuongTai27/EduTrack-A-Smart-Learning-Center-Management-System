using Microsoft.Extensions.DependencyInjection;

namespace EduTrack.API.Helpers.DependencyInjection
{
    /// <summary>
    /// [Thành viên 2 - Teacher & Teaching Assistant]
    /// Đăng ký các Services chuyên biệt thuộc Bounded Context: Teaching
    /// </summary>
    public static class TeachingServiceExtensions
    {
        public static IServiceCollection AddTeachingServices(this IServiceCollection services)
        {
            // Thành viên 2 đăng ký thêm các Service mới của nhánh Teaching tại đây (tránh conflict Program.cs)
            return services;
        }
    }
}
