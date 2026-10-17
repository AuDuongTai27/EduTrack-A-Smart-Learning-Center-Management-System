import PageHeader from "../../../components/Common/PageHeader";
import {
  NotificationList,
  NotificationPagination,
  NotificationsHeader,
} from "../../../components/teacher/TeachingAssistant/notifications";

export default function TeachingAssistantNotificationPage() {
  return (
    <>
      {/* Breadcrumb & Page Title */}
      <PageHeader
        title="Notifications"
        breadcrumbItems={[
          { label: "Dashboard", path: "/teaching-assistant/dashboard" },
          { label: "Notifications" },
        ]}
      />

      {/* Notification */}
      <div className="card class-list-card border-0 mb-4">
        {/* Card Header */}
        <NotificationsHeader />
        {/* Notification List Body */}
        <NotificationList />
        {/* Footer Pagination */}
        <NotificationPagination />
      </div>
    </>
  );
}
