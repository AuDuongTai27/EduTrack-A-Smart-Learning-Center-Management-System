import React from 'react';

export interface FeedbackFormCardProps {
  title: string;
  description: string;
  isSubmitting?: boolean;
  editingCode?: string | null;
  onTitleChange: (val: string) => void;
  onDescriptionChange: (val: string) => void;
  onCancelEdit?: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function FeedbackFormCard({
  title,
  description,
  isSubmitting = false,
  editingCode = null,
  onTitleChange,
  onDescriptionChange,
  onCancelEdit,
  onSubmit,
}: FeedbackFormCardProps) {
  const isEditing = Boolean(editingCode);

  return (
    <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h2 className="h6 fw-bold text-dark mb-0 d-flex align-items-center gap-2">
          <i className={`bi ${isEditing ? 'bi-pencil-fill text-warning' : 'bi-pencil-square text-primary'}`}></i>
          {isEditing ? `Edit Feedback (#${editingCode})` : 'Submit New Feedback to Admin Staff'}
        </h2>
        {isEditing && (
          <span className="badge bg-warning-subtle text-dark border border-warning-subtle">
            Editing
          </span>
        )}
      </div>

      {isEditing && (
        <div className="alert alert-warning border-0 rounded-3 py-2 px-3 small mb-3">
          <i className="bi bi-info-circle-fill me-1"></i>
          You can edit the content while the request is in <strong>Pending Review</strong> status. Once Admin Staff accepts it (Pending), editing will be locked.
        </div>
      )}

      <form onSubmit={onSubmit}>
        {/* Title */}
        <div className="mb-3">
          <label className="form-label small fw-semibold text-secondary">
            Title <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            className="form-control rounded-3"
            placeholder="e.g., Student linking request, Tuition inquiry, Class feedback..."
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            disabled={isSubmitting}
            required
          />
        </div>

        {/* Content */}
        <div className="mb-4">
          <label className="form-label small fw-semibold text-secondary">
            Content <span className="text-danger">*</span>
          </label>
          <textarea
            className="form-control rounded-3"
            rows={6}
            placeholder="Enter detailed feedback to Admin Staff. If linking a student, please specify your child's full name, date of birth, school, and phone number for verification..."
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            disabled={isSubmitting}
            required
          ></textarea>
        </div>

        {/* Submit / Save edit buttons */}
        <div className="d-flex gap-2">
          {isEditing && onCancelEdit && (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onCancelEdit}
              className="btn btn-outline-secondary w-50 py-2.5 rounded-3 fw-semibold"
            >
              Cancel Edit
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary w-100 py-2.5 rounded-3 fw-semibold d-flex align-items-center justify-content-center gap-2 shadow-sm"
          >
            <i className={`bi ${isSubmitting ? 'bi-hourglass-split' : isEditing ? 'bi-check2-circle' : 'bi-send-fill'}`}></i>
            <span>
              {isSubmitting
                ? 'Saving...'
                : isEditing
                ? 'Save Changes'
                : 'Submit Feedback'}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
}

export default FeedbackFormCard;
