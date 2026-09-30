import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import {
  CLASSES_DATA,
  MATERIALS_DATA,
  ASSIGNMENTS_DATA,
} from '../../components/student/classDetail/classDetailData';
import { ClassHeroBanner } from '../../components/student/classDetail/ClassHeroBanner';
import { ClassInfoCard } from '../../components/student/classDetail/ClassInfoCard';
import { ClassMaterialsSection } from '../../components/student/classDetail/ClassMaterialsSection';
import { ClassAssignmentsSection } from '../../components/student/classDetail/ClassAssignmentsSection';

export const StudentClassDetailPage: React.FC = () => {
  const { id: paramId } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const rawId = paramId || searchParams.get('id') || '1';
  const classId = parseInt(rawId, 10) || 1;

  const cls = CLASSES_DATA.find((c) => c.id === classId) || CLASSES_DATA[0];
  const materials = MATERIALS_DATA.filter((m) => m.classId === cls.id);
  const assignments = ASSIGNMENTS_DATA.filter((a) => a.classId === cls.id);

  useEffect(() => {
    document.title = `${cls.name} – EduTrack`;
  }, [cls.name]);

  const handleDownload = (fileName: string) => {
    setToastMessage(`Đang tải xuống tài liệu: ${fileName}`);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  return (
    <>
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
    </>
  );
};

export default StudentClassDetailPage;
