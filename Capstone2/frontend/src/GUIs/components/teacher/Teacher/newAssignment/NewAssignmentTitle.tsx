import React from "react";

interface NewAssignmentTitleProps {
  value: string;
  onChange: (val: string) => void;
  error?: string;
  disabled?: boolean;
}

export default function NewAssignmentTitle({
  value,
  onChange,
  error,
  disabled = false,
}: NewAssignmentTitleProps) {
  return (
    <div className="col-md-8">
      <label
        htmlFor="assignmentTitle"
        className="form-label fw-semibold text-dark"
      >
        Assignment Title <span className="text-danger">*</span>
      </label>
      <input
        type="text"
        className={`form-control ${error ? "is-invalid" : ""}`}
        id="assignmentTitle"
        placeholder="e.g. Assignment 4: Momentum & Impulse"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        required
      />
      {error && <div className="invalid-feedback">{error}</div>}
    </div>
  );
}
