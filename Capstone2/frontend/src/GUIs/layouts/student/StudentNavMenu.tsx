import React, { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useNotificationInbox } from '../../hooks/useNotificationInbox';

interface StudentNavMenuProps {
  onLinkClick?: () => void;
}

export function StudentNavMenu({ onLinkClick }: StudentNavMenuProps) {
  const { data } = useNotificationInbox();
  const unreadCount = data?.unreadCount ?? 0;
  const [isDropupOpen, setIsDropupOpen] = useState<boolean>(false);
  const footerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Đóng dropup khi click bên ngoài
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (footerRef.current && !footerRef.current.contains(event.target as Node)) {
        setIsDropupOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleGoProfile = () => {
    setIsDropupOpen(false);
    onLinkClick?.();
    navigate("/student/profile");
  };

  const handleHome = () => {
    setIsDropupOpen(false);
    onLinkClick?.();
    navigate("/");
  };
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
              {unreadCount > 0 && <span className="sidebar-badge">{unreadCount}</span>}
            </NavLink>
          </li>
          <li className="sidebar-nav-item">
            <NavLink
              to="/student/feedback"
              onClick={onLinkClick}
              className={({ isActive }) =>
                `sidebar-nav-link ${isActive ? "active" : ""}`
              }
            >
              <span className="nav-icon"><i className="bi bi-chat-dots"></i></span>
              <span className="nav-label">Phản hồi & Góp ý</span>
            </NavLink>
          </li>
        </ul>
      </nav>

      <div className="sidebar-footer mt-auto" ref={footerRef}>
        {/* Dropup Menu */}
        {isDropupOpen && (
          <div className="sidebar-user-dropup">
            <div className="px-3 py-2 border-bottom mb-1">
              <div className="fw-bold text-dark text-truncate" style={{ fontSize: "13px" }}>
                Lê Văn An
              </div>
              <div className="text-muted text-truncate" style={{ fontSize: "11px" }}>
                Học sinh · Lớp 9
              </div>
            </div>

            <button
              type="button"
              className="sidebar-dropup-item"
              onClick={handleGoProfile}
            >
              <i className="bi bi-person-gear text-primary fs-6" />
              <span>Chỉnh sửa hồ sơ</span>
            </button>

            <div className="my-1 border-top" style={{ borderColor: "var(--et-border-subtle)" }} />

            <button
              type="button"
              className="sidebar-dropup-item text-danger"
              onClick={handleHome}
            >
              <i className="bi bi-box-arrow-right fs-6" />
              <span>Về trang chủ</span>
            </button>
          </div>
        )}

        {/* Clickable Avatar Chip */}
        <button
          type="button"
          className={`student-chip-btn ${isDropupOpen ? "active" : ""}`}
          onClick={() => setIsDropupOpen(!isDropupOpen)}
          title="Tài khoản học sinh"
          aria-expanded={isDropupOpen}
        >
          <div className="student-avatar">VA</div>
          <div className="student-info">
            <div className="student-name" title="Lê Văn An">Lê Văn An</div>
            <div className="student-grade">Học sinh · Lớp 9</div>
          </div>
          <i className="bi bi-three-dots-vertical text-muted ms-auto small" />
        </button>
      </div>
    </>
  );
};

export default StudentNavMenu;
