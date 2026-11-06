import React from "react";
import { Link } from "react-router-dom";

export interface TodayClassItem {
  id: string | number;
  className: string;
  timePeriod: string;
  room?: string;
  studentsCount?: number;
  status?: "Upcoming" | "In Progress" | "Completed";
  attendanceTaken?: boolean;
}

export interface TodayClassesSectionProps {
  /** List of classes scheduled for today */
  classes?: TodayClassItem[];
}

const MOCK_TODAY_CLASSES: TodayClassItem[] = [
  {
    id: 1,
    className: "Class 9A1 – Advanced Mathematics",
    timePeriod: "18:00 – 20:00",
    room: "Room 201",
    studentsCount: 15,
    status: "Upcoming",
    attendanceTaken: false,
  },
  {
    id: 2,
    className: "Class 9A2 – Advanced Mathematics",
    timePeriod: "20:00 – 21:30",
    room: "Room 202",
    studentsCount: 18,
    status: "Upcoming",
    attendanceTaken: true,
  },
];

export function TodayClassesSection({
  classes = MOCK_TODAY_CLASSES,
}: TodayClassesSectionProps = {}) {
  const displayClasses = classes && classes.length > 0 ? classes : MOCK_TODAY_CLASSES;

  const todayFormatted = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());

  return (
    <div className="card dashboard-card">
      <div className="card-header dashboard-card-header d-flex align-items-center justify-content-between">
        <div>
          <h5 className="mb-0 fw-bold">Today's Classes</h5>
          <small className="text-muted">{todayFormatted}</small>
        </div>
        <Link
          to="/teacher/schedule"
          className="dashboard-view-all text-decoration-none d-inline-flex align-items-center gap-1"
        >
          View Schedule →
        </Link>
      </div>

      <div className="card-body dashboard-card-body p-3">
        {displayClasses.length === 0 ? (
          <p className="text-muted text-center my-3">No classes scheduled for today.</p>
        ) : (
          <div className="d-flex flex-column gap-3">
            {displayClasses.map((cls, idx) => {
              const roomText = cls.room || `Room ${201 + idx}`;
              const countText = cls.studentsCount ? `${cls.studentsCount} Students` : `${15 + idx * 3} Students`;
              const statusText = cls.status || "Upcoming";
              const isAttendancePending = cls.attendanceTaken === false;

              const badgeColorClass =
                idx === 0
                  ? "bg-success-subtle text-success border-success-subtle"
                  : "bg-secondary-subtle text-secondary border-secondary-subtle";

              return (
                <div
                  key={cls.id}
                  className="p-3 rounded-3 border bg-white shadow-xs d-flex flex-column gap-2"
                >
                  <div className="d-flex align-items-center justify-content-between">
                    <span className={`badge border rounded-pill px-2.5 py-1 small fw-medium ${badgeColorClass}`}>
                      {statusText}
                    </span>
                    <span className="fw-semibold text-primary small">
                      {cls.timePeriod}
                    </span>
                  </div>

                  <div>
                    <h6 className="mb-1 fw-bold text-dark">{cls.className}</h6>
                    <span className="text-muted small">
                      {roomText} • {countText}
                    </span>
                  </div>

                  <div className="pt-2 border-top d-flex align-items-center">
                    {isAttendancePending ? (
                      <Link
                        to={`/teacher/classes/${cls.id}/attendance`}
                        className="text-decoration-none text-primary fw-medium small d-inline-flex align-items-center gap-1.5"
                      >
                        <i className="bi bi-clipboard-check" />
                        <span>Take Attendance</span>
                      </Link>
                    ) : (
                      <Link
                        to={`/teacher/classes/${cls.id}`}
                        className="text-decoration-none text-secondary fw-medium small d-inline-flex align-items-center gap-1.5"
                      >
                        <i className="bi bi-people" />
                        <span>View Class</span>
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default TodayClassesSection;
