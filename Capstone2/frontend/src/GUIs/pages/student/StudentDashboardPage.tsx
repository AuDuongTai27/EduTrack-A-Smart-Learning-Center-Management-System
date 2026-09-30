import React from 'react';
import { DashboardWelcomeBanner } from '../../components/student/dashboard/DashboardWelcomeBanner';
import { DashboardStatsGrid } from '../../components/student/dashboard/DashboardStatsGrid';
import { DashboardClassesSection } from '../../components/student/dashboard/DashboardClassesSection';

export const StudentDashboardPage: React.FC = () => {
  return (
    <main className="main-content">
      <div className="content-container">
        {/* 1. Page Header */}
        <div className="page-header">
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Tổng quan học tập của bạn</p>
        </div>

        {/* 2. Welcome Banner */}
        <DashboardWelcomeBanner />

        {/* 3. Stats Row */}
        <DashboardStatsGrid />

        {/* 4 & 5. Section Header & Classes Grid */}
        <DashboardClassesSection />
      </div>
    </main>
  );
};

export default StudentDashboardPage;
