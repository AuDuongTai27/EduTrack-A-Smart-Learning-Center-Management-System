import React, { useState } from "react";

interface NewAssignmentAttachmentProps {
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
}

export default function NewAssignmentAttachment({
  value,
  onChange,
  disabled = false,
}: NewAssignmentAttachmentProps) {
  const [selectedFileName, setSelectedFileName] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFileName(file.name);
      onChange(`/uploads/assignments/${file.name}`);
    }
  };

  return (
    <div className="col-12 mt-3">
      <label htmlFor="assignmentAttachment" className="form-label fw-semibold text-dark">
        Attachment File / Reference Material
      </label>
      <div className="input-group mb-2">
        <label
          className={`input-group-text btn btn-outline-secondary cursor-pointer ${disabled ? "disabled" : ""}`}
          htmlFor="assignmentFileInput"
        >
          <i className="bi bi-paperclip me-1" /> Choose File
        </label>
        <input
          type="file"
          id="assignmentFileInput"
          className="d-none"
          disabled={disabled}
          onChange={handleFileChange}
        />
        <input
          type="text"
          className="form-control"
          id="assignmentAttachment"
          placeholder="e.g. /assets/docs/assignment_exercise.pdf or paste document URL"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
        />
      </div>
      {selectedFileName && (
        <div className="small text-success d-flex align-items-center gap-1">
          <i className="bi bi-check-circle-fill" /> Selected file: {selectedFileName}
        </div>
      )}
      <div className="form-text text-muted">
        Attach PDF, Word, or problem set materials for students to download.
      </div>
    </div>
  );
}
