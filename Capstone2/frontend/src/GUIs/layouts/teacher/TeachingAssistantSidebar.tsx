import { Link, NavLink } from "react-router-dom";

export default function TeachingAssistantSidebar() {
  const getNavClass = ({ isActive }: { isActive: boolean }) =>
    `nav-link ${isActive ? "active" : ""}`;

  return (
    <aside className="sidebar" id="sidebar">
      <div className="sidebar-header">
        <Link className="brand" to="/teaching-assistant/dashboard">
          <span className="brand-mark">
            <i className="bi bi-mortarboard-fill" />
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
          <i className="bi bi-buildings-fill" />
        </span>
        <div className="center-info">
          <span className="center-name">EduTrack Center</span>
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
            <i className="bi bi-person-gear" />
            <span>Schedule</span>
          </NavLink>
          <NavLink className={getNavClass} to="/teaching-assistant/classes">
            <i className="bi bi-mortarboard" />
            <span>My Classes</span>
          </NavLink>
          <NavLink className={getNavClass} to="/teaching-assistant/learning-progress">
            <i className="bi bi-journal-bookmark-fill" />
            <span>Learning Progress</span>
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
            <i className="bi bi-bar-chart-fill" />
            <span>Request</span>
          </NavLink>
        </div>
      </nav>
    </aside>
  );
}
