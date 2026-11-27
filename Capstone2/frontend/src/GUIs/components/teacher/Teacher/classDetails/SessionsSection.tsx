import { DataState, dataError } from '../../../Common/DataState';
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import teachingDAL, { type TeachingSessionItemDto, isSessionStarted, isAttendanceExpired } from "../../../../../DAL/teachingDAL";

export interface SessionsSectionProps {
  classId?: string | number;
  baseRolePath?: string;
}

export default function SessionsSection({ classId = "1", baseRolePath = "/teacher" }: SessionsSectionProps) {
  const [loadError, setLoadError] = useState<string | null>(null);
  const [retryVersion, setRetryVersion] = useState(0);

  const [sessions, setSessions] = useState<TeachingSessionItemDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    async function loadSessions() {
      try {
        setLoading(true);
      setLoadError(null);
        const data = await teachingDAL.getClassSessions(Number(classId));
        if (isMounted && data) {
          setSessions(data);
        }
      } catch (err) {
        if (isMounted) setLoadError(dataError(err));
        console.warn("Lỗi tải buổi học của lớp:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadSessions();
    return () => {
      isMounted = false;
    };
  }, [retryVersion, classId]);

  if (loadError) return <DataState error message={loadError} onRetry={() => { setLoadError(null); setRetryVersion(v => v + 1); }} />;

  return (
    <details className="card class-list-card border-0 mb-4">
      <summary className="class-list-header d-flex align-items-center justify-content-between cursor-pointer py-3 px-4">
        <div className="d-flex align-items-center gap-2">
          <i className="bi bi-calendar-week-fill text-primary fs-5" />
          <h4 className="class-list-title mb-0">
            Class Sessions Schedule ({sessions.length})
          </h4>
        </div>
        <i className="bi bi-chevron-down details-chevron text-muted" />
      </summary>

      {loading ? (
        <div className="p-4 text-center">
          <div className="spinner-border spinner-border-sm text-primary me-2" role="status" />
          <span className="text-muted small">Loading class sessions...</span>
        </div>
      ) : (
        <div className="table-responsive-container">
          <table className="table custom-table align-middle mb-0">
            <thead>
              <tr>
                <th>Session</th>
                <th>Date</th>
                <th>Time</th>
                <th>Room</th>
                <th>Status</th>
                <th className="text-end">Action</th>
              </tr>
            </thead>
            <tbody>
              {sessions.length === 0 && <tr><td colSpan={6} className="text-center text-muted p-4">No sessions available.</td></tr>}
              {sessions.map((s, idx) => {
                const isCompleted = s.status === "completed" || s.isRecorded;
                const hasStarted = s.hasStarted !== undefined ? s.hasStarted : (isCompleted || isSessionStarted(s));
                const canTakeAttendance = s.canTakeAttendance !== undefined ? s.canTakeAttendance : (hasStarted && !isAttendanceExpired(s));

                return (
                  <tr key={s.sessionId} className={isCompleted ? "session-row-ended" : ""}>
                    <td className="fw-semibold text-dark">
                      <i className="bi bi-book me-1 text-primary" />
                      Session {idx + 1}: Lecture &amp; Practice
                    </td>
                    <td>{s.sessionDate}</td>
                    <td>{s.timePeriod || "Not provided"}</td>
                    <td>
                      <span className="badge bg-light text-dark border">
                        <i className="bi bi-geo-alt me-1 text-secondary" />
                        {s.room || "Not provided"}
                      </span>
                    </td>
                    <td>
                      {isCompleted ? (
                        <span className="badge bg-success-subtle text-success fw-medium px-2.5 py-1">
                          <i className="bi bi-check-circle me-1" /> Attendance Recorded
                        </span>
                      ) : !hasStarted ? (
                        <span className="badge bg-secondary-subtle text-secondary fw-medium px-2.5 py-1" title="Session has not started yet">
                          <i className="bi bi-hourglass-split me-1" /> Not Started
                        </span>
                      ) : (
                        <span className="badge bg-warning-subtle text-warning-emphasis fw-medium px-2.5 py-1">
                          <i className="bi bi-clock me-1" /> Not Recorded
                        </span>
                      )}
                    </td>
                    <td className="text-end">
                      <div className="d-inline-flex align-items-center gap-1">
                        {isCompleted ? (
                          <Link
                            to={`${baseRolePath}/classes/${classId}/attendance?sessionId=${s.sessionId}`}
                            className="btn btn-sm btn-outline-success d-inline-flex align-items-center gap-1 shadow-sm"
                          >
                            <i className="bi bi-clipboard-check" />
                            <span>View Attendance</span>
                          </Link>
                        ) : canTakeAttendance ? (
                          <Link
                            to={`${baseRolePath}/classes/${classId}/attendance?sessionId=${s.sessionId}`}
                            className="btn btn-sm btn-primary d-inline-flex align-items-center gap-1 shadow-sm"
                          >
                            <i className="bi bi-clipboard-check" />
                            <span>Take Attendance</span>
                          </Link>
                        ) : hasStarted ? (
                          <button
                            type="button"
                            className="btn btn-sm btn-light border text-muted d-inline-flex align-items-center gap-1 opacity-75"
                            disabled
                            title="Attendance is closed 2 hours after the session ends"
                          >
                            <i className="bi bi-lock-fill text-secondary" />
                            <span>Attendance Closed</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="btn btn-sm btn-light border text-muted d-inline-flex align-items-center gap-1 opacity-75"
                            disabled
                            title="Only started sessions can be marked for attendance"
                          >
                            <i className="bi bi-lock-fill text-secondary" />
                            <span>Not Started</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </details>
  );
}
