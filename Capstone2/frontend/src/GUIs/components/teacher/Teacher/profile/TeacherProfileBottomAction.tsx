import React from "react";

export interface ProfileBottomActionProps {
    onEdit?: () => void;
}

export function TeacherProfileBottomAction({ onEdit }: ProfileBottomActionProps) {
    return (
        <div className="d-flex justify-content-end pt-3 border-top">
            <button
                type="button"
                className="btn btn-primary d-inline-flex align-items-center gap-2"
                onClick={onEdit}
            >
                <i className="bi bi-pencil-square" /> Edit Profile
            </button>
        </div>
    );
}

export default TeacherProfileBottomAction;