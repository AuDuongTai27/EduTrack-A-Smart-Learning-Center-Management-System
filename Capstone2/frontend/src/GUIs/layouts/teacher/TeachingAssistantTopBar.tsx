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

  const userCode = ta?.userCode || "TA001";
  const displayName = ta?.fullName || "Âu Dương Tài";
  const avatarSrc =
    ta?.avatarUrl ||
    "https://api.dicebear.com/7.x/avataaars/svg?seed=tai";

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

        {/* User Info & Avatar with Dropdown */}
        <div className="position-relative ms-1" ref={dropdownRef}>
          <button
            type="button"
            className="btn p-1 d-flex align-items-center gap-2 border-0 bg-transparent text-start shadow-none"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            title={displayName}
            aria-expanded={isDropdownOpen}
            style={{ width: "190px" }}
          >
            {/* Avatar bên trái */}
            <div className="flex-shrink-0">
              <img
                src={avatarSrc}
                alt={displayName}
                className="rounded-circle border"
                style={{ width: "36px", height: "36px", objectFit: "cover" }}
                onError={(e) => {
                  const target = e.currentTarget;
                  if (target.src !== "/assets/img/profiles/avatar-27.jpg") {
                    target.src = "/assets/img/profiles/avatar-27.jpg";
                  }
                }}
              />
            </div>

            {/* Thông tin: Tên bên phải avatar và user code bên dưới tên, độ rộng cố định và text-truncate */}
            <div className="flex-grow-1 overflow-hidden" style={{ lineHeight: 1.2, minWidth: 0 }}>
              <span className="fw-semibold text-dark text-truncate d-block" style={{ fontSize: "13.5px" }} title={displayName}>
                {displayName}
              </span>
              <span className="text-muted text-truncate d-block" style={{ fontSize: "11.5px", fontWeight: 500 }}>
                #{userCode}
              </span>
            </div>

            <i className="bi bi-chevron-down text-muted flex-shrink-0" style={{ fontSize: "11px" }} />
          </button>

          {isDropdownOpen && (
            <div
              className="dropdown-menu dropdown-menu-end show shadow-lg border rounded-3 py-2 position-absolute"
              style={{
                top: "calc(100% + 8px)",
                right: 0,
                minWidth: "230px",
                zIndex: 1050,
              }}
            >
              {/* Header Dropdown: Thông tin người dùng */}
              <div className="px-3 py-2 border-bottom">
                <div className="fw-bold text-dark text-truncate" style={{ fontSize: "14px" }}>
                  {displayName}
                </div>
                <small className="text-muted d-block text-truncate mb-1">
                  {ta?.email || "tai.auduong@edutrack.edu.vn"}
                </small>
                <div className="d-flex align-items-center gap-1.5 mb-2">
                  <span className="badge bg-primary-subtle text-primary border border-primary-subtle" style={{ fontSize: "11px" }}>
                    #{userCode}
                  </span>
                  <span className="badge bg-light text-secondary border" style={{ fontSize: "11px" }}>
                    Trợ giảng
                  </span>
                </div>

                {/* Dòng chữ nhỏ màu xanh Xem hồ sơ kèm mũi tên */}
                <div>
                  <Link
                    to="/teaching-assistant/profile"
                    className="text-primary text-decoration-none small fw-semibold d-inline-flex align-items-center gap-1"
                    style={{ fontSize: "12px" }}
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <span>Xem hồ sơ</span>
                    <i className="bi bi-arrow-right" style={{ fontSize: "11px" }} />
                  </Link>
                </div>
              </div>

              {/* Nút Đăng xuất */}
              <div className="pt-1">
                <button
                  type="button"
                  className="dropdown-item d-flex align-items-center gap-2 py-2 text-danger"
                  onClick={handleLogout}
                >
                  <i className="bi bi-box-arrow-right fs-6" />
                  <span>Đăng xuất</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default TeachingAssistantTopBar;
