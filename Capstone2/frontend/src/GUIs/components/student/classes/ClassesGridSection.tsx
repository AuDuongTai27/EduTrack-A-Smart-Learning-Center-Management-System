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
          <h2 className="section-title">Lớp học của tôi</h2>
          <span className="section-count-badge">
            {loading ? 'Đang tải...' : `${classes.length} lớp`}
          </span>
        </div>
      </div>

      {/* Classes Grid */}
      <div className="classes-grid">
        {loading && classes.length === 0 ? (
          <div className="p-4 text-center text-muted w-100">Đang tải danh sách lớp học...</div>
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
