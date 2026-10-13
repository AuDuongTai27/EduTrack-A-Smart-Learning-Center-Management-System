import React from 'react';

export interface SubmittedFileCardProps {
  fileName: string;
  meta: string;
  onEdit: () => void;
  onDelete: () => void;
}

export function SubmittedFileCard({
  fileName,
  meta,
  onEdit,
  onDelete,
}: SubmittedFileCardProps) {
  return (
    <div id="viewSubmitted">
      <div className="submitted-card">
        <div className="submitted-file-row">
          <div className="submitted-icon-box">
            <i className="bi bi-file-earmark-check"></i>
          </div>
          <div>
            <div className="submitted-filename" id="submittedFileName">
              {fileName}
            </div>
            <div className="submitted-meta">{meta}</div>
          </div>
        </div>
        <div className="d-flex gap-2">
          <button
            type="button"
            className="btn-asg-action btn-asg-edit"
            id="btnEditSubmission"
            onClick={onEdit}
          >
            <i className="bi bi-pencil-square"></i>
            <span>Chỉnh sửa</span>
          </button>
          <button
            type="button"
            className="btn-asg-action btn-asg-delete"
            id="btnDeleteSubmission"
            onClick={onDelete}
          >
            <i className="bi bi-trash3"></i>
            <span>Xóa bài nộp</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubmittedFileCard;
