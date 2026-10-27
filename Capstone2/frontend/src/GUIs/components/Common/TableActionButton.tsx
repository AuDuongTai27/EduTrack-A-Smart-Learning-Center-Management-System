import React from "react";

/*
Usage:
<TableActionButton action="View" onClick={() => handleView(item)} />
<TableActionButton action="Edit" onClick={() => handleEdit(item)} />
<TableActionButton action="Delete" onClick={() => handleDelete(item)} />
<TableActionButton action="Link" onClick={() => handleLink(item)} title="Gán liên kết" />
<TableActionButton action="Lock" onClick={() => handleLock(item)} />
<TableActionButton action="Unlock" onClick={() => handleUnlock(item)} />
<TableActionButton action="View / Edit" target="#userDetailModal" />
<TableActionButton action="More" />
*/

export interface TableActionButtonProps {
  action:
    | "View"
    | "View / Edit"
    | "Edit"
    | "Delete"
    | "Delete Draft"
    | "Link"
    | "Lock"
    | "Unlock"
    | "Change Status"
    | "Record Payment"
    | "Manage Subjects"
    | "View Details"
    | "View Request"
    | "Submit Request"
    | "Withdraw Request"
    | "More";

  target?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  title?: string;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export default function TableActionButton({
  action,
  target,
  onClick,
  title,
  disabled = false,
  className = "",
  children,
}: TableActionButtonProps) {
  let icon = "";
  let extraClass = "";
  let toggle: string | undefined;

  switch (action) {
    case "View":
    case "View Details":
    case "View Request":
      icon = "bi-eye";
      extraClass = "text-primary";
      toggle = target ? "modal" : undefined;
      break;

    case "Edit":
      icon = "bi-pencil";
      extraClass = "text-secondary";
      toggle = target ? "modal" : undefined;
      break;

    case "View / Edit":
      icon = "bi-pencil-square";
      extraClass = "text-secondary";
      toggle = target ? "modal" : undefined;
      break;

    case "Delete":
    case "Delete Draft":
      icon = "bi-trash";
      extraClass = "text-danger";
      break;

    case "Link":
      icon = "bi-link-45deg";
      extraClass = "text-info";
      break;

    case "Lock":
      icon = "bi-lock";
      extraClass = "text-warning";
      break;

    case "Unlock":
      icon = "bi-unlock";
      extraClass = "text-success";
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

    case "More":
      icon = "bi-three-dots-vertical";
      toggle = "dropdown";
      break;
  }

  const computedTitle = title || action;

  return (
    <button
      type="button"
      className={`btn table-action-btn ${extraClass} ${className}`.trim()}
      title={computedTitle}
      aria-label={computedTitle}
      data-bs-toggle={toggle}
      data-bs-target={target}
      aria-expanded={action === "More" ? false : undefined}
      onClick={onClick}
      disabled={disabled}
    >
      {children ? children : <i className={`bi ${icon}`} />}
    </button>
  );
}
