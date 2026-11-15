import React from 'react';
import { MOCK_ENROLLED_CLASSES, type EnrolledClassItem } from './classesData';
import { ClassItem } from '../common/ClassItem';

interface ClassesGridSectionProps {
  classes?: EnrolledClassItem[];
  loading?: boolean;
}

export function ClassesGridSection({
  classes = MOCK_ENROLLED_CLASSES,
  loading = false,
}: ClassesGridSectionProps) {
  return (
    <>
      {/* Section Header */}
      <div className="section-header">
        <div className="section-title-wrap">
          <h2 className="section-title">My Classes</h2>
          <span className="section-count-badge">
            {loading ? 'Loading...' : `${classes.length} ${classes.length === 1 ? 'class' : 'classes'}`}
          </span>
        </div>
      </div>

      {/* Classes Grid */}
      <div className="classes-grid">
        {loading && classes.length === 0 ? (
          <div className="p-4 text-center text-muted w-100">Loading classes list...</div>
        ) : (
          classes.map((cls) => (
            <ClassItem key={cls.classId} classItem={cls} />
          ))
        )}
      </div>
    </>
  );
};

export default ClassesGridSection;
