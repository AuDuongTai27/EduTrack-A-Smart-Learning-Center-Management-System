import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import PageHeader from "../../../components/Common/PageHeader";
import {
  StudentProgressHeroCard,
  StudentAssignmentsSection,
  StudentEvaluationSection,
  CreateEvaluationModal,
} from "../../../components/teacher/Teacher/learningProgress";
import teachingDAL, { DEFAULT_TEACHER_ID } from "../../../../DAL/teachingDAL";
import type {
  TeachingStudentProgressDetailDto,
  CreateTeachingEvaluationPayload,
} from "../../../../BLL/models/teaching";

export default function TeacherStudentProgressDetailPage() {
  const { classId: paramClassId, studentId: paramStudentId } = useParams<{
    classId?: string;
    studentId?: string;
  }>();

  const classId = Number(paramClassId || "1");
  const studentId = Number(paramStudentId || "6");

  const [detail, setDetail] = useState<TeachingStudentProgressDetailDto | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        setLoading(true);
        const res = await teachingDAL.getStudentProgressDetail(classId, studentId);
        if (isMounted && res.data) {
          setDetail(res.data);
        }
      } catch (err) {
        console.warn("Lỗi tải chi tiết tiến độ học sinh:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [classId, studentId]);

  const handleCreateEvaluation = async (payload: CreateTeachingEvaluationPayload) => {
    try {
      const res = await teachingDAL.createStudentEvaluation(classId, studentId, {
        ...payload,
        evaluatorName: "ThS. Hoàng Quốc Việt",
        evaluatorRole: "Giáo viên",
      });

      if (res.data && detail) {
        setDetail({
          ...detail,
          evaluations: [res.data, ...detail.evaluations],
        });
      }

      setToastMessage("Đã lưu đánh giá cá nhân thành công vào hệ thống!");
    } catch (err) {
      console.warn("Lỗi khi lưu đánh giá:", err);
      setToastMessage("Đã ghi nhận đánh giá cá nhân.");
    }
    setTimeout(() => setToastMessage(null), 3500);
  };

  if (loading) {
    return (
      <div className="p-5 text-center">
        <div className="spinner-border text-primary mx-auto mb-2" role="status" />
        <p className="text-muted mb-0">Đang tải toàn bộ dữ liệu bài tập và đánh giá của học sinh...</p>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="p-5 text-center">
        <i className="bi bi-exclamation-triangle fs-1 text-warning d-block mb-2" />
        <h5>Không tìm thấy thông tin học sinh</h5>
        <Link to="/teacher/learning-progress" className="btn btn-outline-primary btn-sm mt-2">
          Quay lại danh sách
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className="position-fixed top-0 start-50 translate-middle-x p-3"
          style={{ zIndex: 1090, marginTop: "16px" }}
        >
          <div className="toast show align-items-center text-bg-success border-0 shadow" role="alert">
            <div className="d-flex">
              <div className="toast-body d-flex align-items-center gap-2">
                <i className="bi bi-check-circle-fill fs-6" />
                <span>{toastMessage}</span>
              </div>
              <button
                type="button"
                className="btn-close btn-close-white me-2 m-auto"
                onClick={() => setToastMessage(null)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Page Header */}
      <PageHeader
        title={`Chi Tiết Tiến Độ - ${detail.fullName}`}
        breadcrumbItems={[
          { label: "Dashboard", path: "/teacher/dashboard" },
          { label: "Tiến độ học tập", path: "/teacher/learning-progress" },
          { label: detail.className },
          { label: detail.fullName },
        ]}
        action={
          <div className="d-flex align-items-center gap-2">
            <Link
              to="/teacher/learning-progress"
              className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-1"
            >
              <i className="bi bi-arrow-left" /> Quay lại danh sách
            </Link>
          </div>
        }
      />

      {/* 1. Student Summary Hero Card */}
      <StudentProgressHeroCard
        student={detail}
        onOpenEvaluationModal={() => setShowModal(true)}
      />

      {/* 2. Section: Tất cả bài tập trong môn học */}
      <StudentAssignmentsSection assignments={detail.assignments} />

      {/* 3. Section: Đánh giá cá nhân của GV & TA */}
      <StudentEvaluationSection
        evaluations={detail.evaluations}
        onOpenEvaluationModal={() => setShowModal(true)}
      />

      {/* Modal tạo đánh giá cá nhân */}
      <CreateEvaluationModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        studentId={detail.studentId}
        studentName={detail.fullName}
        studentCode={detail.studentCode}
        classId={classId}
        className={detail.className}
        evaluatorName="ThS. Hoàng Quốc Việt"
        evaluatorRole="Giáo viên"
        onSubmit={handleCreateEvaluation}
      />
    </>
  );
}
