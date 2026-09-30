import React from 'react';
import { ProgressPageHeader } from '../../components/student/progress/ProgressPageHeader';
import { ProgressStatsGrid } from '../../components/student/progress/ProgressStatsGrid';
import { ProgressCurrentSection } from '../../components/student/progress/ProgressCurrentSection';
import { ProgressPastHistorySection } from '../../components/student/progress/ProgressPastHistorySection';

export const StudentProgressPage: React.FC = () => {
  return (
    <main className="main-content">
      <div className="content-container">
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

export default StudentProgressPage;
