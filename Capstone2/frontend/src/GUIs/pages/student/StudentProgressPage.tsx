import React, { useState, useEffect } from 'react';
import { ProgressPageHeader } from '../../components/student/progress/ProgressPageHeader';
import { ProgressStatsGrid } from '../../components/student/progress/ProgressStatsGrid';
import { ProgressCurrentSection } from '../../components/student/progress/ProgressCurrentSection';
import { ProgressPastHistorySection } from '../../components/student/progress/ProgressPastHistorySection';
import { learningDAL, DEFAULT_STUDENT_ID } from '../../../DAL/learningDAL';
import {
  CURRENT_PROGRESS_CLASSES,
  type ProgressClassItem,
} from '../../components/student/progress/progressData';

export function StudentProgressPage() {
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
      try {
        const vm = await learningDAL.getStudentProgress(DEFAULT_STUDENT_ID);
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
        console.warn('Lỗi khi tải tiến độ học sinh:', err);
      }
    }

    loadProgress();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <main className="main-content">
      <div className="content-container">
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

export default StudentProgressPage;
