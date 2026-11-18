import '../../../assets/css/simplified-topbar.css';
import { NotificationBellDropdown, AdminAccountDropdown } from '../../components/shared/notifications/NotificationQuickViews';
export default function AdminTopBar() {
  return (
    <header className="topbar et-simplified-topbar">
      <div className="topbar-left">
        <button
          className="mobile-menu-btn"
          id="mobileMenuBtn"
          type="button"
          aria-label="Open menu"
        >
          <i className="bi bi-list" />
        </button>
      </div>
      <div className="topbar-actions">
        <NotificationBellDropdown />
        <AdminAccountDropdown />
      </div>
    </header>
  );
}
