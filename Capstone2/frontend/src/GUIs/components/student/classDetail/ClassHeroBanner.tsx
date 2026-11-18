import React from 'react';
import { Link } from 'react-router-dom';
import type { ClassDetailItem } from './classDetailData';
import { ClassHeroDecoration } from '../../Common/ClassHeroDecoration';

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
    <div className="class-hero-banner et-class-hero" id="heroBanner" style={{ background: 'var(--et-brand-banner)' }}>
      <ClassHeroDecoration subject={cls.subject} />
      {/* Back Button */}
      <Link to="/student/classes" className="btn-back-hero">
        <i className="bi bi-arrow-left"></i>
        <span>Back</span>
      </Link>

      {/* Breadcrumbs */}
      <div className="hero-breadcrumbs et-class-hero-breadcrumbs">
        <Link to="/student/dashboard">Dashboard</Link>
        <i className="bi bi-chevron-right fs-xs"></i>
        <Link to="/student/classes">My Classes</Link>
        <i className="bi bi-chevron-right fs-xs"></i>
        <span className="breadcrumb-current" id="breadcrumbClass">{cls.name}</span>
      </div>

      {/* Hero Main Row */}
      <div className="hero-main-row et-class-hero-row">
        <div className="et-class-hero-copy">
          <span className="hero-subject-pill" id="heroSubject">{cls.subject}</span>
          <h1 className="hero-class-title" id="heroTitle">{cls.name}</h1>
        </div>

        {/* Quick Stats Chips */}
        <div className="hero-stats-group et-class-hero-summary">
          <div className="hero-stat-chip et-class-hero-summary-item">
            <i className="bi bi-journal-text et-class-hero-summary-icon" aria-hidden="true" />
            <div className="hero-stat-number" id="statMaterials">{materialsCount}</div>
            <div className="hero-stat-label">Materials</div>
          </div>
          <div className="hero-stat-chip et-class-hero-summary-item">
            <i className="bi bi-clipboard-check et-class-hero-summary-icon" aria-hidden="true" />
            <div className="hero-stat-number" id="statAssignments">{assignmentsCount}</div>
            <div className="hero-stat-label">Assignments</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassHeroBanner;
