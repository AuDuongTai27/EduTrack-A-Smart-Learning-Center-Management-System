import React from 'react';

interface ProfileToastProps {
  show: boolean;
}

export const ProfileToast: React.FC<ProfileToastProps> = ({ show }) => {
  return (
    <div className={`profile-toast-box ${show ? 'show' : ''}`} id="profileToast">
      <div className="toast-icon-circle">
        <i className="bi bi-check-lg"></i>
      </div>
      <div>
        <div className="fw-bold text-success fs-6">Cập nhật thành công</div>
        <div className="text-success-emphasis small">
          Hồ sơ của bạn đã được lưu lại trên hệ thống.
        </div>
      </div>
    </div>
  );
};

export default ProfileToast;
