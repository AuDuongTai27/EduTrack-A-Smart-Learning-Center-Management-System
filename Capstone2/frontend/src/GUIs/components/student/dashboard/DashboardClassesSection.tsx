import React from 'react';
import { MOCK_ENROLLED_CLASSES } from '../classes/classesData';
import { ClassItem } from '../common/ClassItem';

export function DashboardClassesSection() {
  const classes = MOCK_ENROLLED_CLASSES;

  return (
    <>
      {/* Section Header: My Classes */}
      <div className="section-header">
        <h2 className="section-title">Lớp học của tôi</h2>
        <span className="section-count-badge">{classes.length} lớp</span>
      </div>

      {/* Classes Grid */}
      <div className="classes-grid">
        {classes.map((cls) => (
          <ClassItem key={cls.classId} classItem={cls} />
        ))}
      </div>
    </>
  );
};

export default DashboardClassesSection;
