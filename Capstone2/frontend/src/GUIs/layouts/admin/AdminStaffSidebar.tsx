import { Link, NavLink } from "react-router-dom";

export default function AdminStaffSidebar() {
  return (
    <aside className="sidebar" id="sidebar">
      <div className="sidebar-header">
        <Link className="brand" to="dashboard">
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
          <NavLink
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
            to="/admin-staff/dashboard"
          >
            <i className="bi bi-grid-1x2-fill" />
            <span>Dashboard</span>
          </NavLink>
        </div>
        <div className="nav-section">
          <div className="nav-heading">MANAGEMENT</div>
          <NavLink
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
            to="/admin-staff/students"
          >
            <i className="bi bi-mortarboard" />
            <span>Students</span>
          </NavLink>
          <NavLink
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
            to="/admin-staff/classes"
          >
            <i className="bi bi-collection-fill" />
            <span>Classes</span>
          </NavLink>
          <NavLink
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
            to="/admin-staff/teaching-monitoring"
          >
            <i className="bi bi-activity" />
            <span>Teaching Monitoring</span>
          </NavLink>
        </div>
        <div className="nav-section">
          <div className="nav-heading">FINANCE</div>
          <NavLink
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
            to="/admin-staff/tuition"
          >
            <i className="bi bi-cash-stack" />
            <span>Tuition</span>
          </NavLink>
          <NavLink
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
            to="/admin-staff/approval-requests"
          >
            <i className="bi bi-check2-square" />
            <span>My Approval Requests</span>
          </NavLink>
        </div>
        <div className="nav-section">
          <div className="nav-heading">COMMUNICATION</div>
          <NavLink
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
            to="/admin-staff/notifications"
          >
            <i className="bi bi-megaphone-fill" />
            <span>Notifications</span>
          </NavLink>
        </div>
        <div className="nav-section pb-4">
          <div className="nav-heading">REPORTING</div>
          <NavLink
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
            to="/admin-staff/reports"
          >
            <i className="bi bi-bar-chart-fill" />
            <span>Reports</span>
          </NavLink>
        </div>
      </nav>
    </aside>
  );
}
