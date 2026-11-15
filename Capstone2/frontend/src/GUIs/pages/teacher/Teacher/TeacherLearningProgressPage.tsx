import React, { useEffect, useState } from "react";
import PageHeader from "../../../components/Common/PageHeader";
import {
  LearningProgressHeader,
  ProgressTable,
  ProgressPagination,
} from "../../../components/teacher/Teacher/learningProgress";
import teachingDAL from "../../../../DAL/teachingDAL";
import type { TeachingClassItemDto } from "../../../../BLL/models/teaching/TeachingClassItemDto";
import type { TeachingClassProgressDto } from "../../../../BLL/models/teaching/TeachingLearningProgressDto";

const DEFAULT_TEACHER_ID = 3; // ThS. Hoàng Quốc Việt

export default function TeacherLearningProgressPage() {
  const [classes, setClasses] = useState<TeachingClassItemDto[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<number>(1);
  const [classProgress, setClassProgress] = useState<TeachingClassProgressDto | null>(null);
  const [loadingClasses, setLoadingClasses] = useState<boolean>(true);
  const [loadingProgress, setLoadingProgress] = useState<boolean>(false);

  // 1. Tải danh sách lớp phụ trách của Giáo viên
  useEffect(() => {
    let isMounted = true;
    async function loadTeacherClasses() {
      try {
        setLoadingClasses(true);
        const res = await teachingDAL.getMyClasses(DEFAULT_TEACHER_ID);
        if (isMounted && res.data && res.data.length > 0) {
          setClasses(res.data);
          setSelectedClassId(res.data[0].classId);
        }
      } catch (err) {
        console.warn("Lỗi tải danh sách lớp học của giáo viên:", err);
      } finally {
        if (isMounted) setLoadingClasses(false);
      }
    }
    loadTeacherClasses();
    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Tải chi tiết tiến độ học tập khi selectedClassId thay đổi
  useEffect(() => {
    if (!selectedClassId) return;
    let isMounted = true;
    async function loadProgress() {
      try {
        setLoadingProgress(true);
        const res = await teachingDAL.getClassLearningProgress(selectedClassId, DEFAULT_TEACHER_ID);
        if (isMounted && res.data) {
          setClassProgress(res.data);
        }
      } catch (err) {
        console.warn("Lỗi tải tiến độ học tập của lớp:", err);
      } finally {
        if (isMounted) setLoadingProgress(false);
      }
    }
    loadProgress();
    return () => {
      isMounted = false;
    };
  }, [selectedClassId]);

  return (
    <>
      {/* Breadcrumb & Page Title */}
      <PageHeader
        title="Learning Progress & Attendance"
        breadcrumbItems={[
          { label: "Dashboard", path: "/teacher/dashboard" },
          { label: "Learning Progress" },
        ]}
      />

      {/* Learning Progress Card */}
      <div className="card class-list-card border-0 mb-4 shadow-sm">
        {/* Card Header & Class Selector */}
        <LearningProgressHeader
          classes={classes}
          selectedClassId={selectedClassId}
          onSelectClass={(id) => setSelectedClassId(id)}
          classNameTitle={classProgress?.className}
          totalStudents={classProgress?.totalStudents}
        />

        {/* Thẻ thống kê tổng quan của lớp học được chọn: Sĩ số, Tiến độ và Bài tập */}
        {classProgress && (
          <div className="p-3 border-bottom bg-light-subtle">
            <div className="row g-3">
              <div className="col-md-3">
                <div className="card border-0 shadow-sm p-3 h-100 bg-white">
                  <div className="d-flex align-items-center gap-3">
                    <div className="bg-primary-subtle text-primary p-3 rounded-3">
                      <i className="bi bi-people-fill fs-4" />
                    </div>
                    <div>
                      <small className="text-muted d-block">Class Size</small>
                      <h4 className="mb-0 fw-bold">{classProgress.totalStudents} students</h4>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card border-0 shadow-sm p-3 h-100 bg-white">
                  <div className="d-flex align-items-center gap-3">
                    <div className="bg-success-subtle text-success p-3 rounded-3">
                      <i className="bi bi-calendar-check-fill fs-4" />
                    </div>
                    <div>
                      <small className="text-muted d-block">Session Progress</small>
                      <h4 className="mb-0 fw-bold">{classProgress.completedSessions}/{classProgress.totalSessions} sessions</h4>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="card border-0 shadow-sm p-3 h-100 bg-white">
                  <div className="d-flex align-items-center gap-3">
                    <div className="bg-info-subtle text-info p-3 rounded-3">
                      <i className="bi bi-journal-text fs-4" />
                    </div>
                    <div>
                      <small className="text-muted d-block">Latest Assignment</small>
                      <h6 className="mb-0 fw-bold text-truncate" style={{ maxWidth: 380 }}>
                        {classProgress.latestAssignmentTitle}
                      </h6>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {loadingClasses || loadingProgress ? (
          <div className="p-5 text-center">
            <div className="spinner-border text-primary mx-auto mb-2" role="status" />
            <p className="text-muted mb-0">Loading student learning progress and attendance...</p>
          </div>
        ) : (
          <>
            {/* Toolbar & Table (bao gồm Pagination nội bộ) */}
            <ProgressTable
              progressStudents={classProgress?.students ?? []}
              latestAssignmentTitle={classProgress?.latestAssignmentTitle}
              classId={selectedClassId}
              className={classProgress?.className}
            />
          </>
        )}
      </div>
    </>
  );
}
