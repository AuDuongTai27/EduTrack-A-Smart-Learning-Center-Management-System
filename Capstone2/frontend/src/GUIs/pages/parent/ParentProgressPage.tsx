import React, { useState, useEffect } from 'react';
import { useParent } from '../../../contexts/ParentContext';
import { ProgressPageHeader } from '../../components/student/progress/ProgressPageHeader';
import { ProgressStatsGrid } from '../../components/student/progress/ProgressStatsGrid';
import { ProgressCurrentSection } from '../../components/student/progress/ProgressCurrentSection';
import { ProgressPastHistorySection } from '../../components/student/progress/ProgressPastHistorySection';
import { learningDAL, DEFAULT_STUDENT_ID } from '../../../DAL/learningDAL';
import {
  CURRENT_PROGRESS_CLASSES,
  type ProgressClassItem,
} from '../../components/student/progress/progressData';

export function ParentProgressPage() {
  const { selectedChild } = useParent();
  const [classes, setClasses] = useState<ProgressClassItem[]>(CURRENT_PROGRESS_CLASSES);
  const [overallAttendanceRate, setOverallAttendanceRate] = useState<number>(80);
  const [attendedSessionsCount, setAttendedSessionsCount] = useState<number>(35);
  const [presentCount, setPresentCount] = useState<number>(35);
  const [absentCount, setAbsentCount] = useState<number>(4);
  const [lateCount, setLateCount] = useState<number>(5);
  const [totalSessionsCount, setTotalSessionsCount] = useState<number>(44);
  const [enrolledClassesCount, setEnrolledClassesCount] = useState<number>(
    CURRENT_PROGRESS_CLASSES.length
  );

  useEffect(() => {
    let isMounted = true;

    async function loadProgress() {
      const studentId = selectedChild?.id || DEFAULT_STUDENT_ID;
      try {
        const vm = await learningDAL.getStudentProgress(studentId);
        if (isMounted && vm) {
          setOverallAttendanceRate(vm.overallAttendanceRate);
          setAttendedSessionsCount(vm.attendedSessionsCount);
          setPresentCount(vm.presentCount);
          setAbsentCount(vm.absentCount);
          setLateCount(vm.lateCount);
          setTotalSessionsCount(vm.totalSessionsCount);
          setEnrolledClassesCount(vm.enrolledClassesCount);
          setClasses(vm.currentClasses);
        }
      } catch (err) {
        console.warn('Lỗi khi tải tiến độ con cho phụ huynh:', err);
      }
    }

    loadProgress();

    return () => {
      isMounted = false;
    };
  }, [selectedChild?.id]);

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
        <ProgressPageHeader
          overallAttendanceRate={overallAttendanceRate}
          attendedSessionsCount={attendedSessionsCount}
          totalSessionsCount={totalSessionsCount}
        />

        {/* 2. 4-Stats Cards Grid */}
        <ProgressStatsGrid
          presentCount={presentCount}
          absentCount={absentCount}
          lateCount={lateCount}
          totalSessionsCount={totalSessionsCount}
          enrolledClassesCount={enrolledClassesCount}
        />

        {/* 3. Current Classes Section */}
        <ProgressCurrentSection classes={classes} />

        {/* 4. Past Progress History Section */}
        <ProgressPastHistorySection />
      </div>
    </main>
  );
}

export default ParentProgressPage;
