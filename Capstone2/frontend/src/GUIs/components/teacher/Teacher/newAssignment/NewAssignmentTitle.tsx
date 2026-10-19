import React from "react";

export default function NewAssignmentTitle() {
    return (
        <div className="col-md-8">
            <label
                htmlFor="assignmentTitle"
                className="form-label fw-semibold text-dark"
            >
                Assignment Title <span className="text-danger">*</span>
            </label>
            <input
                type="text"
                className="form-control"
                id="assignmentTitle"
                placeholder="e.g. Assignment 4: Momentum & Impulse"
            />
        </div>
    );
}