import React from "react";
import type {
  TeachingSessionItemDto,
  TeachingAttendanceStatsDto,
} from "../../../../../BLL/models/teaching/TeachingAttendanceDto";
import { isSessionStarted } from "../../../../../DAL/teachingDAL";

export interface AttendanceListToolbarProps {
  sessions?: TeachingSessionItemDto[];
  selectedSessionId?: number;
  onSessionChange?: (sessionId: number) => void;
  onMarkAllPresent?: () => void;
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
  stats?: TeachingAttendanceStatsDto;
  canMarkAll?: boolean;
}

export function AttendanceListToolbar({
  sessions = [],
  selectedSessionId,
  onSessionChange,
  onMarkAllPresent,
  searchTerm = "",
  onSearchChange,
  stats,
  canMarkAll = true,
}: AttendanceListToolbarProps) {
  return (
    <div className="p-3 bg-light border-bottom">
      <div className="row g-3 align-items-center">
        {/* Session Selector */}
        <div className="col-md-5 col-lg-4">
          <label className="form-label small fw-bold text-dark mb-1" htmlFor="sessionSelect">
            <i className="bi bi-calendar-event me-1 text-primary" />
            Select session for attendance:
          </label>
          <select
            id="sessionSelect"
            className="form-select form-select-sm border-primary"
            value={selectedSessionId || ""}
            onChange={(e) => onSessionChange && onSessionChange(Number(e.target.value))}
          >
            {sessions.map((s) => {
              const isStarted = s.hasStarted !== undefined ? s.hasStarted : (s.isRecorded || isSessionStarted(s));
              return (
                <option key={s.sessionId} value={s.sessionId}>
                  {s.title} {s.isRecorded ? "✓ (Saved)" : (!isStarted ? "⏳ (Not started)" : "")}
                </option>
              );
            })}
          </select>
        </div>

        {/* Search */}
        <div className="col-md-4 col-lg-4">
          <label className="form-label small fw-bold text-dark mb-1" htmlFor="tableSearchInput">
            <i className="bi bi-search me-1 text-primary" />
            Search student:
          </label>
          <div className="input-group input-group-sm">
            <input
              type="search"
              className="form-control"
              id="tableSearchInput"
              placeholder="Enter name or STU code..."
              value={searchTerm}
              onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
            />
            {searchTerm && (
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => onSearchChange && onSearchChange("")}
              >
                <i className="bi bi-x-lg" />
              </button>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="col-md-3 col-lg-4 d-flex align-items-end justify-content-md-end gap-2">
          {onMarkAllPresent && (
            <button
              type="button"
              className="btn btn-sm btn-outline-success d-inline-flex align-items-center gap-1.5 shadow-sm"
              title={canMarkAll ? "Mark all students present" : "Only started sessions can be marked for attendance"}
              onClick={canMarkAll ? onMarkAllPresent : undefined}
              disabled={!canMarkAll}
            >
              <i className="bi bi-check-all fs-6" />
              <span>Mark All Present</span>
            </button>
          )}
        </div>
      </div>

      {/* Summary Stats Badges */}
      {stats && (
        <div className="d-flex flex-wrap align-items-center gap-2 mt-3 pt-2 border-top">
          <span className="small text-muted fw-semibold me-1">Attendance status:</span>
          <span className="badge bg-success text-white px-2.5 py-1">
            <i className="bi bi-check-circle me-1" />
            Present: {stats.presentCount}
          </span>
          <span className="badge bg-warning text-dark px-2.5 py-1">
            <i className="bi bi-clock-history me-1" />
            Late: {stats.lateCount}
          </span>
          <span className="badge bg-danger text-white px-2.5 py-1">
            <i className="bi bi-x-circle me-1" />
            Absent: {stats.absentCount}
          </span>
          <span className="badge bg-info text-dark px-2.5 py-1">
            <i className="bi bi-shield-check me-1" />
            Excused: {stats.excusedCount}
          </span>
          <span className="ms-auto small fw-bold text-primary">
            Attendance Rate: {stats.attendanceRate}%
          </span>
        </div>
      )}
    </div>
  );
}

export default AttendanceListToolbar;
