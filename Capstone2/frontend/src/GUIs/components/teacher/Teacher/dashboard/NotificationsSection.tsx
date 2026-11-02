import React from "react";
import { Link } from "react-router-dom";
import { type TeacherNotification } from "../../notificationsData";

// Re-export type using the correct interface name
export type { TeacherNotification };

// Keep TeacherDashboardNotification alias for backwards compatibility if needed elsewhere
export type TeacherDashboardNotification = TeacherNotification;

export interface NotificationsSectionProps {
  /** List of notifications to display */
  notifications?: TeacherNotification[];
  /** Destination for the "View All" link */
  viewAllUrl?: string;
}

export function NotificationsSection({
  notifications = [],
  viewAllUrl = "/teacher/notifications",
}: NotificationsSectionProps = {}) {
  // Chỉ lọc và hiển thị thông báo MỚI (chưa đọc)
  const unreadList = (notifications || []).filter((n) => !n.isRead || n.isNew);

  return (
    <div className="card dashboard-card flex-fill d-flex flex-column">
      <div className="card-header dashboard-card-header d-flex align-items-center justify-content-between">
        <div>
          <h5 className="mb-1 d-flex align-items-center gap-2">
            <span>Thông Báo Mới</span>
            {unreadList.length > 0 && (
              <span className="badge bg-danger rounded-pill px-2 py-1 small fw-semibold">
                {unreadList.length} mới
              </span>
            )}
          </h5>
          <small className="text-muted">Các thông báo mới chưa đọc từ trung tâm EduTrack</small>
        </div>
        <Link to={viewAllUrl} className="dashboard-view-all">
          Xem tất cả
        </Link>
      </div>

      <div className="card-body dashboard-card-body d-flex flex-column flex-fill">
        {unreadList.length === 0 ? (
          <div className="text-center my-auto py-4 text-muted">
            <i className="bi bi-check2-circle fs-2 d-block mb-2 text-success" />
            <h6 className="fw-semibold text-dark mb-1">Bạn đã đọc hết thông báo</h6>
            <p className="mb-0 small text-muted">Không có thông báo mới nào chưa đọc vào lúc này.</p>
          </div>
        ) : (
          <div className="notice-list d-flex flex-column flex-fill justify-content-start gap-3">
            {unreadList.map((item, idx) => {
              const timeLabel = item.timeAgo || (item.addedOn ? `Ngày tạo : ${item.addedOn}` : "");

              return (
                <div key={item.id ?? idx} className="notice-item d-flex align-items-start gap-3 p-2 rounded-2 hover-bg-light">
                  {/* Handle Avatar Image, Initials Badge, or Fallback Icon */}
                  {item.avatarUrl ? (
                    <img
                      src={item.avatarUrl}
                      alt={item.sender || item.title}
                      className="rounded-circle flex-shrink-0"
                      width={38}
                      height={38}
                    />
                  ) : item.initials ? (
                    <div
                      className={`notice-icon ${item.initialsBgClass ?? "bg-primary-subtle"} ${item.initialsColorClass ?? "text-primary"} rounded-circle d-flex align-items-center justify-content-center flex-shrink-0`}
                      style={{ width: 38, height: 38 }}
                    >
                      <span className="fw-bold small">{item.initials}</span>
                    </div>
                  ) : (
                    <div
                      className={`notice-icon ${item.iconBgClass ?? "bg-primary-subtle"} ${item.iconColorClass ?? "text-primary"} rounded-circle d-flex align-items-center justify-content-center flex-shrink-0`}
                      style={{ width: 38, height: 38 }}
                    >
                      <i className={item.icon ?? "bi bi-bell"} />
                    </div>
                  )}

                  <div className="notice-content flex-grow-1">
                    <div className="d-flex align-items-center justify-content-between gap-2 mb-1">
                      <h6 className="mb-0 fw-semibold text-dark">{item.title}</h6>
                      <span className="badge bg-danger-subtle text-danger border border-danger-subtle rounded-pill px-2 small">
                        Mới!
                      </span>
                    </div>
                    {item.description && (
                      <p className="mb-1 text-muted small line-clamp-2" style={{ fontSize: "0.85rem" }}>
                        {item.description}
                      </p>
                    )}
                    <div className="d-flex align-items-center gap-2 text-muted small" style={{ fontSize: "0.8rem" }}>
                      {item.sender && <span className="fw-medium text-secondary">{item.sender}</span>}
                      {item.sender && timeLabel && <span>•</span>}
                      {timeLabel && (
                        <span>
                          <i className="bi bi-clock me-1" />
                          {timeLabel}
                        </span>
                      )}
                    </div>
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

export default NotificationsSection;
