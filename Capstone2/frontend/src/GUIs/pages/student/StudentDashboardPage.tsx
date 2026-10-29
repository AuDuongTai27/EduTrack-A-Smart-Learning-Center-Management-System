import React, { useState, useEffect } from 'react';
import { DashboardWelcomeBanner } from '../../components/student/dashboard/DashboardWelcomeBanner';
import { DashboardStatsGrid } from '../../components/student/dashboard/DashboardStatsGrid';
import { DashboardClassesSection } from '../../components/student/dashboard/DashboardClassesSection';
import { learningDAL, DEFAULT_STUDENT_ID } from '../../../DAL/learningDAL';
import {
  MOCK_ENROLLED_CLASSES,
  type EnrolledClassItem,
} from '../../components/student/classes/classesData';

export function StudentDashboardPage() {
  const [studentName, setStudentName] = useState<string>('Lê Văn An');
  const [avatarInitials, setAvatarInitials] = useState<string>('VA');
  const [enrolledClassesCount, setEnrolledClassesCount] = useState<number>(
    MOCK_ENROLLED_CLASSES.length
  );
  const [pendingAssignmentsCount, setPendingAssignmentsCount] = useState<number>(2);
  const [classes, setClasses] = useState<EnrolledClassItem[]>(MOCK_ENROLLED_CLASSES);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      try {
        setLoading(true);

        // Gọi tầng learningDAL (Bounded Context: Learning -> GET /api/learning/student/{id}/dashboard)
        const dashboardData = await learningDAL.getStudentDashboard(DEFAULT_STUDENT_ID);

        if (isMounted && dashboardData) {
          setStudentName(dashboardData.fullName);
          setAvatarInitials(dashboardData.avatarInitials);
          setEnrolledClassesCount(dashboardData.enrolledClassesCount);
          setPendingAssignmentsCount(dashboardData.pendingAssignmentsCount);
          setClasses(dashboardData.classes);
        }
      } catch (err) {
        console.warn('Lỗi khi tải dữ liệu Dashboard học sinh:', err);
        if (isMounted) {
          setClasses(MOCK_ENROLLED_CLASSES);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <main className="main-content">
      <div className="content-container">
        {/* 1. Page Header */}
        <div className="page-header">
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Tổng quan học tập của bạn</p>
        </div>

        {/* 2. Welcome Banner */}
        <DashboardWelcomeBanner
          studentName={studentName}
          avatarInitials={avatarInitials}
        />

        {/* 3. Stats Row */}
        <DashboardStatsGrid
          enrolledClassesCount={enrolledClassesCount}
          pendingAssignmentsCount={pendingAssignmentsCount}
        />

        {/* 4 & 5. Section Header & Classes Grid */}
        <DashboardClassesSection
          classes={classes}
          loading={loading}
        />
      </div>
    </main>
  );
}

export default StudentDashboardPage;
