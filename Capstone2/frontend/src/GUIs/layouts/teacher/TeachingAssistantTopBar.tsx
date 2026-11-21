import { announceTopbarPanel, useTopbarDismiss } from '../../hooks/useTopbarDismiss';
import '../../../assets/css/simplified-topbar.css';
import { NotificationBellDropdown } from '../../components/shared/notifications/NotificationQuickViews';
import CenterManagerTopbarAvatar from '../../components/admin/CenterManager/CenterManagerTopbarAvatar';
import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {useSelectedUser} from '../../hooks/useSelectedUser';
import { authApi } from '../../../api/authApi';

export function TeachingAssistantTopBar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();
  const {user: ta} = useSelectedUser();

  useTopbarDismiss(isDropdownOpen, () => setIsDropdownOpen(false), dropdownRef, triggerRef);

  const handleHome = () => {
    setIsDropdownOpen(false);

    authApi.logout();
    navigate("/");
  };

  const userCode = ta?.userCode || '--';
  const displayName = ta?.fullName || 'No account selected';

  return (
    <header className="topbar et-simplified-topbar et-unified-topbar">
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
        <NotificationBellDropdown />

        {/* User Info & Avatar with Dropdown */}
        <div className="ntf-scope position-relative" ref={dropdownRef}>
          <button
            type="button"
            className="ntf-account-trigger teaching-account-trigger"
            ref={triggerRef}
            onClick={() => { if (!isDropdownOpen) announceTopbarPanel(dropdownRef); setIsDropdownOpen(!isDropdownOpen); }}
            title={displayName}
            aria-label={`Teaching Assistant account: ${displayName}`}
            aria-expanded={isDropdownOpen}
          >
            {/* Avatar bên trái */}
            <div className="flex-shrink-0">
              <CenterManagerTopbarAvatar key={ta?.avatarUrl} name={ta?.fullName} url={ta?.avatarUrl} />
            </div>

            {/* Account name */}
            <div className="ntf-account-label flex-grow-1 overflow-hidden" style={{ lineHeight: 1.2, minWidth: 0 }}>
              <span className="fw-semibold text-dark text-truncate d-block" style={{ fontSize: "13.5px" }} title={displayName}>
                {displayName}
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
                <div className="fw-bold text-dark topbar-profile-full-name" style={{ fontSize: "14px" }}>
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
                    Teaching Assistant
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
                    <span>View Profile</span>
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
                  <span>Logout</span>
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
