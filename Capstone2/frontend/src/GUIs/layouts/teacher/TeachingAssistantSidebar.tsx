import CenterSchoolIcon from "../../components/admin/CenterManager/CenterSchoolIcon";
import { useCenterSettings } from "../../../contexts/CenterSettingsContext";
import { BrandIcon } from "../../components/Common/BrandIcon";
import { Link, NavLink } from "react-router-dom";

export default function TeachingAssistantSidebar() {
  const { centerName, loading, error } = useCenterSettings();
  const displayCenterName = centerName || (loading ? "Loading..." : error ? "Failed to load center name" : "Center name not configured");
  const getNavClass = ({ isActive }: { isActive: boolean }) =>
    `nav-link ${isActive ? "active" : ""}`;

  return (
    <aside className="sidebar" id="sidebar">
      <div className="sidebar-header">
        <Link className="brand" to="/teaching-assistant/dashboard">
          <span className="brand-mark">
            <BrandIcon />
          </span>
          <span className="brand-text">EduTrack</span>
        </Link>
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
          <CenterSchoolIcon />
        </span>
        <div className="center-info">
          <span className="center-name" title={displayCenterName}>{displayCenterName}</span>
          <small>Learning Center</small>
        </div>
      </div>
      <nav className="sidebar-nav">
        <div className="nav-section">
          <div className="nav-heading">MAIN</div>
          <NavLink className={getNavClass} to="/teaching-assistant/dashboard">
            <i className="bi bi-grid-1x2-fill" />
            <span>Dashboard</span>
          </NavLink>
        </div>
        <div className="nav-section">
          <div className="nav-heading">ACADEMIC</div>
          <NavLink className={getNavClass} to="/teaching-assistant/schedule">
            <i className="bi bi-calendar-week" />
            <span>Schedule</span>
          </NavLink>
          <NavLink className={getNavClass} to="/teaching-assistant/classes">
            <i className="bi bi-collection-fill" />
            <span>My Classes</span>
          </NavLink>
        </div>
        <div className="nav-section">
          <div className="nav-heading">COMMUNICATION</div>
          <NavLink className={getNavClass} to="/teaching-assistant/notifications">
            <i className="bi bi-megaphone-fill" />
            <span>Notifications</span>
          </NavLink>
        </div>
        <div className="nav-section">
          <div className="nav-heading">REQUESTS</div>
          <NavLink className={getNavClass} to="/teaching-assistant/request">
            <i className="bi bi-send" />
            <span>Request</span>
          </NavLink>
        </div>
      </nav>
    </aside>
  );
}
