import React from "react";

export default function NewAssignmentDescription() {
    return (
        <div className="col-12 mt-3">
            <label
                htmlFor="assignmentDescription"
                className="form-label fw-semibold text-dark"
            >
                Description
            </label>
            <textarea
                className="form-control"
                id="assignmentDescription"
                rows={4}
                placeholder="Provide instructions or details for this assignment..."
            />
        </div>
    );
}