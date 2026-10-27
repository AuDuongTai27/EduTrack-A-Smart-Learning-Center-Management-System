using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using EduTrack.API.Services.Interfaces;

namespace EduTrack.API.Controllers.Management
{
    /// <summary>
    /// [Bounded Context: Management] Quản lý Cấu hình Trung tâm (4 Tabs Settings)
    /// Phụ trách: Nhóm Center Manager (Thành viên 1)
    /// </summary>
    [ApiController]
    [Route("api/centersettings")]
    [Tags("Management - Center Settings")]
    public class ManagementSettingsController : ControllerBase
    {
        private readonly ICenterSettingService _settingService;

        public ManagementSettingsController(ICenterSettingService settingService)
        {
            _settingService = settingService;
        }

        // TODO [Thành viên 1 - Center Manager]:
        // Viết các API lưu cấu hình hệ thống tại đây:
        // - PUT /api/centersettings/{id} (Cập nhật 1 cấu hình theo ID/Key)
        // - PUT /api/centersettings/bulk (Lưu hàng loạt cấu hình trong 1 tab)
    }
}
