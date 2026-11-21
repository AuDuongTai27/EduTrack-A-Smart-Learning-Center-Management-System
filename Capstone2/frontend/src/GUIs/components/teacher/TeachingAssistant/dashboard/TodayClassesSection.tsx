import { useEffect, useMemo, useRef } from "react";
import { Link } from "react-router-dom";

export interface TodayClassItem {
  id: string | number;
  sessionId?: number;
  className: string;
  timePeriod: string;
  room?: string;
  studentsCount?: number;
  status?: "Upcoming" | "Ongoing" | "In Progress" | "Completed" | string;
  attendanceTaken?: boolean;
  startTime?: string;
  endTime?: string;
}

export interface TodayClassesSectionProps {
  /** List of classes scheduled for today */
  classes?: TodayClassItem[];
}

type TodayClassStatus = "Completed" | "Ongoing" | "Upcoming";

function resolveClassStatus(cls: TodayClassItem, currentMinutes: number): TodayClassStatus {
  const normalized = cls.status?.toLowerCase();

  if (cls.startTime && cls.endTime) {
    const [startH, startM] = cls.startTime.split(":").map(Number);
    const [endH, endM] = cls.endTime.split(":").map(Number);
    const startMinutes = (startH || 0) * 60 + (startM || 0);
    const endMinutes = (endH || 0) * 60 + (endM || 0);

    if (currentMinutes >= startMinutes && currentMinutes < endMinutes) {
      return "Ongoing";
    }
    if (currentMinutes >= endMinutes || normalized === "completed") {
      return "Completed";
    }
    return "Upcoming";
  }

  if (normalized === "completed") {
    return "Completed";
  }
  if (normalized === "ongoing" || normalized === "in progress") {
    return "Ongoing";
  }
  return "Upcoming";
}

const STATUS_ORDER: Record<TodayClassStatus, number> = {
  Completed: 0,
  Ongoing: 1,
  Upcoming: 2,
};

export function TodayClassesSection({
  classes = [],
}: TodayClassesSectionProps = {}) {
  const listRef = useRef<HTMLDivElement>(null);
  const firstActiveRef = useRef<HTMLDivElement>(null);

  const displayClasses = useMemo(() => {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    return classes
      .map((cls) => ({
        cls,
        resolvedStatus: resolveClassStatus(cls, currentMinutes),
      }))
      .sort((a, b) => {
        const orderDiff = STATUS_ORDER[a.resolvedStatus] - STATUS_ORDER[b.resolvedStatus];
        if (orderDiff !== 0) return orderDiff;
        return (a.cls.startTime || "").localeCompare(b.cls.startTime || "");
      });
  }, [classes]);

  const firstActiveIndex = displayClasses.findIndex(
    (entry) => entry.resolvedStatus === "Ongoing" || entry.resolvedStatus === "Upcoming"
  );

  // Scroll to the first ongoing/upcoming class so completed sessions sit above and remain accessible by scrolling up.
  useEffect(() => {
    const container = listRef.current;
    const firstActive = firstActiveRef.current;
    if (!container || !firstActive) return;
    container.scrollTop = firstActive.offsetTop - container.offsetTop;
  }, [displayClasses, firstActiveIndex]);

  const todayFormatted = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());

  return (
    <div className="card dashboard-card teaching-today-card">
      <div className="card-header dashboard-card-header d-flex align-items-center justify-content-between">
        <div>
          <h5 className="mb-0 fw-bold"><i className="bi bi-calendar-week academy-panel-icon" aria-hidden="true" />Today's Classes</h5>
          <small className="text-muted">{todayFormatted}</small>
        </div>
        <Link
          to="/teaching-assistant/schedule"
          className="dashboard-view-all academy-dashboard-link"
        >
          View Schedule <i className="bi bi-arrow-right" aria-hidden="true" />
        </Link>
      </div>

      <div className="card-body dashboard-card-body p-3">
        {displayClasses.length === 0 ? (
          <div className="teaching-calendar-empty"><i className="bi bi-calendar2-check" aria-hidden="true" /><p className="text-muted text-center my-3">No classes scheduled for today.</p></div>
        ) : (
          <div ref={listRef} className="today-classes-scroll d-flex flex-column gap-3">
            {displayClasses.map(({ cls, resolvedStatus }, idx) => {
              const roomText = cls.room || `Room ${201 + idx}`;
              const countText = `${cls.studentsCount ?? 0} Students`;
              const isCompleted = resolvedStatus === "Completed";
              const isOngoing = resolvedStatus === "Ongoing";

              const badgeColorClass = isCompleted
                ? "bg-secondary-subtle text-secondary border-secondary-subtle"
                : isOngoing
                  ? "bg-primary-subtle text-primary border-primary-subtle"
                  : "bg-success-subtle text-success border-success-subtle";

              return (
                <div
                  key={cls.sessionId ?? cls.id}
                  ref={idx === firstActiveIndex ? firstActiveRef : undefined}
                  className={`p-3 rounded-3 border d-flex flex-column gap-2 today-class-card ${
                    isCompleted
                      ? "today-class-card--completed bg-light"
                      : isOngoing
                        ? "today-class-card--ongoing shadow-sm"
                        : "bg-white shadow-xs"
                  }`}
                >
                  <div className="d-flex align-items-center justify-content-between">
                    <span className={`badge border rounded-pill px-2.5 py-1 small fw-medium ${badgeColorClass}`}>
                      {resolvedStatus}
                    </span>
                    <span className={`fw-semibold small ${isCompleted ? "text-muted" : "text-primary"}`}>
                      {cls.timePeriod}
                    </span>
                  </div>

                  <div>
                    <h6 className={`mb-1 fw-bold ${isCompleted ? "text-secondary" : "text-dark"}`}>
                      {cls.className}
                    </h6>
                    <span className="small text-muted">
                      {roomText} • {countText}
                    </span>
                  </div>

                  <div className="pt-2 border-top d-flex align-items-center">
                    {isOngoing && !cls.attendanceTaken ? (
                      <Link
                        to={cls.sessionId ? `/teaching-assistant/classes/${cls.id}/attendance?sessionId=${cls.sessionId}` : `/teaching-assistant/classes/${cls.id}/attendance`}
                        className="text-decoration-none text-primary fw-medium small d-inline-flex align-items-center gap-1.5"
                      >
                        <i className="bi bi-clipboard-check" />
                        <span>Take Attendance</span>
                      </Link>
                    ) : (
                      <Link
                        to={`/teaching-assistant/classes/${cls.id}`}
                        className={`text-decoration-none fw-medium small d-inline-flex align-items-center gap-1.5 ${
                          isCompleted ? "text-muted" : "text-secondary"
                        }`}
                      >
                        <i className="bi bi-arrow-right-circle" />
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
