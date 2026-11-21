import React, { useState, useEffect, useSyncExternalStore } from "react";
import { NavLink } from "react-router-dom";
import { learningDAL, DEFAULT_STUDENT_ID } from "../../../DAL/learningDAL";
import { getAuthUser, subscribeAuth } from "../../../api/authApi";

interface StudentNavMenuProps {
  onLinkClick?: () => void;
}

export function StudentNavMenu({ onLinkClick }: StudentNavMenuProps) {
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const authUser = useSyncExternalStore(subscribeAuth, getAuthUser);

  useEffect(() => {
    let mounted = true;
    const refreshCount = async () => {
      const count = await learningDAL.getStudentUnreadCount(DEFAULT_STUDENT_ID);
      if (mounted) setUnreadCount(count);
    };
    void refreshCount();
    const onUpdate = () => void refreshCount();
    window.addEventListener("notifications-updated", onUpdate);
    window.addEventListener("focus", onUpdate);
    return () => {
      mounted = false;
      window.removeEventListener("notifications-updated", onUpdate);
      window.removeEventListener("focus", onUpdate);
    };
  }, [authUser?.userId]);

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
              <span className="nav-label">Classes</span>
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
              <span className="nav-label">Schedule</span>
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
              <span className="nav-label">Tuition</span>
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
              <span className="nav-label">Notifications</span>
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
              <span className="nav-label">Feedback & Support</span>
            </NavLink>
          </li>
        </ul>
      </nav>

    </>
  );
}

export default StudentNavMenu;
