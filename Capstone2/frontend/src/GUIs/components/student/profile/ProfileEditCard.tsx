import React, { useRef } from 'react';
import type { StudentProfileData } from './profileData';

interface ProfileEditCardProps {
  formData: StudentProfileData;
  onChange: (data: StudentProfileData) => void;
  onSave: () => void;
  onCancel: () => void;
}

export function ProfileEditCard({
  formData,
  onChange,
  onSave,
  onCancel,
}: ProfileEditCardProps) {
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
      {/* 3. Profile Edit Card (Edit mode - initially hidden) */}
          <div className="profile-card" id="profileEditCard">
            {/* Hero Gradient Banner with Edit Badge */}
            <div className="profile-hero-banner">
              <div className="decor-circle-1"></div>
              <div className="decor-circle-2"></div>
              <div className="profile-edit-badge-pill">
                <i className="bi bi-pencil-fill"></i>
                <span>Editing</span>
              </div>
            </div>

            <div className="edit-form-wrap">
              {/* Avatar Upload Row */}
              <div className="d-flex align-items-end gap-4 -mt-14 mb-4 position-relative" style={{ marginTop: '-52px' }}>
                <div
                  className="avatar-upload-box"
                  id="avatarUploadBox"
                  title="Click to select new photo"
                  onClick={() => fileInputRef.current?.click()}
                  style={{ cursor: 'pointer' }}
                >
                  <img src={formData.avatarUrl} alt="Avatar" className="profile-avatar-img" id="editAvatarImg" />
                  <div className="avatar-upload-overlay">
                    <i className="bi bi-camera-fill fs-5"></i>
                    <span>Change Photo</span>
                  </div>
                </div>

                <input type="file" id="avatarFileInput" accept="image/*" className="d-none" ref={fileInputRef} onChange={handleFileChange} />

                <div className="pb-2">
                  <button
                    type="button"
                    className="btn btn-link text-decoration-none p-0 fw-bold d-flex align-items-center gap-1.5 text-primary"
                    id="btnChangeAvatar"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <i className="bi bi-camera"></i>
                    <span>Change Avatar</span>
                  </button>
                  <p className="text-muted small mb-0 mt-1">Supports JPG, PNG, WEBP &middot; Max size 5MB</p>
                </div>
              </div>

              {/* Form Fields (2-Column Grid) */}
              <div className="row g-3">
                {/* Full name */}
                <div className="col-12 form-field-group">
                  <label className="form-field-label" htmlFor="inputFullName">Full Name</label>
                  <div className="input-icon-wrap">
                    <i className="bi bi-person"></i>
                    <input type="text" className="et-form-input" id="inputFullName" value={formData.fullName} onChange={(e) => onChange({ ...formData, fullName: e.target.value })} placeholder="Enter full name" />
                  </div>
                </div>

                {/* DOB */}
                <div className="col-md-6 form-field-group">
                  <label className="form-field-label" htmlFor="inputDob">Date of Birth</label>
                  <div className="input-icon-wrap">
                    <i className="bi bi-calendar-date"></i>
                    <input type="date" className="et-form-input" id="inputDob" value={formData.dob} onChange={(e) => onChange({ ...formData, dob: e.target.value })} />
                  </div>
                </div>

                {/* Gender */}
                <div className="col-md-6 form-field-group">
                  <label className="form-field-label" htmlFor="inputGender">Gender</label>
                  <div className="input-icon-wrap">
                    <i className="bi bi-gender-ambiguous"></i>
                    <select
                      className="et-form-input"
                      id="inputGender"
                      value={
                        formData.gender === 'female' || formData.gender === 'Nữ'
                          ? 'Nữ'
                          : formData.gender === 'other' || formData.gender === 'Khác'
                          ? 'Khác'
                          : 'Nam'
                      }
                      onChange={(e) => onChange({ ...formData, gender: e.target.value })}
                    >
                      <option value="Nam">Male</option>
                      <option value="Nữ">Female</option>
                      <option value="Khác">Other</option>
                    </select>
                  </div>
                </div>

                {/* Address */}
                <div className="col-12 form-field-group">
                  <label className="form-field-label" htmlFor="inputAddress">Address</label>
                  <div className="input-icon-wrap">
                    <i className="bi bi-geo-alt"></i>
                    <input type="text" className="et-form-input" id="inputAddress" value={formData.address} onChange={(e) => onChange({ ...formData, address: e.target.value })} placeholder="House number, street, ward, district..." />
                  </div>
                </div>

                {/* Phone */}
                <div className="col-md-6 form-field-group">
                  <label className="form-field-label" htmlFor="inputPhone">Phone Number</label>
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
                <span><strong>Enrollment Date</strong> is managed by the system and cannot be edited.</span>
              </div>

              {/* Form Action Buttons */}
              <div className="d-flex align-items-center gap-3 mt-4 pt-3 border-top">
                <button type="button" className="btn-save-profile" id="btnSaveProfile" onClick={onSave}>
                  <i className="bi bi-check-lg fs-6"></i>
                  <span>Save Changes</span>
                </button>
                <button type="button" className="btn-cancel-profile" id="btnCancelProfile" onClick={onCancel}>
                  <i className="bi bi-x-lg"></i>
                  <span>Cancel</span>
                </button>
              </div>
            </div>
          </div>
    </>
  );
};

export default ProfileEditCard;
