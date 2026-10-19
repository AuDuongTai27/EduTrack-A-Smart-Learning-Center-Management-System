import React from "react";

export default function NewAssignmentAttachment() {
    return (
        <div className="col-12 mt-3">
            <label
                htmlFor="assignmentAttachment"
                className="form-label fw-semibold text-dark"
            >
                Attachment
            </label>
            <textarea
                className="form-control"
                id="assignmentAttachment"
                rows={3}
            />
        </div>
    );
}