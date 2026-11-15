import React, { useState, useEffect } from 'react';
import { StudentPageHeader } from '../../components/student/common/StudentPageHeader';
import { LearnerPageLoader } from '../../components/student/common/LearnerPageLoader';
import { DashboardWelcomeBanner } from '../../components/student/dashboard/DashboardWelcomeBanner';
import { DashboardStatsGrid } from '../../components/student/dashboard/DashboardStatsGrid';
import { DashboardClassesSection } from '../../components/student/dashboard/DashboardClassesSection';
import { learningDAL, DEFAULT_STUDENT_ID } from '../../../DAL/learningDAL';
import type { EnrolledClassItem } from '../../components/student/classes/classesData';

export function StudentDashboardPage() {
  const [studentName, setStudentName] = useState<string>('');
  const [avatarInitials, setAvatarInitials] = useState<string>('HS');
  const [enrolledClassesCount, setEnrolledClassesCount] = useState<number>(0);
  const [pendingAssignmentsCount, setPendingAssignmentsCount] = useState<number>(0);
  const [classes, setClasses] = useState<EnrolledClassItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      try {
        setLoading(true);
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

  if (loading) {
    return (
      <LearnerPageLoader
        title="Loading learning overview..."
        message="The system is synchronizing your classes and assignments."
      />
    );
  }

  return (
    <main className="main-content">
      <div className="content-container">
        {/* 1. Page Header */}
        <StudentPageHeader
          title="Dashboard"
          subtitle="Your learning overview"
          breadcrumbs={[
            { label: 'Student Portal' },
            { label: 'Dashboard' },
          ]}
        />

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
