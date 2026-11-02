import React from "react";
import { Link } from "react-router-dom";

export interface AttendanceSaveBarProps {
  isSaving?: boolean;
  onSave?: () => void;
  backUrl?: string;
}

export function AttendanceSaveBar({
  isSaving = false,
  onSave,
  backUrl = "/teaching-assistant/classes",
}: AttendanceSaveBarProps) {
  return (
    <div className="p-3 border-top bg-white d-flex align-items-center justify-content-between flex-wrap gap-2 rounded-bottom">
      <div className="small text-muted">
        <i className="bi bi-info-circle me-1 text-primary" />
        Trợ giảng hỗ trợ điểm danh và cập nhật tình hình chuyên cần của buổi học vào hệ thống.
      </div>
      <div className="d-flex align-items-center gap-2">
        <Link to={backUrl} className="btn btn-outline-secondary btn-sm px-3">
          <i className="bi bi-arrow-left me-1" /> Quay lại lớp học
        </Link>
        <button
          type="button"
          className="btn btn-primary btn-sm px-4 d-inline-flex align-items-center gap-2 shadow-sm"
          onClick={onSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
              <span>Đang lưu...</span>
            </>
          ) : (
            <>
              <i className="bi bi-check-lg fs-6" />
              <span>Lưu điểm danh buổi học</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default AttendanceSaveBar;
