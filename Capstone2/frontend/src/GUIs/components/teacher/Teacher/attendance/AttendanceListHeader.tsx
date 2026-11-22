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
}: AttendanceListHeaderProps) {
  const isCompleted = session?.status === "completed" || session?.isRecorded;

  return (
    <div className="class-list-header d-flex align-items-center justify-content-between flex-wrap gap-2 p-3 border-bottom">
      <div className="d-flex align-items-center gap-2 flex-wrap">
        <h4 className="class-list-title mb-0 fw-bold">{className}</h4>
        {session && (
          <span
            className={`badge ${
              isCompleted
                ? "bg-success-subtle text-success border border-success-subtle"
                : "bg-warning-subtle text-warning-emphasis border border-warning-subtle"
            } px-2 py-1`}
          >
            <i className={`bi ${isCompleted ? "bi-check-circle-fill" : "bi-clock-history"} me-1`} />
            {isCompleted ? "Attendance Recorded" : "Not Recorded"}
          </span>
        )}
      </div>
    </div>
  );
}

export default AttendanceListHeader;
