import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import teachingDAL, { type TeachingSessionItemDto, isSessionStarted } from "../../../../../DAL/teachingDAL";

export interface SessionsSectionProps {
  classId?: string | number;
  baseRolePath?: string;
}

export default function SessionsSection({ classId = "1", baseRolePath = "/teacher" }: SessionsSectionProps) {
  const [sessions, setSessions] = useState<TeachingSessionItemDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    async function loadSessions() {
      try {
        setLoading(true);
        const data = await teachingDAL.getClassSessions(Number(classId));
        if (isMounted && data) {
          setSessions(data);
        }
      } catch (err) {
        console.warn("Lỗi tải buổi học của lớp:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadSessions();
    return () => {
      isMounted = false;
    };
  }, [classId]);

  return (
    <details className="card class-list-card border-0 mb-4" open>
      <summary className="class-list-header d-flex align-items-center justify-content-between cursor-pointer py-3 px-4">
        <div className="d-flex align-items-center gap-2">
          <i className="bi bi-calendar-week-fill text-primary fs-5" />
          <h4 className="class-list-title mb-0">
            Class Sessions Schedule ({sessions.length > 0 ? sessions.length : 3})
          </h4>
        </div>
        <div className="d-flex align-items-center gap-2">
          <span className="text-muted small">Collapse / Expand</span>
          <i className="bi bi-chevron-down details-chevron text-muted" />
        </div>
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
              {sessions.map((s, idx) => {
                const isCompleted = s.status === "completed" || s.isRecorded;
                const hasStarted = s.hasStarted !== undefined ? s.hasStarted : (isCompleted || isSessionStarted(s));

                return (
                  <tr key={s.sessionId} className={isCompleted ? "session-row-ended" : ""}>
                    <td className="fw-semibold text-dark">
                      <i className="bi bi-book me-1 text-primary" />
                      Session {idx + 1}: Lecture &amp; Practice
                    </td>
                    <td>{s.sessionDate}</td>
                    <td>{s.timePeriod || "18:00 - 20:00"}</td>
                    <td>
                      <span className="badge bg-light text-dark border">
                        <i className="bi bi-geo-alt me-1 text-secondary" />
                        {s.room || "Room 201"}
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
                        ) : hasStarted ? (
                          <Link
                            to={`${baseRolePath}/classes/${classId}/attendance?sessionId=${s.sessionId}`}
                            className="btn btn-sm btn-primary d-inline-flex align-items-center gap-1 shadow-sm"
                          >
                            <i className="bi bi-clipboard-check" />
                            <span>Take Attendance</span>
                          </Link>
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
