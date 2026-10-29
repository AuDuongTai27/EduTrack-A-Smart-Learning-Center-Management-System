import React from 'react';
import { Link } from 'react-router-dom';

export interface StudentBreadcrumbItem {
  label: string;
  href?: string;
}

export interface StudentPageHeaderProps {
  title: string;
  subtitle?: React.ReactNode;
  breadcrumbs?: StudentBreadcrumbItem[];
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export function StudentPageHeader({
  title,
  subtitle,
  breadcrumbs,
  badge,
  actions,
  className = '',
}: StudentPageHeaderProps) {
  return (
    <div className={`student-page-header-unified d-flex align-items-center justify-content-between flex-wrap gap-3 mb-4 ${className}`}>
      <div className="student-page-header-main flex-grow-1">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav aria-label="breadcrumb" className="student-header-breadcrumbs mb-1.5">
            <ol className="list-unstyled d-flex align-items-center gap-1.5 mb-0" style={{ fontSize: '12px' }}>
              {breadcrumbs.map((bc, idx) => {
                const isLast = idx === breadcrumbs.length - 1;
                return (
                  <React.Fragment key={idx}>
                    {idx > 0 && (
                      <li className="d-flex align-items-center text-secondary opacity-50 px-0.5">
                        <i className="bi bi-chevron-right" style={{ fontSize: '9px' }}></i>
                      </li>
                    )}
                    <li className={`d-flex align-items-center ${isLast ? 'fw-semibold text-dark' : ''}`}>
                      {bc.href && !isLast ? (
                        <Link
                          to={bc.href}
                          className="text-decoration-none text-muted hover-primary-link"
                          style={{ color: '#64748b', transition: 'color 0.15s ease' }}
                        >
                          {bc.label}
                        </Link>
                      ) : (
                        <span style={{ color: isLast ? '#0f172a' : '#64748b' }}>{bc.label}</span>
                      )}
                    </li>
                  </React.Fragment>
                );
              })}
            </ol>
          </nav>
        )}

        <div className="d-flex align-items-center gap-2.5 flex-wrap">
          <h1
            className="student-unified-page-title mb-0 fw-bold text-dark"
            style={{ fontSize: '24px', letterSpacing: '-0.02em', lineHeight: 1.25 }}
          >
            {title}
          </h1>
          {badge && <div className="student-header-badge d-flex align-items-center">{badge}</div>}
        </div>

        {subtitle && (
          <div
            className="student-unified-page-subtitle text-muted mt-1"
            style={{ fontSize: '13.5px', color: '#64748b', lineHeight: 1.4 }}
          >
            {subtitle}
          </div>
        )}
      </div>

      {actions && (
        <div className="student-page-header-actions d-flex align-items-center gap-2 flex-wrap flex-shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}

export default StudentPageHeader;

