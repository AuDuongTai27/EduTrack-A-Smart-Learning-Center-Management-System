import React from "react";

interface NewAssignmentDescriptionProps {
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
}

export default function NewAssignmentDescription({
  value,
  onChange,
  disabled = false,
}: NewAssignmentDescriptionProps) {
  return (
    <div className="col-12 mt-3">
      <label
        htmlFor="assignmentDescription"
        className="form-label fw-semibold text-dark"
      >
        Description &amp; Instructions
      </label>
      <textarea
        className="form-control"
        id="assignmentDescription"
        rows={4}
        placeholder="Provide instructions, rubric or topics for this assignment..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      />
    </div>
  );
}
