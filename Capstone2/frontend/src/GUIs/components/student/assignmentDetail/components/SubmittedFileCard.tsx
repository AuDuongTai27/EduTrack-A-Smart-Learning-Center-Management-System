import React from 'react';
import type { StudentSubmissionDetailApiDto } from '../../../../../api/learningApi';

export interface SubmittedFileCardProps {
  fileName: string;
  meta: string;
  submission?: StudentSubmissionDetailApiDto | null;
  onEdit: () => void;
  onDelete: () => void;
}

export function SubmittedFileCard({
  fileName,
  meta,
  submission,
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
            <span>Resubmit File</span>
          </button>
          <button
            type="button"
            className="btn-asg-action btn-asg-delete"
            id="btnDeleteSubmission"
            onClick={onDelete}
          >
            <i className="bi bi-trash3"></i>
            <span>Delete Submission</span>
          </button>
        </div>
      </div>

      {/* Teacher & AI Grading Results */}
      {submission && (submission.score !== null || submission.aiScore !== null || submission.feedback || submission.aiSummary) && (
        <div className="mt-3 d-flex flex-column gap-3">
          {/* 1. Official Teacher Grading Result */}
          {submission.score !== null && submission.score !== undefined && (
            <div
              className="p-3 rounded-4 border"
              style={{ backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' }}
            >
              <div className="d-flex align-items-center justify-content-between mb-1">
                <span className="fw-bold text-success d-flex align-items-center gap-2">
                  <i className="bi bi-patch-check-fill"></i>
                  Official Evaluation from Teacher
                </span>
                <span className="badge bg-success text-white px-3 py-1.5 rounded-pill fs-6">
                  {submission.score} / 10 pts
                </span>
              </div>
              {submission.feedback && (
                <p className="mb-0 text-dark small mt-1">
                  <strong>Teacher Feedback:</strong> {submission.feedback}
                </p>
              )}
            </div>
          )}

          {/* 2. Automated AI Grading (AI Grading Assistant) */}
          {(submission.aiScore !== null && submission.aiScore !== undefined) && (
            <div
              className="p-3 rounded-4 border"
              style={{ backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }}
            >
              <div className="d-flex align-items-center justify-content-between mb-1">
                <span className="fw-bold text-primary d-flex align-items-center gap-2">
                  <i className="bi bi-robot"></i>
                  AI Assistant Preliminary Assessment & Score
                </span>
                <span className="badge bg-primary text-white px-3 py-1.5 rounded-pill">
                  Suggested AI Score: {submission.aiScore} / 10
                </span>
              </div>
              {submission.aiSummary && (
                <p className="mb-0 text-secondary small mt-1">
                  {submission.aiSummary}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SubmittedFileCard;
