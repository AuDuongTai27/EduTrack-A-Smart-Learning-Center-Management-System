import React, { useState, useEffect } from 'react';
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

export function StudentProgressPage() {
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

export default StudentProgressPage;
