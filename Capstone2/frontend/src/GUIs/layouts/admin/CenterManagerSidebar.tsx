import { NavLink } from "react-router-dom";
import { useCenterSettings } from "../../../contexts/CenterSettingsContext";

export default function CenterManagerSidebar() {
  const { centerName, loading: settingsLoading, error: settingsError } = useCenterSettings();
  return (
    <aside className="sidebar" id="sidebar">
      <div className="sidebar-header">
        <NavLink className="brand" to="/center-manager">
          <span className="brand-mark">
            <i className="bi bi-mortarboard-fill" />
          </span>
          <span className="brand-text">EduTrack</span>
        </NavLink>
        <button
          className="sidebar-collapse-btn"
          id="sidebarCollapseBtn"
          type="button"
          aria-label="Toggle sidebar"
        >
          <i className="bi bi-list" />
        </button>
      </div>
      <div className="center-box">
        <span className="center-avatar">
          <i className="bi bi-buildings-fill" />
        </span>
        <div className="center-info">
          <span className="center-name">{centerName || (settingsLoading ? "Đang tải..." : settingsError ? "Không tải được tên trung tâm" : "Chưa cấu hình tên trung tâm")}</span>
          <small>Learning Center</small>
        </div>
      </div>
      <nav className="sidebar-nav">
        <div className="nav-section">
          <div className="nav-heading">MAIN</div>
          <NavLink
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
            to="/center-manager/dashboard"
          >
            <i className="bi bi-grid-1x2-fill" />
            <span>Dashboard</span>
          </NavLink>
        </div>
        <div className="nav-section">
          <div className="nav-heading">MANAGEMENT</div>
          <NavLink
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
            to="/center-manager/user-accounts"
          >
            <i className="bi bi-person-gear" />
            <span>User Accounts</span>
          </NavLink>
          <NavLink
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
            to="/center-manager/students"
          >
            <i className="bi bi-mortarboard" />
            <span>Students</span>
          </NavLink>
          <NavLink
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
            to="/center-manager/subjects"
          >
            <i className="bi bi-journal-bookmark-fill" />
            <span>Subjects</span>
          </NavLink>
          <NavLink
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
            to="/center-manager/classes"
          >
            <i className="bi bi-collection-fill" />
            <span>Classes</span>
          </NavLink>
        </div>
        <div className="nav-section">
          <div className="nav-heading">FINANCE</div>
          <NavLink
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
            to="/center-manager/tuition"
          >
            <i className="bi bi-cash-stack" />
            <span>Tuition</span>
          </NavLink>
          <NavLink
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
            to="/center-manager/approval-requests"
          >
            <i className="bi bi-check2-square" />
            <span>Approval Requests</span>
          </NavLink>
        </div>
        <div className="nav-section">
          <div className="nav-heading">COMMUNICATION</div>
          <NavLink
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
            to="/center-manager/notifications"
          >
            <i className="bi bi-megaphone-fill" />
            <span>Notifications</span>
          </NavLink>
        </div>
        <div className="nav-section">
          <div className="nav-heading">REPORTING</div>
          <NavLink
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
            to="/center-manager/reports"
          >
            <i className="bi bi-bar-chart-fill" />
            <span>Reports</span>
          </NavLink>
        </div>
        <div className="nav-section pb-4">
          <div className="nav-heading">SYSTEM</div>
          <NavLink
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
            to="/center-manager/settings"
          >
            <i className="bi bi-gear-fill" />
            <span>Settings</span>
          </NavLink>
        </div>
      </nav>
    </aside>
  );
}
