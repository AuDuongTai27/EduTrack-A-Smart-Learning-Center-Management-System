interface StatusBadgeProps {
  status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const normalized = (status || "").trim().toLowerCase();
  let className = "";
  let displayText = status;

  switch (normalized) {
    case "ongoing":
      className = "schedule-status schedule-ongoing";
      displayText = status === "ongoing" ? "Ongoing" : status;
      break;
    case "upcoming":
      className = "schedule-status schedule-upcoming";
      displayText = status === "upcoming" ? "Upcoming" : status;
      break;

    // Notification statuses
    case "draft":
      className = "notification-status status-draft";
      displayText = status === "draft" ? "Draft" : status;
      break;

    case "scheduled":
      className = "notification-status status-scheduled";
      displayText = status === "scheduled" ? "Scheduled" : status;
      break;

    case "sent":
      className = "notification-status status-sent";
      displayText = status === "sent" ? "Sent" : status;
      break;

    case "cancelled":
      className = "notification-status status-cancelled";
      displayText = status === "cancelled" ? "Cancelled" : status;
      break;

    // Monitoring statuses
    case "good":
      className = "monitoring-status monitoring-good";
      break;

    case "needs attention":
      className = "monitoring-status monitoring-attention";
      break;

    case "critical":
      className = "monitoring-status monitoring-critical";
      break;

    // Priority badges
    case "medium":
      className = "priority-badge priority-medium";
      displayText = status === "medium" ? "Medium" : status;
      break;
    case "high":
      className = "priority-badge priority-high";
      displayText = status === "high" ? "High" : status;
      break;

    case "low":
      className = "priority-badge priority-low";
      displayText = status === "low" ? "Low" : status;
      break;

    default:
      className = "notification-status";
      break;
  }

  return <span className={className}>{displayText}</span>;
}
