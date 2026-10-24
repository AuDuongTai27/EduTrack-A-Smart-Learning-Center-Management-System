import { MOCK_TEACHER_NOTIFICATIONS, type TeacherNotification } from "../../notificationsData";
import type { NotificationDto } from "../../../../../BLL/models/NotificationDto";

export interface NotificationListProps {
  notifications?: NotificationDto[];
}

export default function NotificationList({ notifications = [] }: NotificationListProps) {
  const getInitials = (name?: string) => {
    if (!name) return "NT";
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
          notifications.map((item, idx) => {
            const isRead = item.isRead;
            const timeAgo = item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "Just now";
            const sender = item.userName || "Hệ thống EduTrack";

            return (
              <div
                key={item.notificationId || idx}
                className={`list-group-item p-3 d-flex align-items-start gap-3 border-bottom ${isRead ? "bg-light-subtle" : ""}`.trim()}
              >
                <span
                  className="ta-avatar-initials bg-primary-subtle text-primary fw-bold flex-shrink-0"
                  style={{ width: 42, height: 42, fontSize: 14 }}
                >
                  {getInitials(sender)}
                </span>

                <div className="flex-grow-1 min-w-0">
                  <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-1">
                    <div className="d-flex align-items-center gap-2">
                      <span className="fw-bold text-dark small">{sender}</span>
                      {!isRead && <span className="badge bg-danger">New!</span>}
                    </div>
                    <small className="text-muted">
                      <i className="bi bi-clock me-1" />
                      {timeAgo}
                    </small>
                  </div>
                  <h6 className="mb-1 text-dark fw-semibold">{item.title}</h6>
                  <p className="text-muted small mb-0">{item.content}</p>
                </div>
              </div>
            );
          })
        ) : (
          MOCK_TEACHER_NOTIFICATIONS.map((item: TeacherNotification) => {
            const borderClass = item.hasBottomBorder ?? true ? "border-bottom" : "";
            const readClass = item.isRead ? "bg-light-subtle" : "";

            return (
              <div
                key={item.id}
                className={`list-group-item p-3 d-flex align-items-start gap-3 ${borderClass} ${readClass}`.trim()}
              >
                {item.avatarUrl ? (
                  <img
                    src={item.avatarUrl}
                    className="rounded-circle flex-shrink-0"
                    width={42}
                    height={42}
                    alt={item.sender}
                  />
                ) : (
                  <span
                    className={`ta-avatar-initials ${item.initialsBgClass ?? ""} ${item.initialsColorClass ?? ""} fw-bold flex-shrink-0`.trim()}
                    style={{ width: 42, height: 42, fontSize: 14 }}
                  >
                    {item.initials}
                  </span>
                )}

                <div className="flex-grow-1 min-w-0">
                  <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-1">
                    <div className="d-flex align-items-center gap-2">
                      <span className="fw-bold text-dark small">{item.sender}</span>
                      {item.isNew && <span className="badge bg-danger">New!</span>}
                    </div>
                    <small className="text-muted">
                      <i className="bi bi-clock me-1" />
                      {item.timeAgo}
                    </small>
                  </div>
                  <h6 className="mb-1 text-dark fw-semibold">[FE-Mock] {item.title}</h6>
                  <p className="text-muted small mb-0">{item.description}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
