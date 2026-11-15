import React, { useState } from "react";
import teachingDAL from "../../../../../DAL/teachingDAL";

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
  const [fileSizeText, setFileSizeText] = useState<string>("");
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setUploadError(null);
      setUploading(true);

      try {
        const result = await teachingDAL.uploadFile(file);
        setSelectedFileName(file.name);
        setFileSizeText(formatFileSize(result.fileSize || file.size));
        onChange(result.fileUrl);
      } catch (err: any) {
        setUploadError(err?.message || "Error uploading file to server.");
      } finally {
        setUploading(false);
      }
    }
  };

  const handleClear = () => {
    setSelectedFileName("");
    setFileSizeText("");
    setUploadError(null);
    onChange("");
  };

  return (
    <div className="col-12 mt-3">
      <label htmlFor="assignmentAttachment" className="form-label fw-semibold text-dark">
        Attachment File / Reference Material
      </label>
      <div className="input-group mb-2">
        <label
          className={`input-group-text btn btn-outline-secondary cursor-pointer ${
            disabled || uploading ? "disabled" : ""
          }`}
          htmlFor="assignmentFileInput"
        >
          {uploading ? (
            <>
              <span className="spinner-border spinner-border-sm me-1" role="status" />
              <span>Uploading...</span>
            </>
          ) : (
            <>
              <i className="bi bi-paperclip me-1" /> Choose File
            </>
          )}
        </label>
        <input
          type="file"
          id="assignmentFileInput"
          className="d-none"
          disabled={disabled || uploading}
          onChange={handleFileChange}
        />
        <input
          type="text"
          className="form-control"
          id="assignmentAttachment"
          placeholder="e.g. /uploads/teaching/sample.pdf or paste document URL"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled || uploading}
        />
        {value && (
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={handleClear}
            disabled={disabled || uploading}
            title="Clear attachment"
          >
            <i className="bi bi-x-lg" />
          </button>
        )}
      </div>

      {uploadError && (
        <div className="small text-danger d-flex align-items-center gap-1 mb-1">
          <i className="bi bi-exclamation-circle-fill" /> {uploadError}
        </div>
      )}

      {selectedFileName && !uploadError && (
        <div className="small text-success d-flex align-items-center gap-1 mb-1">
          <i className="bi bi-check-circle-fill" /> Uploaded: <strong>{selectedFileName}</strong>
          {fileSizeText && <span className="text-muted">({fileSizeText})</span>}
        </div>
      )}

      <div className="form-text text-muted">
        Supported file formats: PDF, Word (.docx), Excel (.xlsx), PowerPoint (.pptx), ZIP, RAR, Images (max 25 MB).
      </div>
    </div>
  );
}
