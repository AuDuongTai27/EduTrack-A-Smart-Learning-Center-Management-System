using Microsoft.Extensions.DependencyInjection;
using EduTrack.API.Services.Management.Interfaces;
using EduTrack.API.Services.Management.Implementation;

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
            services.AddScoped<IManagementUserService, ManagementUserService>();
            services.AddScoped<IManagementClassService, ManagementClassService>();
            services.AddScoped<IManagementSubjectService, ManagementSubjectService>();

            return services;
        }
    }
}
