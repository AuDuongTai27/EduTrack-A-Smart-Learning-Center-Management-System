import React from "react";

interface NewAssignmentTypeSelectorProps {
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
}

export default function NewAssignmentTypeSelector({
  value,
  onChange,
  disabled = false,
}: NewAssignmentTypeSelectorProps) {
  return (
    <div className="col-12 mt-3">
      <label className="form-label fw-semibold text-dark d-block">
        Assignment Type <span className="text-danger">*</span>
      </label>
      <div className="d-flex align-items-center gap-4 flex-wrap">
        <div className="form-check">
          <input
            className="form-check-input"
            type="radio"
            name="assignmentType"
            id="typeMultipleChoice"
            checked={value === "Multiple Choice Questions"}
            onChange={() => onChange("Multiple Choice Questions")}
            disabled={disabled}
          />
          <label
            className="form-check-label text-dark cursor-pointer fw-medium"
            htmlFor="typeMultipleChoice"
          >
            Multiple Choice Questions
          </label>
        </div>
        <div className="form-check">
          <input
            className="form-check-input"
            type="radio"
            name="assignmentType"
            id="typeWritten"
            checked={value === "Written Assignment"}
            onChange={() => onChange("Written Assignment")}
            disabled={disabled}
          />
          <label
            className="form-check-label text-dark cursor-pointer fw-medium"
            htmlFor="typeWritten"
          >
            Written Assignment
          </label>
        </div>
      </div>
    </div>
  );
}
