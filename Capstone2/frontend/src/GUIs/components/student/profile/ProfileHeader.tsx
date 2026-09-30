import React from 'react';
import { Link } from 'react-router-dom';

interface ProfileHeaderProps {
  isEditing: boolean;
  onEdit: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ isEditing, onEdit }) => {
  return (
    <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
      <div>
        <div className="d-flex align-items-center gap-2 text-muted small mb-1">
          <Link to="/student/dashboard" className="text-decoration-none text-muted">
            Trang chủ
          </Link>
          <i className="bi bi-chevron-right" style={{ fontSize: '10px' }}></i>
          <span className="text-dark fw-semibold">Hồ sơ cá nhân</span>
          {isEditing && (
            <span id="breadcrumbEdit">
              <i className="bi bi-chevron-right mx-1 text-muted" style={{ fontSize: '10px' }}></i>
              <span className="text-warning fw-semibold">Chỉnh sửa</span>
            </span>
          )}
        </div>
        <h1 className="page-title fs-3 fw-bold">Hồ sơ cá nhân</h1>
        <p className="page-subtitle">Xem và cập nhật thông tin cá nhân của bạn</p>
      </div>

      {/* Edit Button */}
      {!isEditing && (
        <button
          type="button"
          className="btn btn-outline-primary d-inline-flex align-items-center gap-2 px-4 py-2 rounded-3 fw-bold"
          id="btnEditProfile"
          onClick={onEdit}
        >
          <i className="bi bi-pencil-square"></i>
          <span>Chỉnh sửa</span>
        </button>
      )}
    </div>
  );
};

export default ProfileHeader;
