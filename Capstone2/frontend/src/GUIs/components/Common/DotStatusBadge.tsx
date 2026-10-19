interface DotStatusBadgeProps {
  status: string;
}

export default function DotStatusBadge({ status }: DotStatusBadgeProps) {
  let className = "";

  switch (status) {
    //Common Statuses
    case "Active":
      className = "status-badge status-active";
      break;

    case "Inactive":
      className = "status-badge status-inactive";
      break;

    case "On Hold":
    case "Locked":
      className = "status-badge status-locked";
      break;

    //Tuition Statuses
    case "Paid":
      className = "tuition-status tuition-paid";
      break;

    case "Partially Paid":
      className = "tuition-status tuition-partial";
      break;

    case "Unpaid":
      className = "tuition-status tuition-unpaid";
      break;

    case "Overdue":
      className = "tuition-status tuition-overdue";
      break;

    case "Pending Adjustment":
      className = "tuition-status tuition-pending";
      break;

    //Approval Statuses
    case "Pending":
      className = "approval-status approval-pending";
      break;
    case "Draft":
      className = "approval-status approval-draft";
      break;

    case "Approved":
      className = "approval-status approval-approved";
      break;

    case "Rejected":
      className = "approval-status approval-rejected";
      break;

    case "Cancelled":
      className = "approval-status approval-cancelled";
      break;

    default:
      className = "status-badge";
      break;
  }

  return (
    <span className={className}>
      <span />
      {status}
    </span>
  );
}
