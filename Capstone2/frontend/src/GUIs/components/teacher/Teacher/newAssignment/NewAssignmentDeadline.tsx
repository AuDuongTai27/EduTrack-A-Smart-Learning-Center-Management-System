import React from "react";

export default function NewAssignmentDeadline() {
    return (
        <div className="col-md-4">
            <label
                htmlFor="assignmentDeadline"
                className="form-label fw-semibold text-dark"
            >
                Deadline <span className="text-danger">*</span>
            </label>
            <input
                type="datetime-local"
                className="form-control"
                id="assignmentDeadline"
            />
        </div>
    );
}