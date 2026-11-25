import { BrandIcon } from "../../components/Common/BrandIcon";
import React from "react";
import { Link } from "react-router-dom";
import { StudentNavMenu } from "./StudentNavMenu";
import { useSidebarToggle } from "../../hooks/useSidebarToggle";
import "../../../assets/css/student-sidebar-academy.css";

export function StudentSidebar() {
  const { collapsed, toggleSidebar } = useSidebarToggle();
  return (
    <aside className="sidebar student-sidebar-academy" id="sidebar">
      {/* Brand / Logo */}
      <div className="sidebar-header d-flex align-items-center justify-content-between">
        <Link to="/student/dashboard" className="brand-link">
          <div className="brand-logo-icon">
            <BrandIcon size={34} />
          </div>
          <div className="brand-text-group">
            <div className="brand-title">EduTrack</div>
            <div className="brand-subtitle">Student Portal</div>
          </div>
        </Link>
        <button
          className="sidebar-collapse-btn"
          type="button"
          onClick={toggleSidebar}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={!collapsed}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <i className={`bi ${collapsed ? "bi-layout-sidebar-inset" : "bi-list"}`} />
        </button>
      </div>

      {/* Navigation Menu */}
      <StudentNavMenu />
    </aside>
  );
};

export default StudentSidebar;
