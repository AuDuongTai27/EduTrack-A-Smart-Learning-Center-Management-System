using Microsoft.Extensions.DependencyInjection;
using EduTrack.API.Services.Learning.Interfaces;
using EduTrack.API.Services.Learning.Implementation;

namespace EduTrack.API.Helpers.DependencyInjection
{
    /// <summary>
    /// [Thành viên 3 - Student & Parent]
    /// Đăng ký các Services chuyên biệt thuộc Bounded Context: Learning
    /// </summary>
    public static class LearningServiceExtensions
    {
        public static IServiceCollection AddLearningServices(this IServiceCollection services)
        {
            // Thành viên 3 đăng ký thêm các Service mới của nhánh Learning tại đây (tránh conflict Program.cs)
            services.AddScoped<ILearnerDashboardService, LearnerDashboardService>();
            return services;
        }
    }
}
