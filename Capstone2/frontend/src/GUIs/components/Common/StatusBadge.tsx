interface StatusBadgeProps {
  status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  let className = "";

  switch (status) {
    case "Ongoing":
      className = "schedule-status schedule-ongoing";
      break;
    case "Upcoming":
      className = "schedule-status schedule-upcoming";
      break;
    // Notification statuses
    case "Draft":
      className = "notification-status status-draft";
      break;

    case "Scheduled":
      className = "notification-status status-scheduled";
      break;

    case "Sent":
      className = "notification-status status-sent";
      break;

    case "Cancelled":
      className = "notification-status status-cancelled";
      break;

    // Monitoring statuses
    case "Good":
      className = "monitoring-status monitoring-good";
      break;

    case "Needs Attention":
      className = "monitoring-status monitoring-attention";
      break;

    case "Critical":
      className = "monitoring-status monitoring-critical";
      break;

    // Priority badges
    case "Medium":
      className = "priority-badge priority-medium";
      break;
    case "High":
      className = "priority-badge priority-high";
      break;

    case "Low":
      className = "priority-badge priority-low";
      break;

    default:
      className = "notification-status";
      break;
  }

  return <span className={className}>{status}</span>;
}
