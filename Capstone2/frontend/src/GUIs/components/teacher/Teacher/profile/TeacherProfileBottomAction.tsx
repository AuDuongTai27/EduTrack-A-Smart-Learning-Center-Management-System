import React from "react";

export interface ProfileBottomActionProps {
  onEdit?: () => void;
  onChangePassword?: () => void;
}

export function TeacherProfileBottomAction({
  onEdit,
  onChangePassword,
}: ProfileBottomActionProps) {
  return (
    <div className="d-flex justify-content-end align-items-center gap-2 pt-3 border-top">
      {onChangePassword && (
        <button
          type="button"
          className="btn btn-outline-primary d-inline-flex align-items-center gap-2 px-3 py-2"
          onClick={onChangePassword}
        >
          <i className="bi bi-shield-lock" /> Đổi mật khẩu
        </button>
      )}
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
