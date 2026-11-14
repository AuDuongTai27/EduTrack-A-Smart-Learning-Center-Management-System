import React from "react";
import type { TeachingSessionItemDto } from "../../../../../BLL/models/teaching/TeachingAttendanceDto";

export interface AttendanceListHeaderProps {
  className?: string;
  session?: TeachingSessionItemDto | null;
  totalStudents?: number;
}

export function AttendanceListHeader({
  className = "Class",
  session,
  totalStudents = 0,
}: AttendanceListHeaderProps) {
  const isCompleted = session?.status === "completed" || session?.isRecorded;

  return (
    <div className="class-list-header d-flex align-items-center justify-content-between flex-wrap gap-3 p-3 border-bottom">
      <div>
        <div className="d-flex align-items-center gap-2 mb-1">
          <h4 className="class-list-title mb-0 fw-bold">{className}</h4>
          {session && (
            <span
              className={`badge ${
                isCompleted
                  ? "bg-success-subtle text-success border border-success-subtle"
                  : "bg-warning-subtle text-warning-emphasis border border-warning-subtle"
              } px-2.5 py-1`}
            >
              <i className={`bi ${isCompleted ? "bi-check-circle-fill" : "bi-clock-history"} me-1`} />
              {isCompleted ? "Attendance Taken" : "Attendance Not Taken"}
            </span>
          )}
        </div>
        <p className="text-muted small mb-0">
          {session ? (
            <>
              <i className="bi bi-calendar3 me-1 text-primary" />
              <span>{session.title}</span>
            </>
          ) : (
            <span>Student attendance list (Managed by Teaching Assistant)</span>
          )}
        </p>
      </div>

      <div className="d-flex align-items-center gap-2">
        <span className="badge bg-light text-dark border px-3 py-2 fw-semibold">
          <i className="bi bi-people-fill text-primary me-1" />
          Class size: {totalStudents} students
        </span>
      </div>
    </div>
  );
}

export default AttendanceListHeader;
