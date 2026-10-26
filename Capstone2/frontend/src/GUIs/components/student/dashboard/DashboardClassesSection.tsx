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
        <h2 className="section-title">Lớp học của tôi</h2>
        <span className="section-count-badge">{classes.length} lớp</span>
      </div>

      {/* Trạng thái Loading */}
      {loading && (
        <div className="text-center my-4 py-3 text-muted">
          <div className="spinner-border spinner-border-sm text-primary me-2" role="status" />
          <span>Đang tải danh sách lớp học...</span>
        </div>
      )}

      {/* Danh sách lớp học */}
      {!loading && classes.length === 0 ? (
        <div className="text-center py-4 text-muted bg-light rounded">
          <i className="bi bi-inbox fs-3 d-block mb-2" />
          Chưa có lớp học nào.
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
