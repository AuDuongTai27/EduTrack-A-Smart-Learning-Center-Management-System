import React, { useState, useEffect, useSyncExternalStore } from 'react';
import { NavLink } from 'react-router-dom';
import { useParent } from '../../../contexts/ParentContext';
import { ChildSwitcher } from '../../components/parent/ChildSwitcher';
import { learningDAL } from '../../../DAL/learningDAL';
import { DEFAULT_PARENT_ID } from '../../../DAL/parentDAL';
import { getAuthUser, subscribeAuth } from '../../../api/authApi';

interface ParentNavMenuProps {
  onLinkClick?: () => void;
}

export function ParentNavMenu({ onLinkClick }: ParentNavMenuProps) {
  const { selectedChild } = useParent();
  const targetStudentId = selectedChild?.id;
  const [unreadCount, setUnreadCount] = useState<number | null>(null);
  const authUser = useSyncExternalStore(subscribeAuth, getAuthUser);

  useEffect(() => {
    let mounted = true;
    setUnreadCount(null);
    const refreshCount = async () => {
      try {
        const count = await learningDAL.getParentUnreadCount(DEFAULT_PARENT_ID, targetStudentId);
        if (mounted) setUnreadCount(count);
      } catch { if (mounted) setUnreadCount(null); }
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

  const sections = [
    {
      title: 'MAIN',
      items: [{ to: '/parent/dashboard', icon: 'bi-grid-1x2', label: 'Dashboard' }],
    },
    {
      title: 'ACADEMIC',
      items: [
        { to: '/parent/classes', icon: 'bi-collection', label: "Child's Classes" },
        { to: '/parent/schedule', icon: 'bi-calendar-event', label: 'Schedule' },
      ],
    },
    {
      title: 'FINANCE',
      items: [
        {
          to: '/parent/tuition',
          icon: 'bi-credit-card',
          label: 'Tuition',
          badge: selectedChild && selectedChild.unpaidAmount > 0 ? 'Due' : null,
          badgeClass: 'bg-danger text-white',
        },
      ],
    },
    {
      title: 'COMMUNICATION',
      items: [
        {
          to: '/parent/notifications',
          icon: 'bi-bell',
          label: 'Notifications',
          badge: unreadCount !== null && unreadCount > 0 ? unreadCount : null,
        },
        { to: '/parent/feedback', icon: 'bi-chat-dots', label: 'Feedback & Support' },
      ],
    },
  ];

  return (
    <>
      {/* BỘ CHỌN LỌC HỌC SINH ĐẶT TẠI SIDEBAR */}
      <ChildSwitcher onChildSelected={onLinkClick} />

      {/* MENU ĐIỀU HƯỚNG */}
      <nav className="sidebar-nav">
        {sections.map((section) => (
          <React.Fragment key={section.title}>
            <div className="sidebar-nav-title">{section.title}</div>
            <ul className="sidebar-nav-list">
              {section.items.map((item) => (
                <li className="sidebar-nav-item" key={item.to}>
                  <NavLink
                    to={item.to}
                    onClick={onLinkClick}
                    className={({ isActive }) =>
                      `sidebar-nav-link ${isActive ? 'active' : ''}`
                    }
                  >
                    <span className="nav-icon"><i className={`bi ${item.icon}`}></i></span>
                    <span className="nav-label">{item.label}</span>
                    {'badge' in item && item.badge !== null && item.badge !== undefined && (
                      <span className={`sidebar-badge ${'badgeClass' in item && item.badgeClass ? item.badgeClass : ''}`}>
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </React.Fragment>
        ))}
      </nav>
    </>
  );
}

export default ParentNavMenu;
