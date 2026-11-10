import { useLocation } from 'react-router-dom';
import { useCenterSettings } from '../../../contexts/CenterSettingsContext';
import { NotificationBellDropdown, AdminAccountDropdown } from '../../components/shared/notifications/NotificationQuickViews';
export default function AdminTopBar() {
  const { academicYear, loading: settingsLoading, error: settingsError } = useCenterSettings();
  const location = useLocation();
  const isAdminStaff = location.pathname.startsWith('/admin-staff');
  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          className="mobile-menu-btn"
          id="mobileMenuBtn"
          type="button"
          aria-label="Open menu"
        >
          <i className="bi bi-list" />
        </button>
        <div className="search-box">
          <i className="bi bi-search" />
          <input
            type="text"
            placeholder={isAdminStaff ? "Tìm học sinh, lớp học, đơn từ..." : "Tìm kiếm toàn hệ thống EduTrack..."}
          />
        </div>
      </div>
      <div className="topbar-actions">
        <button className="academic-year-btn" type="button">
          <i className="bi bi-calendar3" />
          <span>Năm học: {academicYear || (settingsLoading ? "Đang tải..." : settingsError ? "Không tải được" : "Chưa cấu hình")}</span>
        </button>
        <button className="icon-btn" type="button" title="Giao diện">
          <i className="bi bi-moon-stars" />
        </button>
        <NotificationBellDropdown />
        <AdminAccountDropdown />
      </div>
    </header>
  );
}
