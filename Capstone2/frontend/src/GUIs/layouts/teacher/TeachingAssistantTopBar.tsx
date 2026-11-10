import { NotificationBellDropdown } from '../../components/shared/notifications/NotificationQuickViews';
import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {useSelectedUser} from '../../hooks/useSelectedUser';

export function TeachingAssistantTopBar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const {user: ta} = useSelectedUser();

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

  const handleHome = () => {
    setIsDropdownOpen(false);

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

  const userCode = ta?.userCode || '--';
  const displayName = ta?.fullName || 'No account selected';
  const avatarSrc =
    ta?.avatarUrl ||
    '';

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
        <NotificationBellDropdown />

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
              {avatarSrc ? (<img
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
              />) : <span className="profile-avatar">{initials}</span>}
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
                  {ta?.email || '--'}
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
                  onClick={handleHome}
                >
                  <i className="bi bi-box-arrow-right fs-6" />
                  <span>Về trang chủ</span>
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
