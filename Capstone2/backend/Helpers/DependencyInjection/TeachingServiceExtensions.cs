using Microsoft.Extensions.DependencyInjection;
using EduTrack.API.Services.Teaching.Interfaces;
using EduTrack.API.Services.Teaching.Implementation;

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
            services.AddScoped<ITeachingRequestService, TeachingRequestService>();
            services.AddScoped<ITeachingDashboardService, TeachingDashboardService>();
            services.AddScoped<ITeachingScheduleService, TeachingScheduleService>();
            services.AddScoped<ITeachingMyClassService, TeachingMyClassService>();
            return services;
        }
    }
}
