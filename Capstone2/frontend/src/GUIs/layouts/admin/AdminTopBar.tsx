import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { userDAL } from "../../../DAL/userDAL";
import { notificationDAL } from "../../../DAL/notificationDAL";
import type { UserDto } from "../../../BLL/models/UserDto";
import type { NotificationDto } from "../../../BLL/models/NotificationDto";

export default function AdminTopBar() {
  const location = useLocation();
  const isAdminStaff = location.pathname.startsWith("/admin-staff");
  const targetUserId = isAdminStaff ? 2 : 1; // 2: ADM001 (Trần Thị Nhân Viên), 1: MGR001 (Nguyễn Văn Quản Lý)
  const notifUrl = isAdminStaff ? "/admin-staff/notifications" : "/center-manager/notifications";

  const [user, setUser] = useState<UserDto | null>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  useEffect(() => {
    let isMounted = true;
    async function loadTopBarData() {
      try {
        const [userRes, notifRes] = await Promise.all([
          userDAL.getUserById(targetUserId),
          notificationDAL.getAllNotifications(),
        ]);
        if (isMounted) {
          if (userRes) setUser(userRes);
          if (notifRes.data) {
            const unread = notifRes.data.filter((n: NotificationDto) => !n.isRead).length;
            setUnreadCount(unread > 0 ? unread : notifRes.data.length);
          }
        }
      } catch (err) {
        console.warn("Lỗi tải thông tin AdminTopBar:", err);
      }
    }
    loadTopBarData();
    return () => {
      isMounted = false;
    };
  }, [targetUserId]);

  const initials = user?.fullName
    ? user.fullName
        .split(" ")
        .filter(Boolean)
        .slice(-2)
        .map((w) => w[0]?.toUpperCase())
        .join("")
    : isAdminStaff ? "NV" : "CM";

  const displayName = user?.fullName || (isAdminStaff ? "Trần Thị Nhân Viên" : "Nguyễn Văn Quản Lý");
  const roleTitle = isAdminStaff ? "Nhân viên Giáo vụ (Admin Staff)" : "Giám đốc trung tâm (Center Manager)";

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
          <input
            type="text"
            placeholder={isAdminStaff ? "Tìm học sinh, lớp học, đơn từ..." : "Tìm kiếm toàn hệ thống EduTrack..."}
          />
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
          to={notifUrl}
          className="icon-btn notification-btn text-decoration-none position-relative"
          title={`Thông báo (${unreadCount} mới)`}
        >
          <i className="bi bi-bell" />
          {unreadCount > 0 && <span className="status-dot" />}
        </Link>
        <div className="d-flex align-items-center gap-2 ps-2">
          <div className="text-end d-none d-md-block">
            <span className="fw-bold d-block text-dark small" style={{ lineHeight: 1.2 }}>
              {displayName}
            </span>
            <span className="text-muted" style={{ fontSize: "11px" }}>
              {roleTitle}
            </span>
          </div>
          <div className="profile-btn" title={`${displayName} - ${roleTitle}`}>
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={displayName}
                className="rounded-circle"
                style={{ width: "32px", height: "32px", objectFit: "cover" }}
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            ) : (
              <span className="profile-avatar">{initials}</span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
