import '../../../assets/css/simplified-topbar.css';
import { NotificationBellDropdown, AdminAccountDropdown } from '../../components/shared/notifications/NotificationQuickViews';
import { toggleMobileSidebar } from '../../hooks/useSidebarToggle';
export default function AdminTopBar({ centerManager = false, adminStaff = false }: { centerManager?: boolean; adminStaff?: boolean }) {
  return (
    <header className="topbar et-simplified-topbar et-unified-topbar">
      <div className="topbar-left">
        <button
          className="mobile-menu-btn"
          id="mobileMenuBtn"
          type="button"
          onClick={toggleMobileSidebar}
          aria-label="Open menu"
        >
          <i className="bi bi-list" />
        </button>
      </div>
      <div className="topbar-actions">
        <NotificationBellDropdown />
        <AdminAccountDropdown centerManager={centerManager} adminStaff={adminStaff} />
      </div>
    </header>
  );
}
