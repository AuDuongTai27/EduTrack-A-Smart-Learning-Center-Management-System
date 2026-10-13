import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { ParentSidebar } from './ParentSidebar';
import { ParentNavMenu } from './ParentNavMenu';
import { ParentEmptyState } from '../../components/parent/ParentEmptyState';
import { ParentProvider, useParent } from '../../context/ParentContext';
import '../../../assets/css/student.css';

const ParentLayoutContent: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { childrenList } = useParent();
  const location = useLocation();

  const isFeedbackOrProfile =
    location.pathname.startsWith('/parent/feedback') ||
    location.pathname.startsWith('/parent/profile');

  const showEmptyState = childrenList.length === 0 && !isFeedbackOrProfile;

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <div className="student-scope">
      <div className="app-container">
        {/* DESKTOP SIDEBAR (Chứa Brand, Child Selector và Navigation) */}
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

        {/* MAIN WRAPPER (Chuẩn theo Student Layout - Không có header desktop) */}
        <div className="main-wrapper">
          {/* Mobile Topbar (Chỉ hiển thị khi ở màn hình nhỏ / điện thoại) */}
          <header className="mobile-topbar">
            <button
              className="btn-hamburger"
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Mở menu"
            >
              <i className="bi bi-list fs-5"></i>
            </button>
            <div className="d-flex align-items-center gap-2">
              <div
                className="brand-logo-icon"
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
                }}
              >
                <i className="bi bi-people-fill fs-6"></i>
              </div>
              <span className="brand-title fs-6">EduTrack</span>
            </div>
            <div
              className="student-avatar"
              style={{
                width: '32px',
                height: '32px',
                fontSize: '11px',
                background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
              }}
              title="Phụ huynh: Nguyễn Văn Bình"
            >
              VB
            </div>
          </header>

          {/* Main Content Area */}
          {showEmptyState ? (
            <ParentEmptyState />
          ) : (
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
