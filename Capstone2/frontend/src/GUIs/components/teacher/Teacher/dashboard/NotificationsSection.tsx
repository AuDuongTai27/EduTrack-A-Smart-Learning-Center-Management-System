import React from "react";
import { Link } from "react-router-dom";
import {
    type TeacherDashboardNotification,
    MOCK_TEACHER_NOTIFICATIONS,
} from "../../notificationsData";
export type { TeacherDashboardNotification };
export interface NotificationsSectionProps {
    /** List of notifications to display */
    notifications?: TeacherDashboardNotification[];
    /** Destination for the "View All" link */
    viewAllUrl?: string;
}
export function NotificationsSection({
    notifications = MOCK_TEACHER_NOTIFICATIONS,
    viewAllUrl = "/teacher/notifications",
}: NotificationsSectionProps = {}) {
    return (
        <div className="card dashboard-card flex-fill d-flex flex-column">
            <div className="card-header dashboard-card-header d-flex align-items-center justify-content-between">
                <div>
                    <h5 className="mb-1">Notifications</h5>
                    <small className="text-muted">Latest announcements and updates</small>
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
                        {notifications.map((item, idx) => (
                            <div key={item.id ?? idx} className="notice-item">
                                <div
                                    className={`notice-icon ${item.iconBgClass ?? "bg-primary-subtle"} ${item.iconColorClass ?? "text-primary"}`}
                                >
                                    <i className={item.icon ?? "bi bi-bell"} />
                                </div>
                                <div className="notice-content">
                                    <h6 className="mb-1">{item.title}</h6>
                                    <p className="mb-0 text-muted">
                                        <i className="bi bi-calendar3 me-1" />
                                        Added on : {item.addedOn}
                                    </p>
                                </div>
                                {item.daysAgo && <span className="notice-day">{item.daysAgo}</span>}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
export default NotificationsSection;