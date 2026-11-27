import { DataState, dataError } from '../../components/Common/DataState';
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useParent } from '../../../contexts/ParentContext';
import { LearnerPageLoader } from '../../components/student/common/LearnerPageLoader';
import { type ChildClassItem } from '../../../DAL/parentDAL';
import { learningDAL } from '../../../DAL/learningDAL';
import type { ClassSessionAttendanceItemApiDto } from '../../../api/learningApi';
import { ClassHeroDecoration } from '../../components/Common/ClassHeroDecoration';
import { ClassInfoCard } from '../../components/student/classDetail/ClassInfoCard';
import { ClassEvaluationsSection } from '../../components/student/classDetail/ClassEvaluationsSection';
import type { ClassDetailItem } from '../../components/student/classDetail/classDetailData';
import type { ProgressFeedback } from '../../components/student/progress/progressData';

export function ParentClassDetailPage() {
  const [loadError, setLoadError] = useState<string | null>(null);
  const [retryVersion, setRetryVersion] = useState(0);

  const { id: paramId } = useParams<{ id: string }>();
  const { selectedChild, loading: parentLoading } = useParent();

  const classId = Number(paramId || new URLSearchParams(window.location.search).get('id'));

  const [cls, setCls] = useState<ChildClassItem | undefined>(undefined);
  const [detailCls, setDetailCls] = useState<ClassDetailItem | null>(null);
  const [sessions, setSessions] = useState<ClassSessionAttendanceItemApiDto[]>([]);
  const [feedbacksError, setFeedbacksError] = useState<string | undefined>();
  const [feedbacks, setFeedbacks] = useState<ProgressFeedback[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    async function loadDetail() {
      setLoading(true);
      setLoadError(null);
      const studentId = selectedChild?.id;
      try {
        if (!studentId || !selectedChild?.classes.some(c => c.id === classId)) throw new Error('Forbidden');
        const detailVm = await learningDAL.getStudentClassDetail(classId, studentId);
        if (isMounted && detailVm) {
          setDetailCls(detailVm.cls);
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
          setFeedbacks(detailVm.feedbacks || []);
          setFeedbacksError(detailVm.feedbacksError);
          return;
        }

      } catch (err) {
        if (isMounted) setLoadError(dataError(err));
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
  }, [retryVersion, classId, selectedChild?.id]);

  useEffect(() => {
    if (cls) {
      document.title = `${cls.name} – Child's Class Details – EduTrack`;
    }
  }, [cls]);

  // Feedbacks học tập từ Backend (fallback ghi chú giáo viên nếu có nhận xét thực sự)
  const displayFeedbacks: ProgressFeedback[] = useMemo(() => {
    if (feedbacks.length > 0) return feedbacks;
    const note = cls?.notes?.trim();
    if (cls && note && !note.toLowerCase().includes('chưa có nhận xét') && !note.toLowerCase().includes('no teacher evaluation')) {
      return [
        {
          assignmentTitle: `Periodic Evaluation - ${cls.name}`,
          quote: note,
          teacherName: cls.teacher || 'Lead Teacher',
          statusType: 'dat',
          statusIcon: 'bi-check2-all',
          statusLabel: 'Teacher Note',
          category: 'evaluation',
        },
      ];
    }
    return [];
  }, [feedbacks, cls?.notes, cls?.name, cls?.teacher]);

  if (loadError) return <DataState error message={loadError} onRetry={() => { setLoadError(null); setRetryVersion(v => v + 1); }} />;

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

  // Thống kê buổi học & lọc chuyên cần (vắng / trễ)
  const conductedSessions = sessions.filter((s) => s.status !== 'scheduled');
  const presentSessions = sessions.filter((s) => s.status === 'present');
  const absentSessions = sessions.filter((s) => s.status === 'absent');
  const lateSessions = sessions.filter((s) => s.status === 'late');
  const exceptionSessions = sessions.filter((s) => s.status === 'absent' || s.status === 'late');

  const attendedCount = presentSessions.length + lateSessions.length;
  const actualAttended = sessions.length > 0 ? attendedCount : (cls.attendedLessons || 0);
  const totalLessons = cls.totalLessons || sessions.length || 0;
  const hasConducted = conductedSessions.length > 0;
  const attendanceRate = hasConducted
    ? Math.round((attendedCount / conductedSessions.length) * 100)
    : null;
  const unmarkedCount = Math.max(0, conductedSessions.length - presentSessions.length - lateSessions.length - absentSessions.length);
  const barTotal = conductedSessions.length || 1;
  const presentPct = (presentSessions.length / barTotal) * 100;
  const latePct = (lateSessions.length / barTotal) * 100;
  const absentPct = (absentSessions.length / barTotal) * 100;

  return (
    <main className="main-content">
      <div className={`content-container class-detail-container ${cls.subjectClass}`}>
        {/* 1. Hero Banner Thân Thiện Dành Cho Phụ Huynh (Xanh lá cây thương hiệu EduTrack) */}
        <div
          className="class-hero-banner mb-4 et-class-hero"
          style={{
            background: 'var(--et-brand-banner)',
            borderRadius: '20px',
            padding: '28px',
            color: '#fff',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 10px 25px -5px rgba(5, 100, 60, 0.25)',
          }}
        >
          <ClassHeroDecoration subject={cls.subject} />
          <div className="position-relative" style={{ zIndex: 2 }}>
            {/* Back Button */}
            <Link
              to="/parent/classes"
              className="btn btn-sm text-white rounded-pill px-3 py-1 mb-3 d-inline-flex align-items-center gap-2"
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

            {/* Hero Main Info */}
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mt-2 et-class-hero-row">
              <div className="et-class-hero-copy">
                <span className="badge bg-white text-success fw-bold px-3 py-1 rounded-pill mb-2 shadow-xs">
                  {cls.subject}
                </span>
                <h1 className="h3 fw-bold mb-2 text-white">{cls.name}</h1>
                {/* Breadcrumbs */}
                <div className="d-flex align-items-center gap-2 small mb-2 et-class-hero-breadcrumbs" style={{ color: 'rgba(255, 255, 255, 0.85)' }}>
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
                <p className="mb-0 small" style={{ color: 'rgba(255, 255, 255, 0.85)' }}>
                  <span>Teacher: <strong className="text-white">{cls.teacher}</strong></span>
                  <span className="mx-2">·</span>
                  <span>Schedule: <strong className="text-white">{cls.schedule}</strong></span>
                </p>
              </div>

              {/* Quick Attendance Stat Badge */}
              <div
                className="et-class-hero-summary"
              >
                <div className="text-center et-class-hero-summary-item">
                  <i className="bi bi-calendar-check et-class-hero-summary-icon" aria-hidden="true" />
                  <div className="h4 fw-bold mb-0 text-white">
                    {actualAttended}/{totalLessons}
                  </div>
                  <div className="small" style={{ color: 'rgba(255, 255, 255, 0.85)' }}>Sessions Attended</div>
                </div>
                <div
                  className="et-class-hero-summary-divider"
                  style={{
                    width: '1px',
                    height: '36px',
                    backgroundColor: 'rgba(255, 255, 255, 0.3)',
                  }}
                ></div>
                <div className="text-center et-class-hero-summary-item">
                  <i className="bi bi-person-check et-class-hero-summary-icon" aria-hidden="true" />
                  <div
                    className={`h4 fw-bold mb-0 ${attendanceRate === null || attendanceRate >= 90
                      ? 'text-white'
                      : attendanceRate >= 70
                        ? 'text-warning'
                        : 'text-danger'
                      }`}
                  >
                    {attendanceRate !== null ? `${attendanceRate}%` : '—'}
                  </div>
                  <div className="small" style={{ color: 'rgba(255, 255, 255, 0.85)' }}>Attendance Rate</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Class Info Card (Teacher, TA, Schedule, Room, Description) */}
        <ClassInfoCard
          cls={
            detailCls || {
              id: cls.id,
              name: cls.name,
              subject: cls.subject,
              subjectClass: cls.subjectClass,
              grad: '',
              accent: '',
              teacher: cls.teacher,
              teacherInitials: cls.teacherInitials,
              schedule: cls.schedule,
              room: cls.room,
              email: '',
              phone: '',
              description: '',
              studentCount: 0,
            }
          }
        />

        {/* SECTION 1: ATTENDANCE & ABSENCE TRACKING (Chỉ hiển thị nghỉ/trễ, mặc định đóng) */}
        <details className="card class-list-card border-0 mb-4">
          <summary className="class-list-header d-flex align-items-center justify-content-between py-3 px-4 flex-wrap gap-2 cursor-pointer">
            <div className="d-flex align-items-center gap-2">
              <i className="bi bi-calendar-check-fill text-primary fs-5" />
              <h4 className="class-list-title mb-0">
                Attendance &amp; Absence Tracking
              </h4>
            </div>

            <i className="bi bi-chevron-down details-chevron text-muted" />
          </summary>

          <div className="p-4">
            {/* Compact Segmented Attendance Bar & Legend */}
            <div className="mb-3 pb-3 border-bottom">
              <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-2 small">
                <span className="text-muted">
                  Conducted Sessions: <strong className="text-dark">{conductedSessions.length}</strong>
                </span>
                <div className="d-flex align-items-center flex-wrap gap-3">
                  <span className="d-inline-flex align-items-center gap-1 text-secondary">
                    <span className="rounded-circle bg-success d-inline-block" style={{ width: 8, height: 8 }} />
                    Present: <strong className="text-dark">{presentSessions.length}</strong>
                  </span>
                  <span className="d-inline-flex align-items-center gap-1 text-secondary">
                    <span className="rounded-circle bg-warning d-inline-block" style={{ width: 8, height: 8 }} />
                    Late: <strong className="text-dark">{lateSessions.length}</strong>
                  </span>
                  <span className="d-inline-flex align-items-center gap-1 text-secondary">
                    <span className="rounded-circle bg-danger d-inline-block" style={{ width: 8, height: 8 }} />
                    Absent: <strong className="text-dark">{absentSessions.length}</strong>
                  </span>
                  {unmarkedCount > 0 && (
                    <span className="d-inline-flex align-items-center gap-1 text-secondary">
                      <span className="rounded-circle bg-secondary bg-opacity-50 d-inline-block" style={{ width: 8, height: 8 }} />
                      Unmarked: <strong className="text-dark">{unmarkedCount}</strong>
                    </span>
                  )}
                </div>
              </div>
              <div className="progress rounded-pill" style={{ height: '8px', backgroundColor: '#E2E8F0' }}>
                {presentPct > 0 && (
                  <div
                    className="progress-bar bg-success"
                    role="progressbar"
                    style={{ width: `${presentPct}%` }}
                    aria-valuenow={presentSessions.length}
                    aria-valuemin={0}
                    aria-valuemax={conductedSessions.length}
                  />
                )}
                {latePct > 0 && (
                  <div
                    className="progress-bar bg-warning"
                    role="progressbar"
                    style={{ width: `${latePct}%` }}
                    aria-valuenow={lateSessions.length}
                    aria-valuemin={0}
                    aria-valuemax={conductedSessions.length}
                  />
                )}
                {absentPct > 0 && (
                  <div
                    className="progress-bar bg-danger"
                    role="progressbar"
                    style={{ width: `${absentPct}%` }}
                    aria-valuenow={absentSessions.length}
                    aria-valuemin={0}
                    aria-valuemax={conductedSessions.length}
                  />
                )}
              </div>
            </div>

            {/* Chi tiết chỉ các buổi vắng hoặc trễ */}
            {exceptionSessions.length === 0 ? (
              <div className="p-4 rounded-4 bg-success bg-opacity-10 border border-success-subtle text-center">
                <i className="bi bi-patch-check-fill text-success fs-1 mb-2 d-block"></i>
                <h5 className="fw-bold text-success mb-1">{!hasConducted ? 'No attendance records yet.' : unmarkedCount > 0 ? 'Attendance is incomplete.' : 'No absence or lateness recorded.'}</h5>
                <p className="text-secondary small mb-0">
                  Only recorded attendance is shown.
                </p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr className="small text-secondary">
                      <th style={{ width: '90px' }}>Session</th>
                      <th style={{ width: '160px' }}>Date</th>
                      <th style={{ width: '150px' }}>Status</th>
                      <th>Topic</th>
                      <th>Teacher Notes / Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {exceptionSessions.map((ses) => (
                      <tr key={ses.sessionNo}>
                        <td className="fw-bold text-primary">#{ses.sessionNo}</td>
                        <td className="small text-muted">{ses.date}</td>
                        <td>
                          {ses.status === 'absent' ? (
                            <span className="badge bg-danger-subtle text-danger border border-danger-subtle rounded-pill px-2 py-1">
                              <i className="bi bi-x-circle-fill me-1"></i> Absent
                            </span>
                          ) : (
                            <span className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle rounded-pill px-2 py-1">
                              <i className="bi bi-clock-history me-1"></i> Late
                            </span>
                          )}
                        </td>
                        <td className="fw-medium text-dark">{ses.topic}</td>
                        <td className="small text-muted">{ses.notes || 'No note recorded'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </details>

        {/* SECTION 2: TEACHER EVALUATIONS & FEEDBACK (Y chang của Student, mặc định đóng) */}
        {feedbacksError ? <DataState error message={feedbacksError} onRetry={() => setRetryVersion(v => v + 1)} /> : <ClassEvaluationsSection feedbacks={displayFeedbacks} classNameTitle={cls.name} />}
      </div>
    </main>
  );
}

export default ParentClassDetailPage;
