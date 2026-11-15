import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useParent } from '../../../contexts/ParentContext';
import { ChildSwitcher } from '../../components/parent/ChildSwitcher';
import { learningDAL, DEFAULT_STUDENT_ID } from '../../../DAL/learningDAL';
import { DEFAULT_PARENT_ID } from '../../../DAL/parentDAL';

interface ParentNavMenuProps {
  onLinkClick?: () => void;
}

export function ParentNavMenu({ onLinkClick }: ParentNavMenuProps) {
  const { selectedChild } = useParent();
  const targetStudentId = selectedChild?.id || DEFAULT_STUDENT_ID;
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isDropupOpen, setIsDropupOpen] = useState<boolean>(false);
  const footerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    const refreshCount = async () => {
      const count = await learningDAL.getParentUnreadCount(DEFAULT_PARENT_ID, targetStudentId);
      if (mounted) setUnreadCount(count);
    };
    void refreshCount();
    const onUpdate = () => void refreshCount();
    window.addEventListener('notifications-updated', onUpdate);
    window.addEventListener('focus', onUpdate);
    return () => {
      mounted = false;
      window.removeEventListener('notifications-updated', onUpdate);
      window.removeEventListener('focus', onUpdate);
    };
  }, [targetStudentId]);

  // Đóng dropup khi click bên ngoài
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (footerRef.current && !footerRef.current.contains(event.target as Node)) {
        setIsDropupOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleGoProfile = () => {
    setIsDropupOpen(false);
    onLinkClick?.();
    navigate('/parent/profile');
  };

  const handleHome = () => {
    setIsDropupOpen(false);
    onLinkClick?.();
    navigate('/');
  };

  return (
    <>
      {/* BỘ CHỌN LỌC HỌC SINH ĐẶT TẠI SIDEBAR */}
      <ChildSwitcher onChildSelected={onLinkClick} />

      {/* MENU ĐIỀU HƯỚNG */}
      <nav className="sidebar-nav">
        <div className="sidebar-nav-title">Parent Menu</div>
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
              <span className="nav-label">Child's Classes</span>
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
              <span className="nav-label">Schedule</span>
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
              <span className="nav-label">Progress & Attendance</span>
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
              <span className="nav-label">Tuition</span>
              {selectedChild && selectedChild.unpaidAmount > 0 && (
                <span className="sidebar-badge bg-danger text-white">Due</span>
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
              <span className="nav-label">Notifications</span>
              {unreadCount > 0 && <span className="sidebar-badge">{unreadCount}</span>}
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
              <span className="nav-label">Feedback & Support</span>
            </NavLink>
          </li>
        </ul>
      </nav>

      {/* FOOTER PROFILE PHỤ HUYNH */}
      <div className="sidebar-footer mt-auto" ref={footerRef}>
        {/* Dropup Menu */}
        {isDropupOpen && (
          <div className="sidebar-user-dropup">
            <div className="px-3 py-2 border-bottom mb-1">
              <div className="fw-bold text-dark text-truncate" style={{ fontSize: '13px' }}>
                Lê Văn Nam
              </div>
              <div className="text-muted text-truncate" style={{ fontSize: '11px' }}>
                {selectedChild ? `Parent of ${selectedChild.name}` : 'Student Parent'}
              </div>
            </div>

            <button
              type="button"
              className="sidebar-dropup-item"
              onClick={handleGoProfile}
            >
              <i className="bi bi-person-gear text-primary fs-6" />
              <span>Edit Profile</span>
            </button>

            <div className="my-1 border-top" style={{ borderColor: 'var(--et-border-subtle)' }} />

            <button
              type="button"
              className="sidebar-dropup-item text-danger"
              onClick={handleHome}
            >
              <i className="bi bi-box-arrow-right fs-6" />
              <span>Back to Home</span>
            </button>
          </div>
        )}

        {/* Clickable Avatar Chip */}
        <button
          type="button"
          className={`student-chip-btn ${isDropupOpen ? 'active' : ''}`}
          onClick={() => setIsDropupOpen(!isDropupOpen)}
          title="Parent Account"
          aria-expanded={isDropupOpen}
        >
          <div
            className="student-avatar"
            style={{ background: 'linear-gradient(135deg, #0ea5e9, #0284c7)' }}
          >
            VN
          </div>
          <div className="student-info">
            <div className="student-name">Lê Văn Nam</div>
            <div className="student-grade">
              {selectedChild ? `Parent of ${selectedChild.name}` : 'Student Parent'}
            </div>
          </div>
          <i className="bi bi-three-dots-vertical text-muted ms-auto small" />
        </button>
      </div>
    </>
  );
};

export default ParentNavMenu;
