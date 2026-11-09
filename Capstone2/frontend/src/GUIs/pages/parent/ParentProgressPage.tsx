import React, { useState, useEffect } from 'react';
import { useParent } from '../../../contexts/ParentContext';
import { LearnerPageLoader } from '../../components/student/common/LearnerPageLoader';
import { ProgressPageHeader } from '../../components/student/progress/ProgressPageHeader';
import { ProgressStatsGrid } from '../../components/student/progress/ProgressStatsGrid';
import { ProgressCurrentSection } from '../../components/student/progress/ProgressCurrentSection';
import { ProgressPastHistorySection } from '../../components/student/progress/ProgressPastHistorySection';
import { learningDAL, DEFAULT_STUDENT_ID } from '../../../DAL/learningDAL';
import type { ProgressClassItem } from '../../components/student/progress/progressData';

export function ParentProgressPage() {
  const { selectedChild, loading: parentLoading } = useParent();
  const [currentClasses, setCurrentClasses] = useState<ProgressClassItem[]>([]);
  const [pastClasses, setPastClasses] = useState<ProgressClassItem[]>([]);
  const [overallAttendanceRate, setOverallAttendanceRate] = useState<number>(100);
  const [attendedSessionsCount, setAttendedSessionsCount] = useState<number>(0);
  const [presentCount, setPresentCount] = useState<number>(0);
  const [absentCount, setAbsentCount] = useState<number>(0);
  const [lateCount, setLateCount] = useState<number>(0);
  const [totalSessionsCount, setTotalSessionsCount] = useState<number>(0);
  const [enrolledClassesCount, setEnrolledClassesCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    async function loadProgress() {
      const studentId = selectedChild?.id || DEFAULT_STUDENT_ID;
      setLoading(true);
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
          setCurrentClasses(vm.currentClasses);
          setPastClasses(vm.pastClasses || []);
        }
      } catch (err) {
        console.warn('Lỗi khi tải tiến độ con cho phụ huynh:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadProgress();

    return () => {
      isMounted = false;
    };
  }, [selectedChild?.id]);

  if (parentLoading || loading || !selectedChild) {
    return (
      <LearnerPageLoader
        title="Đang tải báo cáo tiến độ..."
        message="Hệ thống đang tổng hợp dữ liệu điểm danh và nhận xét từ giáo viên về con."
      />
    );
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
        <ProgressCurrentSection classes={currentClasses} />

        {/* 4. Past Progress History Section */}
        <ProgressPastHistorySection classes={pastClasses} />
      </div>
    </main>
  );
}

export default ParentProgressPage;
