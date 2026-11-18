import React from 'react';
import { Link } from 'react-router-dom';
import type { ClassDetailItem } from './classDetailData';

interface ClassHeroBannerProps {
  cls: ClassDetailItem;
  materialsCount: number;
  assignmentsCount: number;
}

export function ClassHeroBanner({
  cls,
  materialsCount,
  assignmentsCount,
}: ClassHeroBannerProps) {
  return (
    <div
      className="class-hero-banner"
      id="heroBanner"
      style={{
        background: 'linear-gradient(135deg, #065F46 0%, #078444 60%, #10B981 100%)',
      }}
    >
      {/* Back Button */}
      <Link to="/student/classes" className="btn-back-hero">
        <i className="bi bi-arrow-left"></i>
        <span>Back</span>
      </Link>

      {/* Breadcrumbs */}
      <div className="hero-breadcrumbs">
        <Link to="/student/dashboard">Dashboard</Link>
        <i className="bi bi-chevron-right fs-xs"></i>
        <Link to="/student/classes">My Classes</Link>
        <i className="bi bi-chevron-right fs-xs"></i>
        <span className="breadcrumb-current" id="breadcrumbClass">{cls.name}</span>
      </div>

      {/* Hero Main Row */}
      <div className="hero-main-row">
        <div>
          <span className="hero-subject-pill" id="heroSubject">{cls.subject}</span>
          <h1 className="hero-class-title" id="heroTitle">{cls.name}</h1>
        </div>

        {/* Quick Stats Chips */}
        <div className="hero-stats-group">
          <div className="hero-stat-chip">
            <div className="hero-stat-number" id="statMaterials">{materialsCount}</div>
            <div className="hero-stat-label">Materials</div>
          </div>
          <div className="hero-stat-chip">
            <div className="hero-stat-number" id="statAssignments">{assignmentsCount}</div>
            <div className="hero-stat-label">Assignments</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassHeroBanner;
