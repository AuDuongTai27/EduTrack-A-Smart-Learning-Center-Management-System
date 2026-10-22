import React, { useState, useEffect } from 'react';
import { DashboardWelcomeBanner } from '../../components/student/dashboard/DashboardWelcomeBanner';
import { DashboardStatsGrid } from '../../components/student/dashboard/DashboardStatsGrid';
import { DashboardClassesSection } from '../../components/student/dashboard/DashboardClassesSection';
import { classDAL } from '../../../DAL/classDAL';
import {
  MOCK_ENROLLED_CLASSES,
  mapClassDtoToEnrolledItem,
  type EnrolledClassItem,
} from '../../components/student/classes/classesData';

export function StudentDashboardPage() {
  const [classes, setClasses] = useState<EnrolledClassItem[]>(MOCK_ENROLLED_CLASSES);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    async function loadClasses() {
      try {
        setLoading(true);

        // Gọi tầng DAL (tự động điều phối giữa live API và mockData)
        const result = await classDAL.getAllClasses();

        if (isMounted && result.data && result.data.length > 0) {
          const mappedItems = result.data.map(mapClassDtoToEnrolledItem);
          setClasses(mappedItems);
        }
      } catch (err) {
        console.warn('Lỗi khi tải danh sách lớp học:', err);
        if (isMounted) {
          setClasses(MOCK_ENROLLED_CLASSES);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadClasses();

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
        <DashboardWelcomeBanner />

        {/* 3. Stats Row */}
        <DashboardStatsGrid />

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
