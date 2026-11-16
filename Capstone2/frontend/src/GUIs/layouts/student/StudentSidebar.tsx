import { BrandIcon } from "../../components/Common/BrandIcon";
import React from "react";
import { Link } from "react-router-dom";
import { StudentNavMenu } from "./StudentNavMenu";

export function StudentSidebar() {
  return (
    <aside className="sidebar">
      {/* Brand / Logo */}
      <div className="sidebar-header">
        <Link to="/student/dashboard" className="brand-link">
          <div className="brand-logo-icon">
            <BrandIcon size={34} />
          </div>
          <div>
            <div className="brand-title">EduTrack</div>
            <div className="brand-subtitle">Student Portal</div>
          </div>
        </Link>
      </div>

      {/* Navigation Menu + Student Chip */}
      <StudentNavMenu />
    </aside>
  );
};

export default StudentSidebar;
