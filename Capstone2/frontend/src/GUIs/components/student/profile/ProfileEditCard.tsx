import React, { useRef } from 'react';
import type { StudentProfileData } from './profileData';

interface ProfileEditCardProps {
  formData: StudentProfileData;
  onChange: (data: StudentProfileData) => void;
  onSave: () => void;
  onCancel: () => void;
}

export const ProfileEditCard: React.FC<ProfileEditCardProps> = ({
  formData,
  onChange,
  onSave,
  onCancel,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onChange({ ...formData, avatarUrl: event.target.result as string });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      {/* 3. Profile Edit Card (Chế độ chỉnh sửa - ban đầu ẩn) */}
          <div className="profile-card" id="profileEditCard">
            {/* Hero Gradient Banner with Edit Badge */}
            <div className="profile-hero-banner">
              <div className="decor-circle-1"></div>
              <div className="decor-circle-2"></div>
              <div className="profile-edit-badge-pill">
                <i className="bi bi-pencil-fill"></i>
                <span>Đang chỉnh sửa</span>
              </div>
            </div>

            <div className="edit-form-wrap">
              {/* Avatar Upload Row */}
              <div className="d-flex align-items-end gap-4 -mt-14 mb-4 position-relative" style={{ marginTop: '-52px' }}>
                <div className="avatar-upload-box" id="avatarUploadBox" title="Nhấp để chọn ảnh mới">
                  <img src="https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=240&h=240&fit=crop&auto=format" alt="Avatar" className="profile-avatar-img" id="editAvatarImg" />
                  <div className="avatar-upload-overlay">
                    <i className="bi bi-camera-fill fs-5"></i>
                    <span>Thay ảnh</span>
                  </div>
                </div>

                <input type="file" id="avatarFileInput" accept="image/*" className="d-none" ref={fileInputRef} onChange={handleFileChange} />

                <div className="pb-2">
                  <button type="button" className="btn btn-link text-decoration-none p-0 fw-bold d-flex align-items-center gap-1.5 text-primary" id="btnChangeAvatar">
                    <i className="bi bi-camera"></i>
                    <span>Thay ảnh đại diện</span>
                  </button>
                  <p className="text-muted small mb-0 mt-1">Hỗ trợ JPG, PNG, WEBP &middot; Dung lượng tối đa 5MB</p>
                </div>
              </div>

              {/* Form Fields (2-Column Grid) */}
              <div className="row g-3">
                {/* Full name */}
                <div className="col-12 form-field-group">
                  <label className="form-field-label" htmlFor="inputFullName">Họ và tên</label>
                  <div className="input-icon-wrap">
                    <i className="bi bi-person"></i>
                    <input type="text" className="et-form-input" id="inputFullName" value={formData.fullName} onChange={(e) => onChange({ ...formData, fullName: e.target.value })} placeholder="Nhập họ và tên đầy đủ" />
                  </div>
                </div>

                {/* DOB */}
                <div className="col-md-6 form-field-group">
                  <label className="form-field-label" htmlFor="inputDob">Ngày tháng năm sinh</label>
                  <div className="input-icon-wrap">
                    <i className="bi bi-calendar-date"></i>
                    <input type="date" className="et-form-input" id="inputDob" value={formData.dob} onChange={(e) => onChange({ ...formData, dob: e.target.value })} />
                  </div>
                </div>

                {/* Gender */}
                <div className="col-md-6 form-field-group">
                  <label className="form-field-label" htmlFor="inputGender">Giới tính</label>
                  <div className="input-icon-wrap">
                    <i className="bi bi-gender-ambiguous"></i>
                    <select className="et-form-input" id="inputGender">
                      <option value="Nam">Nam</option>
                      <option value="Nữ" selected>Nữ</option>
                      <option value="Khác">Khác</option>
                    </select>
                  </div>
                </div>

                {/* Address */}
                <div className="col-12 form-field-group">
                  <label className="form-field-label" htmlFor="inputAddress">Địa chỉ</label>
                  <div className="input-icon-wrap">
                    <i className="bi bi-geo-alt"></i>
                    <input type="text" className="et-form-input" id="inputAddress" value={formData.address} onChange={(e) => onChange({ ...formData, address: e.target.value })} placeholder="Số nhà, đường, phường, quận..." />
                  </div>
                </div>

                {/* Phone */}
                <div className="col-md-6 form-field-group">
                  <label className="form-field-label" htmlFor="inputPhone">Số điện thoại</label>
                  <div className="input-icon-wrap">
                    <i className="bi bi-telephone"></i>
                    <input type="tel" className="et-form-input" id="inputPhone" value={formData.phone} onChange={(e) => onChange({ ...formData, phone: e.target.value })} placeholder="0900 000 000" />
                  </div>
                </div>

                {/* Email */}
                <div className="col-md-6 form-field-group">
                  <label className="form-field-label" htmlFor="inputEmail">Email</label>
                  <div className="input-icon-wrap">
                    <i className="bi bi-envelope"></i>
                    <input type="email" className="et-form-input" id="inputEmail" value={formData.email} onChange={(e) => onChange({ ...formData, email: e.target.value })} placeholder="example@email.com" />
                  </div>
                </div>
              </div>

              {/* Locked Notice */}
              <div className="locked-field-notice">
                <div className="rounded-2 p-1 bg-primary-subtle text-primary d-flex align-items-center justify-content-center" style={{ width: '24px', height: '24px' }}>
                  <i className="bi bi-lock-fill" style={{ fontSize: '12px' }}></i>
                </div>
                <span><strong>Ngày nhập học</strong> là trường do hệ thống quản lý và không thể chỉnh sửa.</span>
              </div>

              {/* Form Action Buttons */}
              <div className="d-flex align-items-center gap-3 mt-4 pt-3 border-top">
                <button type="button" className="btn-save-profile" id="btnSaveProfile" onClick={onSave}>
                  <i className="bi bi-check-lg fs-6"></i>
                  <span>Lưu thay đổi</span>
                </button>
                <button type="button" className="btn-cancel-profile" id="btnCancelProfile" onClick={onCancel}>
                  <i className="bi bi-x-lg"></i>
                  <span>Hủy</span>
                </button>
              </div>
            </div>
          </div>
    </>
  );
};

export default ProfileEditCard;
