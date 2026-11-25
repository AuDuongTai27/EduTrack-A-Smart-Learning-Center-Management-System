import { announceTopbarPanel, useTopbarDismiss } from '../../hooks/useTopbarDismiss';
import { toggleMobileSidebar } from '../../hooks/useSidebarToggle';
import '../../../assets/css/simplified-topbar.css';
import { NotificationBellDropdown } from '../../components/shared/notifications/NotificationQuickViews';
import CenterManagerTopbarAvatar from '../../components/admin/CenterManager/CenterManagerTopbarAvatar';
import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {useSelectedUser} from '../../hooks/useSelectedUser';
import { authApi, getAuthUser, getStaffWorkspaces, switchActiveWorkspace } from '../../../api/authApi';

export function TeacherTopBar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();
  const {user: teacher} = useSelectedUser();

  useTopbarDismiss(isDropdownOpen, () => setIsDropdownOpen(false), dropdownRef, triggerRef);

  const handleHome = () => {
    setIsDropdownOpen(false);

    authApi.logout();
    navigate("/");
  };

  const userCode = teacher?.userCode || '--';
  const displayName = teacher?.fullName || 'No account selected';

  return (
    <header className="topbar et-simplified-topbar et-unified-topbar">
      <div className="topbar-left">
        <button
          className="mobile-menu-btn"
          id="mobileMenuBtn"
          type="button"
          onClick={toggleMobileSidebar}
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
            aria-label={`Teacher account: ${displayName}`}
            aria-expanded={isDropdownOpen}
          >
            {/* Avatar bên trái */}
            <div className="flex-shrink-0">
              <CenterManagerTopbarAvatar key={teacher?.avatarUrl} name={teacher?.fullName} url={teacher?.avatarUrl} />
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
                  {teacher?.email || '--'}
                </small>
                <div className="d-flex align-items-center gap-1.5 mb-2">
                  <span className="badge bg-primary-subtle text-primary border border-primary-subtle" style={{ fontSize: "11px" }}>
                    #{userCode}
                  </span>
                  <span className="badge bg-light text-secondary border" style={{ fontSize: "11px" }}>
                    Teacher
                  </span>
                </div>

                {/* Dòng chữ nhỏ màu xanh Xem hồ sơ kèm mũi tên */}
                <div>
                  <Link
                    to="/teacher/profile"
                    className="text-primary text-decoration-none small fw-semibold d-inline-flex align-items-center gap-1"
                    style={{ fontSize: "12px" }}
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <span>View Profile</span>
                    <i className="bi bi-arrow-right" style={{ fontSize: "11px" }} />
                  </Link>
                </div>
              </div>

              {(() => {
                const effectiveRoles = teacher?.roles?.length ? teacher.roles : getAuthUser()?.roles;
                const workspaces = getStaffWorkspaces(effectiveRoles);
                if (workspaces.length < 2) return null;
                return (
                  <div className="px-3 py-2 border-bottom">
                    <small className="text-muted fw-semibold d-block mb-1" style={{ fontSize: "11.5px" }}>
                      Switch Workspace
                    </small>
                    <div className="d-flex flex-column gap-1">
                      {workspaces.map((ws) => {
                        const isCurrent = ws.key === "teaching";
                        return (
                          <button
                            key={ws.key}
                            type="button"
                            disabled={isCurrent}
                            className={`btn btn-sm d-flex align-items-center justify-content-between text-start ${
                              isCurrent ? "btn-primary fw-semibold" : "btn-outline-secondary"
                            }`}
                            onClick={() => {
                              setIsDropdownOpen(false);
                              switchActiveWorkspace(ws.role, ws.path);
                              navigate(ws.path);
                            }}
                          >
                            <span>{ws.label}</span>
                            {isCurrent ? (
                              <span className="badge bg-white text-primary">Active</span>
                            ) : (
                              <i className="bi bi-box-arrow-up-right small" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

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

export default TeacherTopBar;
