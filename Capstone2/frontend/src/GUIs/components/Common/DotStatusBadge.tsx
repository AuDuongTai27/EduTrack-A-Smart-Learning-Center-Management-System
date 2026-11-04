interface DotStatusBadgeProps {
  status: string;
}

export default function DotStatusBadge({ status }: DotStatusBadgeProps) {
  const normalized = (status || "").trim().toLowerCase();
  let className = "";
  let displayText = status;

  switch (normalized) {
    // Common Statuses
    case "active":
      className = "status-badge status-active";
      displayText = status === "active" ? "Active" : status;
      break;

    case "inactive":
      className = "status-badge status-inactive";
      displayText = status === "inactive" ? "Inactive" : status;
      break;

    case "on hold":
    case "locked":
      className = "status-badge status-locked";
      break;

    // Tuition Statuses
    case "paid":
      className = "tuition-status tuition-paid";
      displayText = status === "paid" ? "Paid" : status;
      break;

    case "partially paid":
      className = "tuition-status tuition-partial";
      break;

    case "unpaid":
      className = "tuition-status tuition-unpaid";
      displayText = status === "unpaid" ? "Unpaid" : status;
      break;

    case "overdue":
      className = "tuition-status tuition-overdue";
      displayText = status === "overdue" ? "Overdue" : status;
      break;

    case "pending adjustment":
      className = "tuition-status tuition-pending";
      break;

    // Approval Statuses
    case "chờ phê duyệt":
    case "chưa xem xét giải quyết":
    case "waiting":
      className = "approval-status approval-waiting";
      break;

    case "pending":
    case "đang xem xét giải quyết":
    case "chờ duyệt":
      className = "approval-status approval-pending";
      displayText = status === "pending" ? "Pending" : status;
      break;

    case "draft":
      className = "approval-status approval-draft";
      displayText = status === "draft" ? "Draft" : status;
      break;

    case "approved":
    case "đã duyệt":
    case "đã phê duyệt":
      className = "approval-status approval-approved";
      displayText = status === "approved" ? "Approved" : status;
      break;

    case "rejected":
    case "từ chối":
    case "đã từ chối":
      className = "approval-status approval-rejected";
      displayText = status === "rejected" ? "Rejected" : status;
      break;

    case "cancelled":
      className = "approval-status approval-cancelled";
      displayText = status === "cancelled" ? "Cancelled" : status;
      break;

    default:
      className = "status-badge";
      break;
  }

  return (
    <span className={className}>
      <span />
      {displayText}
    </span>
  );
}
