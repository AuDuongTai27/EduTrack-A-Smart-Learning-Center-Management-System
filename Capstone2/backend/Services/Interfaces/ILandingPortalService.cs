using System.Threading.Tasks;
using EduTrack.API.Models.DTOs.Landing;

namespace EduTrack.API.Services.Interfaces
{
    public interface ILandingPortalService
    {
        Task<LandingOverviewDto> GetLandingOverviewAsync();
        Task<bool> RecordNewsletterSubscriptionAsync(string email);
    }
}

