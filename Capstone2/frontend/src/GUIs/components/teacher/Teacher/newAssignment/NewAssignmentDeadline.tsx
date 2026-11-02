import React from "react";

interface NewAssignmentDeadlineProps {
  value: string;
  onChange: (val: string) => void;
  error?: string;
  disabled?: boolean;
}

export default function NewAssignmentDeadline({
  value,
  onChange,
  error,
  disabled = false,
}: NewAssignmentDeadlineProps) {
  return (
    <div className="col-md-4">
      <label
        htmlFor="assignmentDeadline"
        className="form-label fw-semibold text-dark"
      >
        Deadline <span className="text-danger">*</span>
      </label>
      <input
        type="datetime-local"
        className={`form-control ${error ? "is-invalid" : ""}`}
        id="assignmentDeadline"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        required
      />
      {error && <div className="invalid-feedback">{error}</div>}
    </div>
  );
}
