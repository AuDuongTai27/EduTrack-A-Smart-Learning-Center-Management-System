import React from "react";

export interface AttendanceSaveBarProps {
  isSaving?: boolean;
  onSave?: () => void;
  backUrl?: string;
  canSave?: boolean;
}

export function AttendanceSaveBar({
  isSaving = false,
  onSave,
  canSave = true,
}: AttendanceSaveBarProps) {
  return (
    <div className="p-3 border-top bg-white d-flex align-items-center justify-content-between flex-wrap gap-2 rounded-bottom">
      <div className="small text-muted">
        <i className="bi bi-info-circle me-1 text-primary" />
        Attendance results will be saved directly to the database and update students' attendance rates.
      </div>
      <div className="d-flex align-items-center gap-2">
        {!canSave ? (
          <button
            type="button"
            className="btn btn-secondary btn-sm px-4 d-inline-flex align-items-center gap-2 shadow-sm opacity-75"
            disabled
            title="Only started sessions can be marked for attendance"
          >
            <i className="bi bi-lock-fill fs-6" />
            <span>Session not started</span>
          </button>
        ) : (
          <button
            type="button"
            className="btn btn-primary btn-sm px-4 d-inline-flex align-items-center gap-2 shadow-sm"
            onClick={onSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <i className="bi bi-check-lg fs-6" />
                <span>Save Session Attendance</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

export default AttendanceSaveBar;
