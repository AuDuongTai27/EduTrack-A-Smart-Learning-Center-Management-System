using System.Threading.Tasks;
using EduTrack.API.Models.DTOs.Landing;

namespace EduTrack.API.Services.Interfaces
{
    public interface ILandingPortalService
    {
        Task<LandingOverviewDto> GetLandingOverviewAsync();
        Task<LandingClassesPageDto> GetClassesAsync(int? subjectId, int page, int pageSize, System.Threading.CancellationToken ct = default);
        Task<bool> RecordNewsletterSubscriptionAsync(string email);
    }
}

