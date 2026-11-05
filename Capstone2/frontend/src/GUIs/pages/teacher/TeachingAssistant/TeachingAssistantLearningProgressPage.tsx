import React, { useEffect, useState } from "react";
import PageHeader from "../../../components/Common/PageHeader";
import {
  LearningProgressHeader,
  ProgressTable,
  ProgressPagination,
} from "../../../components/teacher/TeachingAssistant/learningProgress";
import teachingDAL from "../../../../DAL/teachingDAL";
import type { TeachingClassItemDto } from "../../../../BLL/models/teaching/TeachingClassItemDto";
import type { TeachingClassProgressDto } from "../../../../BLL/models/teaching/TeachingLearningProgressDto";

const DEFAULT_TA_ID = 5; // Trợ giảng Âu Dương Tài

export default function TeachingAssistantLearningProgressPage() {
  const [classes, setClasses] = useState<TeachingClassItemDto[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<number>(1);
  const [classProgress, setClassProgress] = useState<TeachingClassProgressDto | null>(null);
  const [loadingClasses, setLoadingClasses] = useState<boolean>(true);
  const [loadingProgress, setLoadingProgress] = useState<boolean>(false);

  // 1. Tải danh sách lớp trợ giảng phụ trách
  useEffect(() => {
    let isMounted = true;
    async function loadTaClasses() {
      try {
        setLoadingClasses(true);
        const res = await teachingDAL.getMyClasses(DEFAULT_TA_ID);
        if (isMounted && res.data && res.data.length > 0) {
          setClasses(res.data);
          setSelectedClassId(res.data[0].classId);
        }
      } catch (err) {
        console.warn("Lỗi tải danh sách lớp của trợ giảng:", err);
      } finally {
        if (isMounted) setLoadingClasses(false);
      }
    }
    loadTaClasses();
    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Tải tiến độ học tập khi đổi lớp
  useEffect(() => {
    if (!selectedClassId) return;
    let isMounted = true;
    async function loadProgress() {
      try {
        setLoadingProgress(true);
        const res = await teachingDAL.getClassLearningProgress(selectedClassId, DEFAULT_TA_ID);
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
        title="Tiến Độ Học Tập & Điểm Danh Học Viên"
        breadcrumbItems={[
          { label: "Dashboard", path: "/teaching-assistant/dashboard" },
          { label: "Tiến độ học tập" },
        ]}
      />

      {/* Thẻ thống kê tổng quan của lớp */}
      {classProgress && (
        <div className="row g-3 mb-4">
          <div className="col-md-3">
            <div className="card border-0 shadow-sm p-3">
              <div className="d-flex align-items-center gap-3">
                <div className="bg-primary-subtle text-primary p-3 rounded-3">
                  <i className="bi bi-people-fill fs-4" />
                </div>
                <div>
                  <small className="text-muted d-block">Sĩ số lớp</small>
                  <h4 className="mb-0 fw-bold">{classProgress.totalStudents} học sinh</h4>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm p-3">
              <div className="d-flex align-items-center gap-3">
                <div className="bg-success-subtle text-success p-3 rounded-3">
                  <i className="bi bi-check2-circle fs-4" />
                </div>
                <div>
                  <small className="text-muted d-block">Tiến độ buổi học</small>
                  <h4 className="mb-0 fw-bold">{classProgress.completedSessions}/{classProgress.totalSessions} buổi</h4>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="card border-0 shadow-sm p-3">
              <div className="d-flex align-items-center gap-3">
                <div className="bg-info-subtle text-info p-3 rounded-3">
                  <i className="bi bi-file-earmark-text-fill fs-4" />
                </div>
                <div>
                  <small className="text-muted d-block">Bài tập đang giao</small>
                  <h6 className="mb-0 fw-bold text-truncate" style={{ maxWidth: 380 }}>
                    {classProgress.latestAssignmentTitle}
                  </h6>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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

        {loadingClasses || loadingProgress ? (
          <div className="p-5 text-center">
            <div className="spinner-border text-primary mx-auto mb-2" role="status" />
            <p className="text-muted mb-0">Đang tải tiến độ học tập và tình hình làm bài của học sinh...</p>
          </div>
        ) : (
          <>
            {/* Toolbar & Table */}
            <ProgressTable
              progressStudents={classProgress?.students ?? []}
              latestAssignmentTitle={classProgress?.latestAssignmentTitle}
              classId={selectedClassId}
              className={classProgress?.className}
            />

            {/* Footer Pagination */}
            <ProgressPagination />
          </>
        )}
      </div>
    </>
  );
}
