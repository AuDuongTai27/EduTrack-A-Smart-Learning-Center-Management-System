import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useParent } from '../../../contexts/ParentContext';
import { ChildSwitcher } from '../../components/parent/ChildSwitcher';

interface ParentNavMenuProps {
  onLinkClick?: () => void;
}

export function ParentNavMenu({ onLinkClick }: ParentNavMenuProps) {
  const { selectedChild } = useParent();

  return (
    <>
      {/* BỘ CHỌN LỌC HỌC SINH ĐẶT TẠI SIDEBAR */}
      <ChildSwitcher onChildSelected={onLinkClick} />

      {/* MENU ĐIỀU HƯỚNG */}
      <nav className="sidebar-nav">
        <div className="sidebar-nav-title">Menu Phụ huynh</div>
        <ul className="sidebar-nav-list">
          <li className="sidebar-nav-item">
            <NavLink
              to="/parent/dashboard"
              onClick={onLinkClick}
              className={({ isActive }) =>
                `sidebar-nav-link ${isActive ? 'active' : ''}`
              }
            >
              <span className="nav-icon"><i className="bi bi-grid-1x2"></i></span>
              <span className="nav-label">Dashboard</span>
            </NavLink>
          </li>
          <li className="sidebar-nav-item">
            <NavLink
              to="/parent/classes"
              onClick={onLinkClick}
              className={({ isActive }) =>
                `sidebar-nav-link ${isActive ? 'active' : ''}`
              }
            >
              <span className="nav-icon"><i className="bi bi-collection"></i></span>
              <span className="nav-label">Lớp học của con</span>
            </NavLink>
          </li>
          <li className="sidebar-nav-item">
            <NavLink
              to="/parent/schedule"
              onClick={onLinkClick}
              className={({ isActive }) =>
                `sidebar-nav-link ${isActive ? 'active' : ''}`
              }
            >
              <span className="nav-icon"><i className="bi bi-calendar-event"></i></span>
              <span className="nav-label">Lịch học</span>
            </NavLink>
          </li>
          <li className="sidebar-nav-item">
            <NavLink
              to="/parent/progress"
              onClick={onLinkClick}
              className={({ isActive }) =>
                `sidebar-nav-link ${isActive ? 'active' : ''}`
              }
            >
              <span className="nav-icon"><i className="bi bi-graph-up-arrow"></i></span>
              <span className="nav-label">Tiến độ & Điểm danh</span>
            </NavLink>
          </li>
          <li className="sidebar-nav-item">
            <NavLink
              to="/parent/tuition"
              onClick={onLinkClick}
              className={({ isActive }) =>
                `sidebar-nav-link ${isActive ? 'active' : ''}`
              }
            >
              <span className="nav-icon"><i className="bi bi-credit-card"></i></span>
              <span className="nav-label">Học phí</span>
              {selectedChild && selectedChild.unpaidAmount > 0 && (
                <span className="sidebar-badge bg-danger text-white">Cần nộp</span>
              )}
            </NavLink>
          </li>
          <li className="sidebar-nav-item">
            <NavLink
              to="/parent/notifications"
              onClick={onLinkClick}
              className={({ isActive }) =>
                `sidebar-nav-link ${isActive ? 'active' : ''}`
              }
            >
              <span className="nav-icon"><i className="bi bi-bell"></i></span>
              <span className="nav-label">Thông báo</span>
              <span className="sidebar-badge">2</span>
            </NavLink>
          </li>
          <li className="sidebar-nav-item">
            <NavLink
              to="/parent/feedback"
              onClick={onLinkClick}
              className={({ isActive }) =>
                `sidebar-nav-link ${isActive ? 'active' : ''}`
              }
            >
              <span className="nav-icon"><i className="bi bi-chat-dots"></i></span>
              <span className="nav-label">Phản hồi & Hỗ trợ</span>
            </NavLink>
          </li>
        </ul>
      </nav>

      {/* FOOTER PROFILE PHỤ HUYNH */}
      <div className="sidebar-footer mt-auto">
        <Link
          to="/parent/profile"
          className="student-chip"
          onClick={onLinkClick}
          title="Xem thông tin tài khoản phụ huynh"
        >
          <div
            className="student-avatar"
            style={{ background: 'linear-gradient(135deg, #0ea5e9, #0284c7)' }}
          >
            VN
          </div>
          <div className="student-info">
            <div className="student-name">Lê Văn Nam</div>
            <div className="student-grade">Phụ huynh em Lê Văn An</div>
          </div>
        </Link>
      </div>
    </>
  );
};

export default ParentNavMenu;
