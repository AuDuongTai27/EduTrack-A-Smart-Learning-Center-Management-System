import React, { useState, useEffect } from 'react';
import { StudentPageHeader } from '../../components/student/common/StudentPageHeader';
import { LearnerPageLoader } from '../../components/student/common/LearnerPageLoader';
import { ClassesGridSection } from '../../components/student/classes/ClassesGridSection';
import { learningDAL, DEFAULT_STUDENT_ID } from '../../../DAL/learningDAL';
import type { EnrolledClassItem } from '../../components/student/classes/classesData';

export function StudentClassesPage() {
  const [classes, setClasses] = useState<EnrolledClassItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    async function loadClasses() {
      try {
        setLoading(true);
        const dashboardData = await learningDAL.getStudentDashboard(DEFAULT_STUDENT_ID);
        if (isMounted && dashboardData && dashboardData.classes) {
          setClasses(dashboardData.classes);
        }
      } catch (err) {
        console.warn('Lỗi khi tải danh sách lớp học của học sinh:', err);
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

  if (loading) {
    return (
      <LearnerPageLoader
        title="Đang tải danh sách lớp học..."
        message="Vui lòng đợi trong giây lát, hệ thống đang tải các lớp học bạn đang tham gia."
      />
    );
  }

  return (
    <main className="main-content">
      <div className="content-container">
        {/* Page Header */}
        <StudentPageHeader
          title="Lớp học của tôi"
          subtitle="Tất cả lớp học bạn đang tham gia trong kỳ học này"
          breadcrumbs={[
            { label: 'Trang chủ', href: '/student/dashboard' },
            { label: 'Lớp học của tôi' },
          ]}
        />

        {/* Section Header & Classes Grid */}
        <ClassesGridSection classes={classes} loading={loading} />
      </div>
    </main>
  );
}

export default StudentClassesPage;
