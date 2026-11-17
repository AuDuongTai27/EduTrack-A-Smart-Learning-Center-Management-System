import { BrandIcon } from "../../components/Common/BrandIcon";
import React from 'react';
import { Link } from 'react-router-dom';
import { ParentNavMenu } from './ParentNavMenu';
import '../../../assets/css/student-sidebar-academy.css';

export function ParentSidebar() {
  return (
    <aside className="sidebar parent-sidebar-academy">
      {/* Brand / Logo */}
      <div className="sidebar-header">
        <Link to="/parent/dashboard" className="brand-link">
          <div
            className="brand-logo-icon"
          >
            <BrandIcon size={34} />
          </div>
          <div>
            <div className="brand-title">EduTrack</div>
            <div className="brand-subtitle text-primary fw-bold" style={{ fontSize: '11px' }}>
              Parent Portal
            </div>
          </div>
        </Link>
      </div>

      {/* Navigation Menu */}
      <ParentNavMenu />
    </aside>
  );
};

export default ParentSidebar;
