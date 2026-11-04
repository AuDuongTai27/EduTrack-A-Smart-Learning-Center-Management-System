import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import type {
  ClassDetailItem,
  MaterialItem,
  AssignmentItem,
} from '../../components/student/classDetail/classDetailData';
import { learningDAL, DEFAULT_STUDENT_ID } from '../../../DAL/learningDAL';
import { LearnerPageLoader } from '../../components/student/common/LearnerPageLoader';
import { ClassHeroBanner } from '../../components/student/classDetail/ClassHeroBanner';
import { ClassInfoCard } from '../../components/student/classDetail/ClassInfoCard';
import { ClassMaterialsSection } from '../../components/student/classDetail/ClassMaterialsSection';
import { ClassAssignmentsSection } from '../../components/student/classDetail/ClassAssignmentsSection';

export function StudentClassDetailPage() {
  const { id: paramId } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const rawId = paramId || searchParams.get('id') || '1';
  const classId = parseInt(rawId, 10) || 1;

  const [cls, setCls] = useState<ClassDetailItem | null>(null);
  const [materials, setMaterials] = useState<MaterialItem[]>([]);
  const [assignments, setAssignments] = useState<AssignmentItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    async function loadClassDetail() {
      setLoading(true);
      try {
        const detailData = await learningDAL.getStudentClassDetail(
          classId,
          DEFAULT_STUDENT_ID
        );
        if (isMounted && detailData) {
          setCls(detailData.cls);
          setMaterials(detailData.materials);
          setAssignments(detailData.assignments);
        }
      } catch (err) {
        console.warn('Lỗi khi tải chi tiết lớp học:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadClassDetail();

    return () => {
      isMounted = false;
    };
  }, [classId]);

  useEffect(() => {
    if (cls?.name) {
      document.title = `${cls.name} – EduTrack`;
    }
  }, [cls?.name]);

  const handleDownload = (fileName: string) => {
    setToastMessage(`Đang tải xuống tài liệu: ${fileName}`);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  if (loading || !cls) {
    return (
      <LearnerPageLoader
        title="Đang tải chi tiết lớp học..."
        message="Hệ thống đang tải thông tin lớp học, tài liệu bài giảng và danh sách bài tập."
      />
    );
  }

  return (
    <main className="main-content">
      <div className={`content-container class-detail-container ${cls.subjectClass}`}>
        {/* Toast Notification */}
        {toastMessage && (
          <div
            className="position-fixed top-0 start-50 translate-middle-x p-3"
            style={{ zIndex: 1090, marginTop: '16px' }}
          >
            <div className="toast show align-items-center text-bg-primary border-0 shadow" role="alert">
              <div className="d-flex">
                <div className="toast-body d-flex align-items-center gap-2">
                  <i className="bi bi-download fs-6"></i>
                  <span>{toastMessage}</span>
                </div>
                <button
                  type="button"
                  className="btn-close btn-close-white me-2 m-auto"
                  onClick={() => setToastMessage(null)}
                ></button>
              </div>
            </div>
          </div>
        )}

        {/* 1. Hero Banner */}
        <ClassHeroBanner
          cls={cls}
          materialsCount={materials.length}
          assignmentsCount={assignments.length}
        />

        {/* 2. Class Info Card */}
        <ClassInfoCard cls={cls} />

        {/* 3. Materials Section */}
        <ClassMaterialsSection
          materials={materials}
          onDownload={handleDownload}
        />

        {/* 4. Assignments Section */}
        <ClassAssignmentsSection assignments={assignments} />
      </div>
    </main>
  );
}

export default StudentClassDetailPage;
