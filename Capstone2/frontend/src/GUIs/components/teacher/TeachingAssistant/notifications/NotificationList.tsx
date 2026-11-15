import React from "react";
import type { TeachingNotificationDto } from "../../../../../BLL/models/teaching/TeachingNotificationDto";
import type { NotificationDto } from "../../../../../BLL/models/NotificationDto";

export interface NotificationListProps {
  notifications?: Array<TeachingNotificationDto | NotificationDto>;
  onMarkItemAsRead?: (id: number) => void;
}

export default function NotificationList({
  notifications = [],
  onMarkItemAsRead,
}: NotificationListProps) {
  const getInitials = (name?: string) => {
    if (!name) return "TA";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="p-0">
      <div className="list-group list-group-flush">
        {notifications.length > 0 ? (
          notifications.map((item: any, idx) => {
            const isRead = item.isRead ?? false;
            const timeAgo = item.timeAgo || (item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "Just now");
            const sender = item.sender || item.userName || "EduTrack System";
            const initials = item.initials || getInitials(sender);
            const bgClass = item.initialsBgClass || "bg-info-subtle";
            const colorClass = item.initialsColorClass || "text-info";
            const notifId = item.notificationId ?? item.id ?? idx;

            return (
              <div
                key={notifId}
                className={`list-group-item p-3 d-flex align-items-start gap-3 border-bottom transition-all ${
                  isRead ? "bg-white" : "bg-light-subtle"
                }`.trim()}
                style={{ cursor: !isRead && onMarkItemAsRead ? "pointer" : "default" }}
                onClick={() => {
                  if (!isRead && onMarkItemAsRead) {
                    onMarkItemAsRead(notifId);
                  }
                }}
              >
                <span
                  className={`ta-avatar-initials ${bgClass} ${colorClass} fw-bold flex-shrink-0 rounded-circle d-flex align-items-center justify-content-center`}
                  style={{ width: 44, height: 44, fontSize: 14 }}
                >
                  {initials}
                </span>

                <div className="flex-grow-1 min-w-0">
                  <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-1">
                    <div className="d-flex align-items-center gap-2">
                      <span className="fw-bold text-dark small">{sender}</span>
                      {item.className && (
                        <span className="badge bg-secondary-subtle text-secondary small">{item.className}</span>
                      )}
                      {!isRead && (
                        <span className="badge bg-danger rounded-pill px-2">New</span>
                      )}
                    </div>
                    <small className="text-muted">
                      <i className="bi bi-clock me-1" />
                      {timeAgo}
                    </small>
                  </div>
                  <h6 className="mb-1 text-dark fw-semibold">{item.title}</h6>
                  <p className="text-muted small mb-0">{item.content || item.description}</p>
                </div>

                {!isRead && onMarkItemAsRead && (
                  <button
                    type="button"
                    className="btn btn-sm btn-link text-primary p-0 text-decoration-none flex-shrink-0"
                    title="Mark as read"
                    onClick={(e) => {
                      e.stopPropagation();
                      onMarkItemAsRead(notifId);
                    }}
                  >
                    <i className="bi bi-check-circle fs-5" />
                  </button>
                )}
              </div>
            );
          })
        ) : (
          <div className="p-5 text-center text-muted">
            <i className="bi bi-bell-slash fs-1 d-block mb-2 text-secondary opacity-50" />
            <h6 className="fw-semibold">No notifications</h6>
            <small>You have caught up with all notifications or no notifications match the filter.</small>
          </div>
        )}
      </div>
    </div>
  );
}
