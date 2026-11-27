import React, { useState, useEffect, useSyncExternalStore } from "react";
import { NavLink } from "react-router-dom";
import { learningDAL, DEFAULT_STUDENT_ID } from "../../../DAL/learningDAL";
import { getAuthUser, subscribeAuth } from "../../../api/authApi";

interface StudentNavMenuProps {
  onLinkClick?: () => void;
}

export function StudentNavMenu({ onLinkClick }: StudentNavMenuProps) {
  const [unreadCount, setUnreadCount] = useState<number | null>(null);
  const authUser = useSyncExternalStore(subscribeAuth, getAuthUser);

  useEffect(() => {
    let mounted = true;
    setUnreadCount(null);
    const refreshCount = async () => {
      try {
        const count = await learningDAL.getStudentUnreadCount(DEFAULT_STUDENT_ID);
        if (mounted) setUnreadCount(count);
      } catch { if (mounted) setUnreadCount(null); }
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

  const sections = [
    {
      title: "MAIN",
      items: [{ to: "/student/dashboard", icon: "bi-grid-1x2", label: "Dashboard" }],
    },
    {
      title: "ACADEMIC",
      items: [
        { to: "/student/classes", icon: "bi-collection", label: "Classes" },
        { to: "/student/schedule", icon: "bi-calendar-event", label: "Schedule" },
      ],
    },
    {
      title: "FINANCE",
      items: [{ to: "/student/tuition", icon: "bi-credit-card", label: "Tuition" }],
    },
    {
      title: "COMMUNICATION",
      items: [
        { to: "/student/notifications", icon: "bi-bell", label: "Notifications", badge: unreadCount !== null && unreadCount > 0 ? unreadCount : null },
        { to: "/student/feedback", icon: "bi-chat-dots", label: "Feedback & Support" },
      ],
    },
  ];

  return (
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
                    `sidebar-nav-link ${isActive ? "active" : ""}`
                  }
                >
                  <span className="nav-icon"><i className={`bi ${item.icon}`}></i></span>
                  <span className="nav-label">{item.label}</span>
                  {"badge" in item && item.badge !== null && item.badge !== undefined && (
                    <span className="sidebar-badge">{item.badge}</span>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </React.Fragment>
      ))}
    </nav>
  );
}

export default StudentNavMenu;
