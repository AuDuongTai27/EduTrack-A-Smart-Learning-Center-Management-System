import React from 'react';
import { MOCK_ENROLLED_CLASSES } from './classesData';
import { ClassItem } from '../common/ClassItem';

export function ClassesGridSection() {
  const classes = MOCK_ENROLLED_CLASSES;

  return (
    <>
      {/* Section Header */}
      <div className="section-header">
        <div className="section-title-wrap">
          <h2 className="section-title">Lớp học của tôi</h2>
          <span className="section-count-badge">{classes.length} lớp</span>
        </div>
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

export default ClassesGridSection;
