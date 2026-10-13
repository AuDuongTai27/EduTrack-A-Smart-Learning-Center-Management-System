import React from 'react';
import { Link } from 'react-router-dom';
import { ParentNavMenu } from './ParentNavMenu';

export const ParentSidebar: React.FC = () => {
  return (
    <aside className="sidebar">
      {/* Brand / Logo */}
      <div className="sidebar-header">
        <Link to="/parent/dashboard" className="brand-link">
          <div
            className="brand-logo-icon"
            style={{
              background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
            }}
          >
            <i className="bi bi-people-fill fs-5"></i>
          </div>
          <div>
            <div className="brand-title">EduTrack</div>
            <div className="brand-subtitle text-primary fw-bold" style={{ fontSize: '11px' }}>
              Cổng phụ huynh
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
