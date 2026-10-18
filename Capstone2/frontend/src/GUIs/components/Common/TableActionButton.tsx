/*
Usage:
<TableActionButton action="Record Payment" />
<TableActionButton action="View / Edit" target="#userDetailModal" />
<TableActionButton action="More" />

action = button type
target = modal id if needed
*/

interface TableActionButtonProps {
  action:
    | "View"
    | "View / Edit"
    | "Change Status"
    | "Record Payment"
    | "Manage Subjects"
    | "View Details"
    | "View Request"
    | "Submit Request"
    | "Withdraw Request"
    | "Delete Draft"
    | "More";

  target?: string;
}

export default function TableActionButton({
  action,
  target,
}: TableActionButtonProps) {
  let icon = "";
  let extraClass = "";
  let toggle: string | undefined;

  switch (action) {
    case "View":
    case "View Details":
    case "View Request":
      icon = "bi-eye";
      toggle = target ? "modal" : undefined;
      break;

    case "View / Edit":
      icon = "bi-pencil-square";
      toggle = target ? "modal" : undefined;
      break;

    case "Change Status":
      icon = "bi-arrow-repeat";
      toggle = target ? "modal" : undefined;
      break;

    case "Record Payment":
      icon = "bi-cash-stack";
      break;

    case "Manage Subjects":
      icon = "bi-journals";
      break;

    case "Submit Request":
      icon = "bi-send";
      break;

    case "Withdraw Request":
      icon = "bi-arrow-counterclockwise";
      break;

    case "Delete Draft":
      icon = "bi-trash";
      extraClass = "text-danger";
      break;

    case "More":
      icon = "bi-three-dots-vertical";
      toggle = "dropdown";
      break;
  }

  return (
    <button
      type="button"
      className={`btn table-action-btn ${extraClass}`.trim()}
      title={action}
      data-bs-toggle={toggle}
      data-bs-target={target}
      aria-expanded={action === "More" ? false : undefined}
    >
      <i className={`bi ${icon}`} />
    </button>
  );
}
