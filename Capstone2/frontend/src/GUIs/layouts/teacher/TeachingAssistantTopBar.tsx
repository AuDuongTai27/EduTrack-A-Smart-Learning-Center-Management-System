import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { userDAL } from "../../../DAL/userDAL";
import { notificationDAL } from "../../../DAL/notificationDAL";
import type { UserDto } from "../../../BLL/models/UserDto";
import type { NotificationDto } from "../../../BLL/models/NotificationDto";

export function TeachingAssistantTopBar() {
  const [ta, setTa] = useState<UserDto | null>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  useEffect(() => {
    let isMounted = true;
    async function loadTopBarData() {
      try {
        const [userRes, notifRes] = await Promise.all([
          userDAL.getUserById(5), // TA: TA001 - Âu Dương Tài
          notificationDAL.getAllNotifications(),
        ]);
        if (isMounted) {
          if (userRes) setTa(userRes);
          if (notifRes.data) {
            const unread = notifRes.data.filter((n: NotificationDto) => !n.isRead).length;
            setUnreadCount(unread > 0 ? unread : notifRes.data.length);
          }
        }
      } catch (err) {
        console.warn("Lỗi tải thông tin TeachingAssistantTopBar:", err);
      }
    }
    loadTopBarData();
    return () => {
      isMounted = false;
    };
  }, []);

  const initials = ta?.fullName
    ? ta.fullName
        .split(" ")
        .filter(Boolean)
        .slice(-2)
        .map((w) => w[0]?.toUpperCase())
        .join("")
    : "TA";

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          className="mobile-menu-btn"
          id="mobileMenuBtn"
          type="button"
          aria-label="Open menu"
        >
          <i className="bi bi-list" />
        </button>
        <div className="search-box">
          <i className="bi bi-search" />
          <input type="text" placeholder="Tìm kiếm lớp học, sinh viên, tài liệu trợ giảng..." />
        </div>
      </div>
      <div className="topbar-actions">
        <button className="academic-year-btn" type="button">
          <i className="bi bi-calendar3" />
          <span>Năm học: 2026 - 2027</span>
        </button>
        <button className="icon-btn" type="button" title="Giao diện">
          <i className="bi bi-moon-stars" />
        </button>
        <Link
          to="/teaching-assistant/notifications"
          className="icon-btn notification-btn text-decoration-none position-relative"
          title="Thông báo"
        >
          <i className="bi bi-bell" />
          {unreadCount > 0 && <span className="status-dot" />}
        </Link>
        <Link className="profile-btn text-decoration-none" to="/teaching-assistant/profile" title={ta?.fullName || "Hồ sơ trợ giảng"}>
          {ta?.avatarUrl ? (
            <img
              src={ta.avatarUrl}
              alt={ta.fullName}
              className="rounded-circle"
              style={{ width: "32px", height: "32px", objectFit: "cover" }}
              onError={(e) => {
                (e.target as HTMLElement).style.display = "none";
              }}
            />
          ) : (
            <span className="profile-avatar">{initials}</span>
          )}
        </Link>
      </div>
    </header>
  );
}

export default TeachingAssistantTopBar;
