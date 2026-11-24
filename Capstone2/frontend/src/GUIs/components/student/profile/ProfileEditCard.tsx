import React, { useRef, useState } from 'react';
import type { StudentProfileData } from './profileData';

interface ProfileEditCardProps {
  formData: StudentProfileData;
  onChange: (data: StudentProfileData) => void;
  onSave: () => void | Promise<void>;
  onCancel: () => void;
  isSaving?: boolean;
  saveError?: string | null;
}

export function ProfileEditCard({
  formData,
  onChange,
  onSave,
  onCancel,
  isSaving = false,
  saveError = null,
}: ProfileEditCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;

    const trimmedName = (formData.fullName || '').trim();
    if (!trimmedName) {
      setValidationError('Full Name is required.');
      return;
    }

    const trimmedEmail = (formData.email || '').trim();
    if (trimmedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setValidationError('Please enter a valid email address.');
      return;
    }

    setValidationError(null);
    void onSave();
  };

  const displayError = validationError || saveError;

  return (
    <>
      {/* 3. Profile Edit Card (Edit mode - initially hidden) */}
          <div className="profile-card" id="profileEditCard">
            {/* Hero Gradient Banner */}
            <div className="profile-hero-banner">
              <div className="decor-circle-1"></div>
              <div className="decor-circle-2"></div>
            </div>

            <form className="edit-form-wrap" onSubmit={handleSubmit} noValidate>
              {/* Avatar Upload Row */}
              <div className="d-flex align-items-start gap-4 mb-4 position-relative" style={{ marginTop: '-72px' }}>
                <div
                  className="avatar-upload-box"
                  id="avatarUploadBox"
                  role="button"
                  tabIndex={0}
                  aria-label="Change profile avatar"
                  title="Click to select new photo"
                  onClick={() => fileInputRef.current?.click()}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      fileInputRef.current?.click();
                    }
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  <img src={formData.avatarUrl} alt="Avatar" className="profile-avatar-img" id="editAvatarImg" />
                  <div className="avatar-upload-overlay">
                    <i className="bi bi-camera-fill fs-5"></i>
                    <span>Change Photo</span>
                  </div>
                </div>

                <input type="file" id="avatarFileInput" accept="image/*" className="d-none" ref={fileInputRef} onChange={handleFileChange} />

                <div style={{ paddingTop: '54px' }}>
                  <button
                    type="button"
                    className="btn btn-link text-decoration-none p-0 fw-bold d-flex align-items-center gap-1 text-primary"
                    id="btnChangeAvatar"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isSaving}
                  >
                    <i className="bi bi-camera"></i>
                    <span>Change Avatar</span>
                  </button>
                </div>
              </div>

              {displayError && (
                <div className="alert alert-danger py-2 px-3 small mb-3 d-flex align-items-center gap-2 rounded-3 border-0" role="alert">
                  <i className="bi bi-exclamation-triangle-fill flex-shrink-0" />
                  <span>{displayError}</span>
                </div>
              )}

              {/* Form Fields (2-Group Layout matching View Mode) */}
              <div className="row g-4">
                <div className="col-12 col-lg-6">
                  <div className="profile-section-box h-100">
                    <h3 className="profile-section-title">
                      <i className="bi bi-person-vcard text-primary"></i>
                      <span>Personal Information</span>
                    </h3>
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
                      <div className="col-sm-6 form-field-group">
                        <label className="form-field-label" htmlFor="inputDob">Date of Birth</label>
                        <div className="input-icon-wrap">
                          <i className="bi bi-calendar-date"></i>
                          <input type="date" className="et-form-input" id="inputDob" value={formData.dob} onChange={(e) => onChange({ ...formData, dob: e.target.value })} />
                        </div>
                      </div>

                      {/* Gender */}
                      <div className="col-sm-6 form-field-group">
                        <label className="form-field-label" htmlFor="inputGender">Gender</label>
                        <div className="input-icon-wrap">
                          <i className="bi bi-gender-ambiguous"></i>
                          <select
                            className="et-form-input"
                            id="inputGender"
                            value={(() => {
                              const g = (formData.gender || '').toLowerCase();
                              if (g === 'female' || g === 'nữ' || g === 'nu') return 'Nữ';
                              if (g === 'other' || g === 'khác' || g === 'khac') return 'Khác';
                              return 'Nam';
                            })()}
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
                    </div>
                  </div>
                </div>

                <div className="col-12 col-lg-6">
                  <div className="profile-section-box h-100">
                    <h3 className="profile-section-title">
                      <i className="bi bi-telephone-inbound text-primary"></i>
                      <span>Contact Details</span>
                    </h3>
                    <div className="row g-3">
                      {/* Phone */}
                      <div className="col-12 form-field-group">
                        <label className="form-field-label" htmlFor="inputPhone">Phone Number</label>
                        <div className="input-icon-wrap">
                          <i className="bi bi-telephone"></i>
                          <input type="tel" className="et-form-input" id="inputPhone" value={formData.phone} onChange={(e) => onChange({ ...formData, phone: e.target.value })} placeholder="0900 000 000" />
                        </div>
                      </div>

                      {/* Email */}
                      <div className="col-12 form-field-group">
                        <label className="form-field-label" htmlFor="inputEmail">Email</label>
                        <div className="input-icon-wrap">
                          <i className="bi bi-envelope"></i>
                          <input type="email" className="et-form-input" id="inputEmail" value={formData.email} onChange={(e) => onChange({ ...formData, email: e.target.value })} placeholder="example@email.com" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="d-flex align-items-center justify-content-end gap-2 mt-4 pt-3 border-top">
                <button type="button" className="btn-cancel-profile" id="btnCancelProfile" onClick={onCancel} disabled={isSaving}>
                  <span>Cancel</span>
                </button>
                <button type="submit" className="btn-save-profile" id="btnSaveProfile" disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-lg fs-6"></i>
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
    </>
  );
};

export default ProfileEditCard;
