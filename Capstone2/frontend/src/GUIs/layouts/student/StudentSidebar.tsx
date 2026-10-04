import React from "react";
import { Link } from "react-router-dom";
import { StudentNavMenu } from "./StudentNavMenu";

export const StudentSidebar: React.FC = () => {
  return (
    <aside className="sidebar">
      {/* Brand / Logo */}
      <div className="sidebar-header">
        <Link to="/student/dashboard" className="brand-link">
          <div className="brand-logo-icon">
            <i className="bi bi-mortarboard-fill fs-5"></i>
          </div>
          <div>
            <div className="brand-title">EduTrack</div>
            <div className="brand-subtitle">Cổng học sinh</div>
          </div>
        </Link>
      </div>

      {/* Navigation Menu + Student Chip */}
      <StudentNavMenu />
    </aside>
  );
};

export default StudentSidebar;
