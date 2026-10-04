import React from "react";
import { NavLink, Link } from "react-router-dom";

interface StudentNavMenuProps {
  onLinkClick?: () => void;
}

export const StudentNavMenu: React.FC<StudentNavMenuProps> = ({ onLinkClick }) => {
  return (
    <>
      <nav className="sidebar-nav">
        <div className="sidebar-nav-title">Menu</div>
        <ul className="sidebar-nav-list">
          <li className="sidebar-nav-item">
            <NavLink
              to="/student/dashboard"
              onClick={onLinkClick}
              className={({ isActive }) =>
                `sidebar-nav-link ${isActive ? "active" : ""}`
              }
            >
              <span className="nav-icon"><i className="bi bi-grid-1x2"></i></span>
              <span className="nav-label">Dashboard</span>
            </NavLink>
          </li>
          <li className="sidebar-nav-item">
            <NavLink
              to="/student/classes"
              onClick={onLinkClick}
              className={({ isActive }) =>
                `sidebar-nav-link ${isActive ? "active" : ""}`
              }
            >
              <span className="nav-icon"><i className="bi bi-collection"></i></span>
              <span className="nav-label">Lớp học</span>
            </NavLink>
          </li>
          <li className="sidebar-nav-item">
            <NavLink
              to="/student/schedule"
              onClick={onLinkClick}
              className={({ isActive }) =>
                `sidebar-nav-link ${isActive ? "active" : ""}`
              }
            >
              <span className="nav-icon"><i className="bi bi-calendar-event"></i></span>
              <span className="nav-label">Lịch học</span>
            </NavLink>
          </li>
          <li className="sidebar-nav-item">
            <NavLink
              to="/student/progress"
              onClick={onLinkClick}
              className={({ isActive }) =>
                `sidebar-nav-link ${isActive ? "active" : ""}`
              }
            >
              <span className="nav-icon"><i className="bi bi-graph-up-arrow"></i></span>
              <span className="nav-label">Tiến độ</span>
            </NavLink>
          </li>
          <li className="sidebar-nav-item">
            <NavLink
              to="/student/tuition"
              onClick={onLinkClick}
              className={({ isActive }) =>
                `sidebar-nav-link ${isActive ? "active" : ""}`
              }
            >
              <span className="nav-icon"><i className="bi bi-credit-card"></i></span>
              <span className="nav-label">Học phí</span>
            </NavLink>
          </li>
          <li className="sidebar-nav-item">
            <NavLink
              to="/student/notifications"
              onClick={onLinkClick}
              className={({ isActive }) =>
                `sidebar-nav-link ${isActive ? "active" : ""}`
              }
            >
              <span className="nav-icon"><i className="bi bi-bell"></i></span>
              <span className="nav-label">Thông báo</span>
              <span className="sidebar-badge">3</span>
            </NavLink>
          </li>
        </ul>
      </nav>

      <div className="sidebar-footer mt-auto">
        <Link
          to="/student/profile"
          className="student-chip"
          onClick={onLinkClick}
        >
          <div className="student-avatar">MA</div>
          <div className="student-info">
            <div className="student-name" title="Nguyễn Minh Anh">Nguyễn Minh Anh</div>
            <div className="student-grade">Học sinh · Lớp 11</div>
          </div>
        </Link>
      </div>
    </>
  );
};

export default StudentNavMenu;
