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
    case "hoạt động":
    case "đang hoạt động":
      className = "status-badge status-active";
      displayText = "Active";
      break;

    case "inactive":
    case "không hoạt động":
    case "ngừng hoạt động":
      className = "status-badge status-inactive";
      displayText = "Inactive";
      break;

    case "on hold":
      className = "status-badge status-locked";
      displayText = "On Hold";
      break;

    case "locked":
    case "khóa":
    case "đã khóa":
      className = "status-badge status-locked";
      displayText = "Locked";
      break;

    case "studying":
    case "đang học":
      className = "status-badge status-active";
      displayText = "Studying";
      break;

    case "completed":
    case "hoàn thành":
    case "đã hoàn thành":
      className = "status-badge status-active";
      displayText = "Completed";
      break;

    case "scheduled":
    case "đã xếp lịch":
      className = "status-badge status-scheduled";
      displayText = "Scheduled";
      break;

    // Tuition Statuses
    case "paid":
    case "đã đóng":
    case "đã thanh toán":
      className = "tuition-status tuition-paid";
      displayText = "Paid";
      break;

    case "partially paid":
    case "partial":
    case "đóng một phần":
      className = "tuition-status tuition-partial";
      displayText = "Partially Paid";
      break;

    case "unpaid":
    case "chưa đóng":
    case "chưa thanh toán":
      className = "tuition-status tuition-unpaid";
      displayText = "Unpaid";
      break;

    case "overdue":
    case "quá hạn":
    case "cần nộp":
      className = "tuition-status tuition-overdue";
      displayText = "Overdue";
      break;

    case "pending adjustment":
      className = "tuition-status tuition-pending";
      displayText = "Pending Adjustment";
      break;

    // Approval Statuses
    case "chờ phê duyệt":
    case "chưa xem xét giải quyết":
    case "waiting":
      className = "approval-status approval-waiting";
      displayText = "Waiting";
      break;

    case "pending":
    case "đang xem xét giải quyết":
    case "chờ duyệt":
    case "đang chờ":
      className = "approval-status approval-pending";
      displayText = "Pending";
      break;

    case "draft":
    case "bản nháp":
      className = "approval-status approval-draft";
      displayText = "Draft";
      break;

    case "approved":
    case "đã duyệt":
    case "đã phê duyệt":
      className = "approval-status approval-approved";
      displayText = "Approved";
      break;

    case "rejected":
    case "từ chối":
    case "đã từ chối":
      className = "approval-status approval-rejected";
      displayText = "Rejected";
      break;

    case "cancelled":
    case "đã hủy":
      className = "approval-status approval-cancelled";
      displayText = "Cancelled";
      break;

    case "chưa có dữ liệu":
    case "trống":
      className = "status-badge";
      displayText = "No data available";
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
