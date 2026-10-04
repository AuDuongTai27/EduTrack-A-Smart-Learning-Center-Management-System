import React, { useState } from "react";
import { Outlet, Link } from "react-router-dom";
import { StudentSidebar } from "./StudentSidebar";
import { StudentNavMenu } from "./StudentNavMenu";
import "../../../assets/css/student.css";

export const StudentLayout: React.FC = () => {
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
                <i className="bi bi-mortarboard-fill fs-5"></i>
              </div>
              <div>
                <div className="brand-title">EduTrack</div>
                <div className="brand-subtitle">Cổng học sinh</div>
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
          {/* Mobile Topbar */}
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
                style={{ width: "28px", height: "28px", borderRadius: "8px" }}
              >
                <i className="bi bi-mortarboard-fill fs-6"></i>
              </div>
              <span className="brand-title fs-6">EduTrack</span>
            </div>
            <div
              className="student-avatar"
              style={{ width: "32px", height: "32px", fontSize: "11px" }}
            >
              MA
            </div>
          </header>

          {/* Main Content Area */}
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default StudentLayout;
