import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { ParentSidebar } from './ParentSidebar';
import { ParentNavMenu } from './ParentNavMenu';
import { ChildSwitcher } from '../../components/parent/ChildSwitcher';
import { ParentEmptyState } from '../../components/parent/ParentEmptyState';
import { ParentProvider, useParent } from '../../context/ParentContext';
import '../../../assets/css/student.css';

const ParentLayoutContent: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { childrenList } = useParent();

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <div className="student-scope parent-scope">
      <div className="app-container">
        {/* DESKTOP SIDEBAR */}
        <ParentSidebar />

        {/* MOBILE OFFCANVAS SIDEBAR */}
        {mobileMenuOpen && (
          <div
            className="offcanvas-backdrop fade show"
            onClick={closeMobileMenu}
            style={{ zIndex: 1040 }}
          />
        )}
        <div
          className={`offcanvas offcanvas-start et-offcanvas ${mobileMenuOpen ? 'show' : ''}`}
          tabIndex={-1}
          id="mobileSidebar"
          aria-labelledby="mobileSidebarLabel"
          style={{ visibility: mobileMenuOpen ? 'visible' : 'hidden' }}
        >
          <div className="offcanvas-header border-bottom px-3 py-3">
            <Link
              to="/parent/dashboard"
              className="brand-link"
              id="mobileSidebarLabel"
              onClick={closeMobileMenu}
            >
              <div
                className="brand-logo-icon"
                style={{ background: 'linear-gradient(135deg, #1e40af, #3b82f6)' }}
              >
                <i className="bi bi-people-fill fs-5"></i>
              </div>
              <div>
                <div className="brand-title">EduTrack</div>
                <div className="brand-subtitle text-primary fw-bold">Cổng phụ huynh</div>
              </div>
            </Link>
            <button
              type="button"
              className="btn-close text-reset"
              onClick={closeMobileMenu}
              aria-label="Close"
            ></button>
          </div>

          <div className="offcanvas-body">
            <ParentNavMenu onLinkClick={closeMobileMenu} />
          </div>
        </div>

        {/* MAIN WRAPPER */}
        <div className="main-wrapper">
          {/* Topbar: Luôn hiển thị Child Switcher selector */}
          <header className="mobile-topbar d-flex align-items-center justify-content-between px-3 px-md-4 py-2 bg-white border-bottom shadow-xs">
            <div className="d-flex align-items-center gap-2">
              <button
                className="btn-hamburger d-lg-none me-2"
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Mở menu"
              >
                <i className="bi bi-list fs-5"></i>
              </button>

              <div className="d-none d-sm-flex align-items-center gap-2">
                <span className="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill px-2.5 py-1 small fw-semibold">
                  <i className="bi bi-shield-check me-1"></i> Phụ huynh
                </span>
              </div>
            </div>

            {/* BỘ CHỌN LỌC HỌC SINH (CHILD SELECTOR) */}
            <div className="d-flex align-items-center gap-3">
              <ChildSwitcher />

              {/* Avatar phụ huynh */}
              <div
                className="student-avatar d-none d-md-flex"
                style={{
                  width: '36px',
                  height: '36px',
                  fontSize: '12px',
                  background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
                }}
                title="Tài khoản phụ huynh: Nguyễn Văn Bình"
              >
                VB
              </div>
            </div>
          </header>

          {/* MAIN CONTENT AREA */}
          {childrenList.length === 0 ? (
            // Nếu chưa có học sinh nào -> Hiển thị Empty State với 2 giải pháp
            <ParentEmptyState />
          ) : (
            // Đã có học sinh -> Hiển thị trang con tương ứng với học sinh đang chọn
            <Outlet />
          )}
        </div>
      </div>
    </div>
  );
};

export const ParentLayout: React.FC = () => {
  return (
    <ParentProvider>
      <ParentLayoutContent />
    </ParentProvider>
  );
};

export default ParentLayout;
