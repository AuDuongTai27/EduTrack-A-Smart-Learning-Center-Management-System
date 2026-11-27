import { DataState } from '../../components/Common/DataState';
import { getAuthUser, subscribeAuth } from '../../../api/authApi';
import { LearnerTopbar } from '../../components/shared/LearnerTopbar';
import { BrandIcon } from "../../components/Common/BrandIcon";
import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { ParentSidebar } from './ParentSidebar';
import { ParentNavMenu } from './ParentNavMenu';
import { ParentEmptyState } from '../../components/parent/ParentEmptyState';
import { LearnerPageLoader } from '../../components/student/common/LearnerPageLoader';
import { ParentProvider, useParent } from '../../../contexts/ParentContext';
import '../../../assets/css/student.css';

function ParentLayoutContent() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { childrenList, loading, selectedChild, error, retryChildren } = useParent();
  const location = useLocation();

  const isFeedbackOrProfile =
    location.pathname.startsWith('/parent/feedback') ||
    location.pathname.startsWith('/parent/profile') ||
    location.pathname.startsWith('/parent/notifications');

  const showEmptyState = !loading && childrenList.length === 0 && !isFeedbackOrProfile;

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <div className="student-scope et-parent-portal">
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
              >
                <BrandIcon size={34} />
              </div>
              <div>
                <div className="brand-title">EduTrack</div>
                <div className="brand-subtitle text-primary fw-bold">Parent Portal</div>
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

        {/* Main wrapper */}
        <div className="main-wrapper">
          <LearnerTopbar selectedChildId={selectedChild?.id} parentLoading={loading} role="parent" onOpenMenu={() => setMobileMenuOpen(true)} accountDetail={selectedChild ? `Parent of ${selectedChild.name}` : undefined} />

          {/* Main Content Area */}
          {error && !isFeedbackOrProfile ? <DataState error message={error} onRetry={retryChildren} /> : loading && !isFeedbackOrProfile ? (
            <LearnerPageLoader
              title="Loading student profile..."
              message="The system is syncing the children list and latest learning data."
            />
          ) : showEmptyState ? (
            <ParentEmptyState />
          ) : (
            <Outlet key={selectedChild?.id ?? 'parent-only'} />
          )}
        </div>
      </div>
    </div>
  );
}

export function ParentLayout() {
  const auth = React.useSyncExternalStore(subscribeAuth, getAuthUser);
  return (
    <ParentProvider key={auth?.userId}>
      <ParentLayoutContent />
    </ParentProvider>
  );
}

export default ParentLayout;
