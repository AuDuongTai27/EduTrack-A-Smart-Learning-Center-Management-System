import React from 'react';
import type { EnrolledClassItem } from '../classes/classesData';
import { MOCK_ENROLLED_CLASSES } from '../classes/classesData';
import { ClassItem } from '../common/ClassItem';

export interface DashboardClassesSectionProps {
  classes?: EnrolledClassItem[];
  loading?: boolean;
}

export function DashboardClassesSection({
  classes = MOCK_ENROLLED_CLASSES,
  loading = false,
}: DashboardClassesSectionProps) {
  return (
    <>
      {/* Section Header: My Classes */}
      <div className="section-header">
        <h2 className="section-title">My Classes</h2>
        <span className="section-count-badge">
          {classes.length} {classes.length === 1 ? 'class' : 'classes'}
        </span>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="text-center my-4 py-3 text-muted">
          <div className="spinner-border spinner-border-sm text-primary me-2" role="status" />
          <span>Loading classes list...</span>
        </div>
      )}

      {/* Classes list */}
      {!loading && classes.length === 0 ? (
        <div className="text-center py-4 text-muted bg-light rounded">
          <i className="bi bi-inbox fs-3 d-block mb-2" />
          No classes available.
        </div>
      ) : (
        <div className="classes-grid">
          {classes.map((cls) => (
            <ClassItem key={cls.classId} classItem={cls} />
          ))}
        </div>
      )}
    </>
  );
}

export default DashboardClassesSection;
