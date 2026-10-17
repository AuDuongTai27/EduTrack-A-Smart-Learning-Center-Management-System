import {
  MOCK_TEACHER_NOTIFICATIONS,
  type TeacherNotification,
} from "../../notificationsData";

export default function NotificationList() {
  return (
    <div className="p-0">
      <div className="list-group list-group-flush">
        {MOCK_TEACHER_NOTIFICATIONS.map((item: TeacherNotification) => {
          const borderClass =
            (item.hasBottomBorder ?? true) ? "border-bottom" : "";
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
                    <span className="fw-bold text-dark small">
                      {item.sender}
                    </span>
                    {item.isNew && <span className="badge bg-danger">New!</span>}
                  </div>
                  <small className="text-muted">
                    <i className="bi bi-clock me-1" />
                    {item.timeAgo}
                  </small>
                </div>
                <h6 className="mb-1 text-dark fw-semibold">{item.title}</h6>
                <p className="text-muted small mb-0">{item.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
