import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useParent } from '../../../contexts/ParentContext';
import { LearnerPageLoader } from '../../components/student/common/LearnerPageLoader';
import { parentDAL, type ChildClassItem } from '../../../DAL/parentDAL';
import { learningDAL, DEFAULT_STUDENT_ID } from '../../../DAL/learningDAL';
import type { ClassSessionAttendanceItemApiDto } from '../../../api/learningApi';

export function ParentClassDetailPage() {
  const { id: paramId } = useParams<{ id: string }>();
  const { selectedChild, loading: parentLoading } = useParent();

  const classId = parseInt(paramId || '1', 10);

  const [cls, setCls] = useState<ChildClassItem | undefined>(undefined);
  const [sessions, setSessions] = useState<ClassSessionAttendanceItemApiDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    async function loadDetail() {
      setLoading(true);
      const studentId = selectedChild?.id || DEFAULT_STUDENT_ID;
      try {
        const detailVm = await learningDAL.getStudentClassDetail(classId, studentId);
        if (isMounted && detailVm) {
          setCls({
            id: detailVm.cls.id,
            name: detailVm.cls.name,
            subject: detailVm.cls.subject,
            subjectClass: detailVm.cls.subjectClass,
            badge: detailVm.cls.subject,
            teacher: detailVm.cls.teacher,
            teacherInitials: detailVm.cls.teacherInitials,
            schedule: detailVm.cls.schedule,
            room: detailVm.cls.room,
            attendedLessons: detailVm.attendedLessons,
            totalLessons: detailVm.totalLessons,
            notes: detailVm.latestTeacherNote,
          });
          setSessions(detailVm.sessions || []);
          return;
        }

        const item = await parentDAL.getChildClassById(classId);
        if (isMounted && item) {
          setCls(item);
        }
      } catch (err) {
        console.warn('Lỗi khi tải chi tiết lớp học của con:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadDetail();

    return () => {
      isMounted = false;
    };
  }, [classId, selectedChild?.id]);

  useEffect(() => {
    if (cls) {
      document.title = `${cls.name} – Class Details (Parent) – EduTrack`;
    }
  }, [cls]);

  if (parentLoading || loading) {
    return (
      <LearnerPageLoader
        title="Loading class details..."
        message="The system is loading class information and attendance log."
      />
    );
  }

  if (!cls || !selectedChild) {
    return (
      <main className="main-content">
        <div className="content-container py-5 text-center">
          <p className="text-muted">No student class information found.</p>
          <Link to="/parent/classes" className="btn btn-primary btn-sm rounded-pill">
            Back to Class List
          </Link>
        </div>
      </main>
    );
  }

  // Tính số buổi con đã tham gia và tỉ lệ chuyên cần thực tế
  const conductedSessions = sessions.filter((s) => s.status !== 'scheduled');
  const attendedCount = sessions.filter(
    (s) => s.status === 'present' || s.status === 'late'
  ).length;

  const actualAttended = sessions.length > 0 ? attendedCount : (cls.attendedLessons || 0);
  const totalLessons = cls.totalLessons || sessions.length || 0;
  const attendanceRate = conductedSessions.length > 0
    ? Math.round((attendedCount / conductedSessions.length) * 100)
    : 100;

  return (
    <main className="main-content">
      <div className={`content-container class-detail-container ${cls.subjectClass}`}>
        {/* 1. Hero Banner Thân Thiện Dành Cho Phụ Huynh */}
        <div
          className="class-hero-banner mb-4"
          style={{
            background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
            borderRadius: '20px',
            padding: '28px',
            color: '#fff',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 10px 25px -5px rgba(37, 99, 235, 0.25)',
          }}
        >
          <div className="position-relative" style={{ zIndex: 2 }}>
            {/* Back Button */}
            <Link
              to="/parent/classes"
              className="btn btn-sm text-white rounded-pill px-3 py-1.5 mb-3 d-inline-flex align-items-center gap-2"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.18)',
                border: '1px solid rgba(255, 255, 255, 0.35)',
                backdropFilter: 'blur(8px)',
                textDecoration: 'none',
              }}
            >
              <i className="bi bi-arrow-left"></i>
              <span className="fw-medium">Back to Class List</span>
            </Link>

            {/* Breadcrumbs */}
            <div className="d-flex align-items-center gap-2 small text-white-50 mb-2">
              <Link to="/parent/dashboard" className="text-white text-decoration-none opacity-75">
                Dashboard
              </Link>
              <i className="bi bi-chevron-right fs-xs"></i>
              <Link to="/parent/classes" className="text-white text-decoration-none opacity-75">
                Child's Classes
              </Link>
              <i className="bi bi-chevron-right fs-xs"></i>
              <span className="fw-semibold text-white">{cls.name}</span>
            </div>

            {/* Hero Main Info */}
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mt-2">
              <div>
                <span className="badge bg-white text-primary fw-bold px-3 py-1.5 rounded-pill mb-2 shadow-xs">
                  {cls.subject}
                </span>
                <h1 className="h3 fw-bold mb-2 text-white">{cls.name}</h1>
                <p className="mb-0 text-white-50 small">
                  <span>Student: <strong className="text-white">{selectedChild.name}</strong> ({selectedChild.grade})</span>
                  <span className="mx-2">·</span>
                  <span>Teacher: <strong className="text-white">{cls.teacher}</strong></span>
                </p>
              </div>

              {/* Quick Progress Badge */}
              <div
                className="d-flex align-items-center gap-3 p-3 rounded-4 shadow-sm"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.18)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  backdropFilter: 'blur(8px)',
                }}
              >
                <div className="text-center">
                  <div className="h4 fw-bold mb-0 text-white">
                    {actualAttended}/{totalLessons}
                  </div>
                  <div className="small text-white-50">Session Progress</div>
                </div>
                <div
                  style={{
                    width: '1px',
                    height: '36px',
                    backgroundColor: 'rgba(255, 255, 255, 0.3)',
                  }}
                ></div>
                <div className="text-center">
                  <div
                    className={`h4 fw-bold mb-0 ${
                      attendanceRate >= 90
                        ? 'text-white'
                        : attendanceRate >= 70
                        ? 'text-warning'
                        : 'text-danger'
                    }`}
                  >
                    {attendanceRate}%
                  </div>
                  <div className="small text-white-50">Attendance</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Thẻ Thông Tin Cơ Bản Của Lớp (Không chứa tài liệu & nộp bài) */}
        <div className="row g-4 mb-4">
          <div className="col-lg-6">
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
              <h3 className="h6 fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                <i className="bi bi-info-circle-fill text-primary"></i>
                Basic Class Information
              </h3>

              <div className="d-flex flex-column gap-3">
                <div className="d-flex align-items-start gap-3 p-2.5 rounded-3 bg-light">
                  <div className="p-2 rounded-3 bg-white text-primary shadow-xs">
                    <i className="bi bi-calendar-week fs-5"></i>
                  </div>
                  <div>
                    <div className="small text-muted">Weekly Schedule</div>
                    <div className="fw-semibold text-dark">{cls.schedule}</div>
                  </div>
                </div>

                <div className="d-flex align-items-start gap-3 p-2.5 rounded-3 bg-light">
                  <div className="p-2 rounded-3 bg-white text-primary shadow-xs">
                    <i className="bi bi-geo-alt fs-5"></i>
                  </div>
                  <div>
                    <div className="small text-muted">Room</div>
                    <div className="fw-semibold text-dark">{cls.room || 'Center Classroom'}</div>
                  </div>
                </div>

                <div className="d-flex align-items-start gap-3 p-2.5 rounded-3 bg-light">
                  <div className="p-2 rounded-3 bg-white text-primary shadow-xs">
                    <i className="bi bi-person-workspace fs-5"></i>
                  </div>
                  <div>
                    <div className="small text-muted">Teacher</div>
                    <div className="fw-semibold text-dark">{cls.teacher}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-6">
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
              <h3 className="h6 fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                <i className="bi bi-chat-heart-fill text-danger"></i>
                Teacher Evaluation &amp; Feedback
              </h3>

              <div className="p-3 rounded-4 bg-primary bg-opacity-10 border border-primary-subtle mb-3">
                <div className="d-flex align-items-center gap-2 mb-2">
                  <div className="badge bg-primary text-white rounded-pill px-2.5 py-1">
                    Latest Evaluation
                  </div>
                  <small className="text-muted">Current Semester</small>
                </div>
                <p className="fw-medium text-dark mb-0 fst-italic">
                  "{cls.notes || 'Full attendance, actively participates in class.'}"
                </p>
              </div>

              <div className="d-flex align-items-center justify-content-between small text-muted border-top pt-3 mt-auto">
                <span>Academic Support: <strong>Academic Affairs &amp; Course Teaching Assistants</strong></span>
                <span className="badge bg-success-subtle text-success">Active Support</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Bảng Theo Dõi Chuyên Cần & Buổi Học Của Con */}
        <div className="card border-0 shadow-sm rounded-4 p-4 bg-white mb-4">
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
            <div>
              <h3 className="h6 fw-bold text-dark mb-1 d-flex align-items-center gap-2">
                <i className="bi bi-check2-square text-success fs-5"></i>
                Attendance Log &amp; Session Content
              </h3>
              <p className="small text-muted mb-0">
                Track your child's attendance for each session to stay informed
              </p>
            </div>
            <span className="badge bg-light text-secondary border px-3 py-1.5 rounded-pill">
              Automatically updated after each session
            </span>
          </div>

          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr className="small text-secondary">
                  <th style={{ width: '80px' }}>Session</th>
                  <th style={{ width: '160px' }}>Time</th>
                  <th>Topic</th>
                  <th style={{ width: '130px' }}>Attendance</th>
                  <th>Class Notes</th>
                </tr>
              </thead>
              <tbody>
                {sessions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center text-muted py-4">
                      No session log has been recorded for this class yet.
                    </td>
                  </tr>
                ) : (
                  sessions.map((ses) => (
                    <tr key={ses.sessionNo}>
                      <td className="fw-bold text-primary">#{ses.sessionNo}</td>
                      <td className="small text-muted">{ses.date}</td>
                      <td className="fw-medium text-dark">{ses.topic}</td>
                      <td>
                        {ses.status === 'present' ? (
                          <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-2.5 py-1">
                            <i className="bi bi-check-circle-fill me-1"></i> {ses.statusLabel === 'Có mặt' ? 'Present' : (ses.statusLabel || 'Present')}
                          </span>
                        ) : ses.status === 'scheduled' ? (
                          <span className="badge bg-info-subtle text-info-emphasis border border-info-subtle rounded-pill px-2.5 py-1">
                            <i className="bi bi-clock-history me-1"></i> {ses.statusLabel === 'Đã xếp lịch' ? 'Scheduled' : (ses.statusLabel || 'Scheduled')}
                          </span>
                        ) : (
                          <span className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle rounded-pill px-2.5 py-1">
                            <i className="bi bi-exclamation-circle-fill me-1"></i> {ses.statusLabel === 'Vắng mặt' ? 'Absent' : ses.statusLabel === 'Đi muộn' ? 'Late' : (ses.statusLabel || 'Absent')}
                          </span>
                        )}
                      </td>
                      <td className="small text-muted">{ses.notes}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Lưu ý thân thiện dành riêng cho Phụ huynh */}
        <div className="alert alert-light border rounded-4 d-flex align-items-center gap-3 p-3">
          <i className="bi bi-shield-check fs-4 text-primary"></i>
          <div className="small text-secondary">
            <strong>Parent Note:</strong> This class details page provides an overview of your child's schedule, attendance, and progress. Lecture materials and practice assignments are retained in the student's account so they can independently complete and submit assignments.
          </div>
        </div>
      </div>
    </main>
  );
}

export default ParentClassDetailPage;
