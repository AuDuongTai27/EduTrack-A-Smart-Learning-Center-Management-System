import React from "react";

export default function NewAssignmentTypeSelector() {
    return (
        <div className="col-12 mt-3">
            <label className="form-label fw-semibold text-dark d-block">
                Assignment Type <span className="text-danger">*</span>
            </label>
            <div className="d-flex align-items-center gap-4 flex-wrap">
                <div className="form-check">
                    <input
                        className="form-check-input"
                        type="radio"
                        name="assignmentType"
                        id="typeMultipleChoice"
                        defaultChecked
                    />
                    <label
                        className="form-check-label text-dark cursor-pointer fw-medium"
                        htmlFor="typeMultipleChoice"
                    >
                        Multiple Choice Questions
                    </label>
                </div>
                <div className="form-check">
                    <input
                        className="form-check-input"
                        type="radio"
                        name="assignmentType"
                        id="typeWritten"
                    />
                    <label
                        className="form-check-label text-dark cursor-pointer fw-medium"
                        htmlFor="typeWritten"
                    >
                        Written Assignment
                    </label>
                </div>
            </div>
        </div>
    );
}