import React from 'react';
import type { EnrolledClassItem } from './classesData';
import { ClassItem } from '../common/ClassItem';

interface ClassesGridSectionProps {
  classes?: EnrolledClassItem[];
  pastClasses?: EnrolledClassItem[];
  loading?: boolean;
}

export function ClassesGridSection({
  classes = [],
  pastClasses = [],
  loading = false,
}: ClassesGridSectionProps) {
  return (
    <>
      {/* 1. Active Classes Section */}
      <div className="section-header mb-3">
        <div className="section-title-wrap d-flex align-items-center gap-2">
          <i className="bi bi-mortarboard-fill text-primary fs-5" />
          <h2 className="section-title mb-0">Active Classes</h2>
          <span className="section-count-badge">
            {loading ? 'Loading...' : `${classes.length} ${classes.length === 1 ? 'class' : 'classes'}`}
          </span>
        </div>
      </div>

      {/* Active Classes Grid (4 cards / row on desktop) */}
      <div className="classes-grid mb-4">
        {loading && classes.length === 0 ? (
          <div className="p-4 text-center text-muted w-100">Loading active classes list...</div>
        ) : classes.length > 0 ? (
          classes.map((cls) => (
            <ClassItem key={cls.classId} classItem={cls} />
          ))
        ) : (
          <div className="p-4 text-center text-muted w-100 border rounded-3 bg-white">
            <i className="bi bi-inbox fs-2 text-secondary opacity-50 d-block mb-1" />
            <p className="mb-0">No active classes enrolled for this semester.</p>
          </div>
        )}
      </div>

      {/* 2. Past Classes Section (Lớp học cũ) */}
      <div className="section-header mb-3 mt-4">
        <div className="section-title-wrap d-flex align-items-center gap-2">
          <i className="bi bi-clock-history text-secondary fs-5" />
          <h2 className="section-title mb-0">Past Classes</h2>
          <span className="section-count-badge bg-secondary-subtle text-secondary border border-secondary-subtle">
            {pastClasses.length} completed
          </span>
        </div>
      </div>

      {/* Past Classes Grid (4 cards / row on desktop, hoặc hiển thị chưa có lớp) */}
      {pastClasses.length > 0 ? (
        <div className="classes-grid mb-4">
          {pastClasses.map((cls) => (
            <ClassItem key={cls.classId} classItem={cls} />
          ))}
        </div>
      ) : (
        <div className="p-4 text-center text-muted w-100 border rounded-3 bg-white mb-4">
          <i className="bi bi-archive fs-2 text-secondary opacity-50 d-block mb-1" />
          <p className="mb-0 fw-medium text-dark">No past classes</p>
          <small className="text-muted">You have no completed classes from previous semesters yet.</small>
        </div>
      )}
    </>
  );
};

export default ClassesGridSection;
