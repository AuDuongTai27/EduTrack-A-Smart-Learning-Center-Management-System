import React from "react";

export interface TeacherKpiCardsProps {
  /** Count of currently active assignments */
  activeAssignments?: number;
  /** Count of assignments due today */
  assignmentsDueToday?: number;
  /** Count of currently active classes */
  activeClasses?: number;
  /** Count of classes scheduled for today */
  classesToday?: number;
  /** Total students across assigned classes */
  totalStudents?: number;
  /** Pending attendance sessions count */
  pendingAttendance?: number;
}

export function TeacherKpiCards({
  activeAssignments = 8,
  assignmentsDueToday = 3,
  activeClasses = 6,
  classesToday = 2,
  totalStudents = 45,
  pendingAttendance = 1,
}: TeacherKpiCardsProps) {
  return (
    <div className="dashboard-kpis teacher-kpis mb-4">
      {/* 1. Active Assignments */}
      <div className="card dashboard-kpi border-0">
        <div className="card-body">
          <div className="d-flex align-items-center justify-content-between">
            <div>
              <p className="text-muted mb-1">Active Assignments</p>
              <h3 className="mb-0">{activeAssignments}</h3>
            </div>
            <div className="kpi-icon bg-primary-subtle text-primary">
              <i className="bi bi-mortarboard-fill" />
            </div>
          </div>
          <div className="border-top mt-3 pt-3">
            <span className="text-muted ms-1">
              {assignmentsDueToday} assignments need grading
            </span>
          </div>
        </div>
      </div>

      {/* 2. Active Classes */}
      <div className="card dashboard-kpi border-0">
        <div className="card-body">
          <div className="d-flex align-items-center justify-content-between">
            <div>
              <p className="text-muted mb-1">Assigned Classes</p>
              <h3 className="mb-0">{activeClasses}</h3>
            </div>
            <div className="kpi-icon bg-info-subtle text-info">
              <i className="bi bi-collection-fill" />
            </div>
          </div>
          <div className="border-top mt-3 pt-3">
            <span className="text-muted">{classesToday} classes today</span>
          </div>
        </div>
      </div>

      {/* 3. My Students */}
      <div className="card dashboard-kpi border-0">
        <div className="card-body">
          <div className="d-flex align-items-center justify-content-between">
            <div>
              <p className="text-muted mb-1">My Students</p>
              <h3 className="mb-0">{totalStudents}</h3>
            </div>
            <div className="kpi-icon bg-success-subtle text-success">
              <i className="bi bi-people-fill" />
            </div>
          </div>
          <div className="border-top mt-3 pt-3">
            <span className="text-muted">across assigned classes</span>
          </div>
        </div>
      </div>

      {/* 4. Pending Attendance */}
      <div className="card dashboard-kpi border-0">
        <div className="card-body">
          <div className="d-flex align-items-center justify-content-between">
            <div>
              <p className="text-muted mb-1">Pending Attendance</p>
              <h3 className="mb-0 text-warning">{pendingAttendance}</h3>
            </div>
            <div className="kpi-icon bg-warning-subtle text-warning">
              <i className="bi bi-calendar-check-fill" />
            </div>
          </div>
          <div className="border-top mt-3 pt-3">
            <span className="text-muted">
              {pendingAttendance} session{pendingAttendance > 1 ? "s" : ""} needs attendance
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TeacherKpiCards;
