import React, { useRef, useState } from 'react';

export interface AssignmentDropzoneProps {
  onSubmit: (file: File | null) => void;
}

export function AssignmentDropzone({ onSubmit }: AssignmentDropzoneProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleRemoveFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = () => {
    onSubmit(selectedFile);
    setSelectedFile(null);
  };

  return (
    <div id="viewNotSubmitted">
      <div
        className={`upload-dropzone ${isDragOver ? 'dragover' : ''}`}
        id="uploadDropzone"
        onClick={() => fileInputRef.current?.click()}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="upload-icon-circle">
          <i className="bi bi-cloud-arrow-up"></i>
        </div>
        <div>
          <div className="upload-text-main">
            Kéo thả file vào đây hoặc <span className="upload-link">nhấn để chọn file</span>
          </div>
          <div className="upload-text-sub">
            PDF, DOCX, JPG, PNG &mdash; Tối đa 50 MB
          </div>
        </div>
        <input
          type="file"
          ref={fileInputRef}
          id="fileInput"
          className="d-none"
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xlsx"
          onChange={handleFileChange}
        />
      </div>

      {/* Selected File Preview */}
      {selectedFile && (
        <div className="selected-file-preview" id="selectedFilePreview">
          <div className="d-flex align-items-center gap-2">
            <i className="bi bi-file-earmark-check text-success fs-5"></i>
            <span className="fw-semibold text-dark fs-6" id="selectedFileName">
              {selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
            </span>
          </div>
          <button
            type="button"
            className="btn btn-sm btn-outline-danger py-1 px-2"
            id="btnRemoveSelectedFile"
            onClick={handleRemoveFile}
          >
            <i className="bi bi-x-lg"></i>
          </button>
        </div>
      )}

      <button
        type="button"
        className="btn-submit-asg"
        id="btnSubmitAssignment"
        onClick={handleSubmit}
      >
        Nộp bài
      </button>
    </div>
  );
};

export default AssignmentDropzone;
