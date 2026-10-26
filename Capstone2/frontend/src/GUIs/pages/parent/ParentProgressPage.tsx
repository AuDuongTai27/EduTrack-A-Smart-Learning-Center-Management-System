import React, { useState, useEffect } from 'react';
import { useParent } from '../../../contexts/ParentContext';
import { ProgressPageHeader } from '../../components/student/progress/ProgressPageHeader';
import { ProgressStatsGrid } from '../../components/student/progress/ProgressStatsGrid';
import { ProgressCurrentSection } from '../../components/student/progress/ProgressCurrentSection';
import { ProgressPastHistorySection } from '../../components/student/progress/ProgressPastHistorySection';
import { progressDAL } from '../../../DAL/progressDAL';
import {
  CURRENT_PROGRESS_CLASSES,
  mapNotesAndAttendancesToClasses,
  type ProgressClassItem,
} from '../../components/student/progress/progressData';

export function ParentProgressPage() {
  const { selectedChild } = useParent();
  const [classes, setClasses] = useState<ProgressClassItem[]>(CURRENT_PROGRESS_CLASSES);

  useEffect(() => {
    let isMounted = true;

    async function loadProgress() {
      try {
        const [attRes, notesRes] = await Promise.all([
          progressDAL.getAllAttendances(),
          progressDAL.getAllProgressNotes(),
        ]);

        if (isMounted) {
          if ((attRes.data && attRes.data.length > 0) || (notesRes.data && notesRes.data.length > 0)) {
            setClasses(mapNotesAndAttendancesToClasses(notesRes.data, attRes.data));
          }
        }
      } catch (err) {
        console.warn('Lỗi khi tải tiến độ con cho phụ huynh:', err);
      }
    }

    loadProgress();

    return () => {
      isMounted = false;
    };
  }, []);

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
        <ProgressPageHeader />

        {/* 2. 4-Stats Cards Grid */}
        <ProgressStatsGrid />

        {/* 3. Current Classes Section */}
        <ProgressCurrentSection classes={classes} />

        {/* 4. Past Progress History Section */}
        <ProgressPastHistorySection />
      </div>
    </main>
  );
};

export default ParentProgressPage;
