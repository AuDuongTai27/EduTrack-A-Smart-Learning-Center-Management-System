import React, { useState, useEffect, useSyncExternalStore } from 'react';
import { NavLink } from 'react-router-dom';
import { useParent } from '../../../contexts/ParentContext';
import { ChildSwitcher } from '../../components/parent/ChildSwitcher';
import { learningDAL, DEFAULT_STUDENT_ID } from '../../../DAL/learningDAL';
import { DEFAULT_PARENT_ID } from '../../../DAL/parentDAL';
import { getAuthUser, subscribeAuth } from '../../../api/authApi';

interface ParentNavMenuProps {
  onLinkClick?: () => void;
}

export function ParentNavMenu({ onLinkClick }: ParentNavMenuProps) {
  const { selectedChild } = useParent();
  const targetStudentId = selectedChild?.id || DEFAULT_STUDENT_ID;
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const authUser = useSyncExternalStore(subscribeAuth, getAuthUser);

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
  }, [targetStudentId, authUser?.userId]);

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

    </>
  );
}

export default ParentNavMenu;
