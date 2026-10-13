import React from 'react';
import { useParent } from '../../../contexts/ParentContext';
import { ProgressPageHeader } from '../../components/student/progress/ProgressPageHeader';
import { ProgressStatsGrid } from '../../components/student/progress/ProgressStatsGrid';
import { ProgressCurrentSection } from '../../components/student/progress/ProgressCurrentSection';
import { ProgressPastHistorySection } from '../../components/student/progress/ProgressPastHistorySection';

export const ParentProgressPage: React.FC = () => {
  const { selectedChild } = useParent();

  if (!selectedChild) {
    return null;
  }

  return (
    <main className="main-content">
      <div className="content-container">
        {/* Child Info Badge */}
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div className="d-flex align-items-center gap-2">
            <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-1.5 rounded-pill fw-semibold">
              <i className="bi bi-graph-up me-1"></i> Báo cáo tiến độ: {selectedChild.name}
            </span>
            <span className="small text-muted">{selectedChild.grade} · {selectedChild.school}</span>
          </div>
        </div>

        {/* 1. Page Header with Overall Attendance */}
        <ProgressPageHeader />

        {/* 2. 4-Stats Cards Grid */}
        <ProgressStatsGrid />

        {/* 3. Current Classes Section */}
        <ProgressCurrentSection />

        {/* 4. Past Progress History Section */}
        <ProgressPastHistorySection />
      </div>
    </main>
  );
};

export default ParentProgressPage;
