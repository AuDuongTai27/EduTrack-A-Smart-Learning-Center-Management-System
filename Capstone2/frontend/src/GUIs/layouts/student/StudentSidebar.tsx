import React from 'react';
import { NavLink, Link } from 'react-router-dom';

interface StudentSidebarProps {
  isMobileDrawer?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

export const StudentSidebar: React.FC<StudentSidebarProps> = ({
  isMobileDrawer = false,
  isOpen = false,
  onClose,
}) => {
  const navItems = [
    { to: '/student/dashboard', icon: 'bi-grid-1x2', label: 'Dashboard' },
    { to: '/student/classes', icon: 'bi-collection', label: 'Lớp học' },
    { to: '/student/schedule', icon: 'bi-calendar-event', label: 'Lịch học' },
    { to: '/student/progress', icon: 'bi-graph-up-arrow', label: 'Tiến độ' },
    { to: '/student/tuition', icon: 'bi-credit-card', label: 'Học phí' },
    { to: '/student/notifications', icon: 'bi-bell', label: 'Thông báo', badge: 3 },
  ];

  if (isMobileDrawer) {
    return (
      <>
        {isOpen && (
          <div
            className="offcanvas-backdrop fade show"
            onClick={onClose}
            style={{ zIndex: 1040 }}
          />
        )}
        <div
          className={`offcanvas offcanvas-start et-offcanvas ${isOpen ? 'show' : ''}`}
          tabIndex={-1}
          id="mobileSidebar"
          aria-labelledby="mobileSidebarLabel"
          style={{ visibility: isOpen ? 'visible' : 'hidden' }}
        >
          <div className="offcanvas-header border-bottom px-3 py-3">
            <Link to="/student/dashboard" className="brand-link" id="mobileSidebarLabel" onClick={onClose}>
              <div className="brand-logo-icon">
                <i className="bi bi-mortarboard-fill fs-5"></i>
              </div>
              <div>
                <div className="brand-title">EduTrack</div>
                <div className="brand-subtitle">Cổng học sinh</div>
              </div>
            </Link>
            <button
              type="button"
              className="btn-close text-reset"
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>

          <div className="offcanvas-body">
            <nav className="sidebar-nav px-2">
              <div className="sidebar-nav-title">Menu</div>
              <ul className="sidebar-nav-list">
                {navItems.map((item) => (
                  <li key={item.to} className="sidebar-nav-item">
                    <NavLink
                      to={item.to}
                      onClick={onClose}
                      className={({ isActive }) =>
                        `sidebar-nav-link ${isActive ? 'active' : ''}`
                      }
                    >
                      <span className="nav-icon"><i className={`bi ${item.icon}`}></i></span>
                      <span className="nav-label">{item.label}</span>
                      {item.badge !== undefined && (
                        <span className="sidebar-badge">{item.badge}</span>
                      )}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="sidebar-footer mt-auto">
              <Link to="/student/profile" className="student-chip" onClick={onClose}>
                <div className="student-avatar">MA</div>
                <div className="student-info">
                  <div className="student-name">Nguyễn Minh Anh</div>
                  <div className="student-grade">Học sinh · Lớp 11</div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <aside className="sidebar">
      {/* Brand / Logo */}
      <div className="sidebar-header">
        <Link to="/student/dashboard" className="brand-link">
          <div className="brand-logo-icon">
            <i className="bi bi-mortarboard-fill fs-5"></i>
          </div>
          <div>
            <div className="brand-title">EduTrack</div>
            <div className="brand-subtitle">Cổng học sinh</div>
          </div>
        </Link>
      </div>

      {/* Navigation Menu */}
      <nav className="sidebar-nav">
        <div className="sidebar-nav-title">Menu</div>
        <ul className="sidebar-nav-list">
          {navItems.map((item) => (
            <li key={item.to} className="sidebar-nav-item">
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `sidebar-nav-link ${isActive ? 'active' : ''}`
                }
              >
                <span className="nav-icon"><i className={`bi ${item.icon}`}></i></span>
                <span className="nav-label">{item.label}</span>
                {item.badge !== undefined && (
                  <span className="sidebar-badge">{item.badge}</span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Student Profile Chip at Bottom */}
      <div className="sidebar-footer">
        <Link to="/student/profile" className="student-chip">
          <div className="student-avatar">MA</div>
          <div className="student-info">
            <div className="student-name" title="Nguyễn Minh Anh">Nguyễn Minh Anh</div>
            <div className="student-grade">Học sinh · Lớp 11</div>
          </div>
        </Link>
      </div>
    </aside>
  );
};

export default StudentSidebar;
