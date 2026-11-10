import React from "react";
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

export function TodayClassesSection({
  classes = [],
}: TodayClassesSectionProps = {}) {
  // Lọc chỉ giữ các lớp chưa hoàn thành trong ngày (bỏ lớp completed hoặc đã quá giờ kết thúc)
  const activeClasses = classes
    .filter((cls) => {
      if (cls.status?.toLowerCase() === "completed") return false;
      if (cls.startTime && cls.endTime) {
        const now = new Date();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        const [endH, endM] = cls.endTime.split(":").map(Number);
        const endMinutes = (endH || 0) * 60 + (endM || 0);
        if (currentMinutes >= endMinutes) return false;
      }
      return true;
    })
    .sort((a, b) => {
      // Ưu tiên lớp Ongoing lên đầu tiên, sau đó đến các lớp Upcoming theo giờ bắt đầu
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      const isOngoing = (cls: TodayClassItem) => {
        if (cls.status?.toLowerCase() === "ongoing" || cls.status?.toLowerCase() === "in progress") return true;
        if (cls.startTime && cls.endTime) {
          const [startH, startM] = cls.startTime.split(":").map(Number);
          const [endH, endM] = cls.endTime.split(":").map(Number);
          const startMin = (startH || 0) * 60 + (startM || 0);
          const endMin = (endH || 0) * 60 + (endM || 0);
          return currentMinutes >= startMin && currentMinutes < endMin;
        }
        return false;
      };

      const aOngoing = isOngoing(a);
      const bOngoing = isOngoing(b);

      if (aOngoing && !bOngoing) return -1;
      if (!aOngoing && bOngoing) return 1;
      return (a.startTime || "").localeCompare(b.startTime || "");
    });

  const displayClasses = activeClasses;
  const maxDisplay = 3;
  const displayedClasses = displayClasses.slice(0, maxDisplay);
  const remainingCount = displayClasses.length - maxDisplay;

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
          to="/teaching-assistant/schedule"
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
            {displayedClasses.map((cls, idx) => {
              const roomText = cls.room || `Room ${201 + idx}`;
              const countText = `${cls.studentsCount ?? 0} Students`;

              // Xác định trạng thái Ongoing nếu thời gian hiện tại nằm trong khoảng startTime - endTime
              let isOngoing = false;
              if (cls.status?.toLowerCase() === "ongoing" || cls.status?.toLowerCase() === "in progress") {
                isOngoing = true;
              }

              if (cls.startTime && cls.endTime) {
                const now = new Date();
                const currentMinutes = now.getHours() * 60 + now.getMinutes();
                const [startH, startM] = cls.startTime.split(":").map(Number);
                const [endH, endM] = cls.endTime.split(":").map(Number);
                const startMinutes = (startH || 0) * 60 + (startM || 0);
                const endMinutes = (endH || 0) * 60 + (endM || 0);

                if (currentMinutes >= startMinutes && currentMinutes < endMinutes) {
                  isOngoing = true;
                } else {
                  isOngoing = false;
                }
              }

              const statusText = isOngoing ? "Ongoing" : "Upcoming";
              const badgeColorClass = isOngoing
                ? "bg-primary-subtle text-primary border-primary-subtle"
                : "bg-success-subtle text-success border-success-subtle";

              return (
                <div
                  key={cls.sessionId ?? cls.id}
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
                    {isOngoing ? (
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
                        className="text-decoration-none text-secondary fw-medium small d-inline-flex align-items-center gap-1.5"
                      >
                        <i className="bi bi-arrow-right-circle" />
                        <span>View Class</span>
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}

            {remainingCount > 0 && (
              <div className="text-center pt-2 mt-auto border-top">
                <span
                  className="fst-italic small select-none"
                  style={{ color: "#94a3b8", fontSize: "0.82rem" }}
                >
                  *Còn {remainingCount} lớp học khác trong ngày...*
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default TodayClassesSection;
