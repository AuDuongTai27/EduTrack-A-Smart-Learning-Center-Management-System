import React from "react";

export default function NewAssignmentFormAction() {
    return (
        <div className="d-flex align-items-center justify-content-end gap-2 mt-4 pt-3 border-top">
            <a
                href="/teacher/class-details"
                className="btn btn-outline-secondary btn-sm"
            >
                Cancel
            </a>
            <button
                type="button"
                className="btn btn-primary btn-sm d-inline-flex align-items-center gap-1"
            >
                <i className="bi bi-check-lg" /> Save Assignment
            </button>
        </div>
    );
}