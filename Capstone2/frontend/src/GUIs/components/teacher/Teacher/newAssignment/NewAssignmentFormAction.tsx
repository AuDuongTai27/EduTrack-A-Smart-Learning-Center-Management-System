import React from "react";
import { Link } from "react-router-dom";

interface NewAssignmentFormActionProps {
  classId: string | number;
  submitting?: boolean;
}

export default function NewAssignmentFormAction({
  classId,
  submitting = false,
}: NewAssignmentFormActionProps) {
  return (
    <div className="d-flex align-items-center justify-content-end gap-2 mt-4 pt-3 border-top">
      <Link
        to={`/teacher/classes/${classId}`}
        className="btn btn-outline-secondary btn-sm"
      >
        Cancel
      </Link>
      <button
        type="submit"
        disabled={submitting}
        className="btn btn-primary btn-sm d-inline-flex align-items-center gap-1"
      >
        {submitting ? (
          <>
            <span className="spinner-border spinner-border-sm" role="status" />
            <span>Saving Assignment...</span>
          </>
        ) : (
          <>
            <i className="bi bi-check-lg" />
            <span>Save Assignment</span>
          </>
        )}
      </button>
    </div>
  );
}
