import { LearnerTopbar } from '../../components/shared/LearnerTopbar';
import { BrandIcon } from "../../components/Common/BrandIcon";
import React, { useState } from "react";
import { Outlet, Link } from "react-router-dom";
import { StudentSidebar } from "./StudentSidebar";
import { StudentNavMenu } from "./StudentNavMenu";
import "../../../assets/css/student.css";

export function StudentLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <div className="student-scope">
      <div className="app-container">
        {/* DESKTOP SIDEBAR */}
        <StudentSidebar />

        {/* MOBILE OFFCANVAS SIDEBAR */}
        {mobileMenuOpen && (
          <div
            className="offcanvas-backdrop fade show"
            onClick={closeMobileMenu}
            style={{ zIndex: 1040 }}
          />
        )}
        <div
          className={`offcanvas offcanvas-start et-offcanvas ${mobileMenuOpen ? "show" : ""}`}
          tabIndex={-1}
          id="mobileSidebar"
          aria-labelledby="mobileSidebarLabel"
          style={{ visibility: mobileMenuOpen ? "visible" : "hidden" }}
        >
          <div className="offcanvas-header border-bottom px-3 py-3">
            <Link
              to="/student/dashboard"
              className="brand-link"
              id="mobileSidebarLabel"
              onClick={closeMobileMenu}
            >
              <div className="brand-logo-icon">
                <BrandIcon size={34} />
              </div>
              <div>
                <div className="brand-title">EduTrack</div>
                <div className="brand-subtitle">Student Portal</div>
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
            <StudentNavMenu onLinkClick={closeMobileMenu} />
          </div>
        </div>

        {/* MAIN WRAPPER */}
        <div className="main-wrapper">
          <LearnerTopbar role="student" onOpenMenu={() => setMobileMenuOpen(true)} />

          {/* Main Content Area */}
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default StudentLayout;
