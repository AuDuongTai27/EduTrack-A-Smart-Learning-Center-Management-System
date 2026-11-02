import React from "react";

export interface ProfileBottomActionProps {
  onEdit?: () => void;
}

export function TeacherProfileBottomAction({ onEdit }: ProfileBottomActionProps) {
  return (
    <div className="d-flex justify-content-end pt-3 border-top">
      <button
        type="button"
        className="btn btn-primary d-inline-flex align-items-center gap-2 px-3 py-2"
        onClick={onEdit}
      >
        <i className="bi bi-pencil-square" /> Chỉnh sửa hồ sơ
      </button>
    </div>
  );
}

export default TeacherProfileBottomAction;
