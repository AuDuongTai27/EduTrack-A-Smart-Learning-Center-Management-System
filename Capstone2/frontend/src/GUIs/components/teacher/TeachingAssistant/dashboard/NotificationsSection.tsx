import { Link } from "react-router-dom";
import {
  type TeacherNotification,
  MOCK_TEACHER_NOTIFICATIONS,
} from "../../notificationsData";

export interface NotificationsSectionProps {
  /** List of notifications to display */
  notifications?: TeacherNotification[];
  /** Destination for the "View All" link */
  viewAllUrl?: string;
}

export function NotificationsSection({
  notifications = MOCK_TEACHER_NOTIFICATIONS,
  viewAllUrl = "/teaching-assistant/notifications",
}: NotificationsSectionProps = {}) {
  return (
    <div className="card dashboard-card flex-fill d-flex flex-column">
      <div className="card-header dashboard-card-header d-flex align-items-center justify-content-between">
        <div>
          <h5 className="mb-1">Notifications</h5>
          <small className="text-muted">
            Latest announcements and updates
          </small>
        </div>
        <Link to={viewAllUrl} className="dashboard-view-all">
          View All
        </Link>
      </div>

      <div className="card-body dashboard-card-body d-flex flex-column flex-fill">
        {notifications.length === 0 ? (
          <p className="text-muted text-center my-4">No notifications at this time.</p>
        ) : (
          <div className="notice-list d-flex flex-column flex-fill justify-content-between">
            {notifications.map((item, idx) => {
              const timeLabel =
                item.timeAgo || (item.addedOn ? `Added on : ${item.addedOn}` : "");
              const badgeLabel =
                item.daysAgo || (item.isNew ? "New!" : undefined);

              return (
                <div key={item.id ?? idx} className="notice-item">
                  {item.avatarUrl ? (
                    <img
                      src={item.avatarUrl}
                      alt={item.sender || item.title}
                      className="rounded-circle flex-shrink-0"
                      width={36}
                      height={36}
                    />
                  ) : item.initials ? (
                    <div
                      className={`notice-icon ${item.initialsBgClass ?? "bg-primary-subtle"} ${item.initialsColorClass ?? "text-primary"}`}
                    >
                      <span className="fw-bold">{item.initials}</span>
                    </div>
                  ) : (
                    <div
                      className={`notice-icon ${item.iconBgClass ?? "bg-primary-subtle"} ${item.iconColorClass ?? "text-primary"}`}
                    >
                      <i className={item.icon ?? "bi bi-bell"} />
                    </div>
                  )}

                  <div className="notice-content">
                    <h6 className="mb-1">{item.title}</h6>
                    {timeLabel && (
                      <p className="mb-0 text-muted">
                        <i className="bi bi-clock me-1" />
                        {timeLabel}
                      </p>
                    )}
                  </div>

                  {badgeLabel && <span className="notice-day">{badgeLabel}</span>}
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
