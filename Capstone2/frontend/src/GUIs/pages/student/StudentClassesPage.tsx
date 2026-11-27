import { DataState, dataError } from '../../components/Common/DataState';
import React, { useState, useEffect, useMemo } from 'react';
import '../../../assets/css/student-academy.css';
import { StudentPageHeader } from '../../components/student/common/StudentPageHeader';
import { LearnerPageLoader } from '../../components/student/common/LearnerPageLoader';
import { ClassesGridSection } from '../../components/student/classes/ClassesGridSection';
import { learningDAL, DEFAULT_STUDENT_ID } from '../../../DAL/learningDAL';
import type { EnrolledClassItem } from '../../components/student/classes/classesData';

export function StudentClassesPage() {
  const [loadError, setLoadError] = useState<string | null>(null);
  const [retryVersion, setRetryVersion] = useState(0);

  const [classes, setClasses] = useState<EnrolledClassItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    async function loadClasses() {
      try {
        setLoading(true);
      setLoadError(null);
        const dashboardData = await learningDAL.getStudentDashboard(DEFAULT_STUDENT_ID);
        if (isMounted && dashboardData && dashboardData.classes) {
          setClasses(dashboardData.classes);
        }
      } catch (err) {
        if (isMounted) setLoadError(dataError(err));
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
  }, [retryVersion]);

  const activeClasses = useMemo(() => classes.filter((c) => !c.isCompleted), [classes]);
  const pastClasses = useMemo(() => classes.filter((c) => c.isCompleted), [classes]);

  if (loadError) return <DataState error message={loadError} onRetry={() => { setLoadError(null); setRetryVersion(v => v + 1); }} />;

  if (loading) {
    return (
      <LearnerPageLoader
        title="Loading classes list..."
        message="Please wait a moment, the system is loading the classes you are enrolled in."
      />
    );
  }

  return (
    <main className="main-content et-student-academy et-student-classes">
      <div className="content-container">
        {/* Page Header */}
        <StudentPageHeader
          title="My Classes"
          breadcrumbs={[
            { label: 'Home', href: '/student/dashboard' },
            { label: 'My Classes' },
          ]}
        />

        {/* Section Header & Classes Grid */}
        <ClassesGridSection
          classes={activeClasses}
          pastClasses={pastClasses}
          loading={loading}
        />
      </div>
    </main>
  );
}

export default StudentClassesPage;
