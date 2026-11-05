import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { userDAL } from "../../../DAL/userDAL";
import { notificationDAL } from "../../../DAL/notificationDAL";
import { useAuthContext } from "../../../contexts/AuthContext";
import type { UserDto } from "../../../BLL/models/UserDto";
import type { NotificationDto } from "../../../BLL/models/NotificationDto";

export function TeachingAssistantTopBar() {
  const [ta, setTa] = useState<UserDto | null>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { dispatch } = useAuthContext();

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

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    setIsDropdownOpen(false);
    dispatch({ type: "logout" });
    navigate("/");
  };

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

        {/* User Avatar with Dropdown */}
        <div className="position-relative" ref={dropdownRef}>
          <button
            type="button"
            className="profile-btn border-0 p-0 bg-transparent"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            title={ta?.fullName || "Tài khoản trợ giảng"}
            aria-expanded={isDropdownOpen}
          >
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
          </button>

          {isDropdownOpen && (
            <div
              className="dropdown-menu dropdown-menu-end show shadow-lg border rounded-3 py-2 position-absolute"
              style={{
                top: "calc(100% + 8px)",
                right: 0,
                minWidth: "220px",
                zIndex: 1050,
              }}
            >
              <div className="px-3 py-2 border-bottom mb-1">
                <div className="fw-bold text-dark text-truncate">
                  {ta?.fullName || "Trợ giảng"}
                </div>
                <small className="text-muted d-block text-truncate">
                  {ta?.email || "ta@edutrack.edu.vn"}
                </small>
                <span className="badge bg-info-subtle text-info mt-1" style={{ fontSize: "10px" }}>
                  Trợ giảng chuyên môn
                </span>
              </div>

              <Link
                to="/teaching-assistant/profile"
                className="dropdown-item d-flex align-items-center gap-2 py-2"
                onClick={() => setIsDropdownOpen(false)}
              >
                <i className="bi bi-person-circle text-primary fs-6" />
                <span>Hồ sơ cá nhân</span>
              </Link>

              <div className="dropdown-divider my-1" />

              <button
                type="button"
                className="dropdown-item d-flex align-items-center gap-2 py-2 text-danger"
                onClick={handleLogout}
              >
                <i className="bi bi-box-arrow-right fs-6" />
                <span>Đăng xuất</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default TeachingAssistantTopBar;
