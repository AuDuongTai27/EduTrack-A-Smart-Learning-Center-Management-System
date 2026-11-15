import React from 'react';

interface ProfileToastProps {
  show: boolean;
}

export function ProfileToast({ show }: ProfileToastProps) {
  return (
    <div className={`profile-toast-box ${show ? 'show' : ''}`} id="profileToast">
      <div className="toast-icon-circle">
        <i className="bi bi-check-lg"></i>
      </div>
      <div>
        <div className="fw-bold text-success fs-6">Update Successful</div>
        <div className="text-success-emphasis small">
          Your profile has been saved to the system.
        </div>
      </div>
    </div>
  );
};

export default ProfileToast;
