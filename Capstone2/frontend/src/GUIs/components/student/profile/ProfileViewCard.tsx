import React from 'react';
import type { StudentProfileData } from './profileData';
import { formatDate } from './profileData';

interface ProfileViewCardProps {
  data: StudentProfileData;
  onEdit?: () => void;
}

function renderGender(gender?: string): string {
  if (!gender) return '—';
  const lower = gender.toLowerCase();
  if (lower === 'nam' || lower === 'male') return 'Male';
  if (lower === 'nữ' || lower === 'nu' || lower === 'female') return 'Female';
  if (lower === 'khác' || lower === 'khac' || lower === 'other') return 'Other';
  return gender;
}

export function ProfileViewCard({ data, onEdit }: ProfileViewCardProps) {
  return (
    <>
      {/* 2. Profile View Card (View mode) */}
          <div className="profile-card" id="profileViewCard">
            {/* Hero Gradient Banner */}
            <div className="profile-hero-banner">
              <div className="decor-circle-1"></div>
              <div className="decor-circle-2"></div>
            </div>

            {/* Identity Row */}
            <div className="profile-identity-section">
              <div className="d-flex align-items-start justify-content-between gap-4 flex-wrap">
                <div className="d-flex align-items-start gap-4 flex-wrap">
                  <div className="profile-avatar-wrapper">
                    <img src={data.avatarUrl} alt="Avatar" className="profile-avatar-img" id="viewAvatarImg" />
                  </div>
                  <div className="profile-identity-info">
                    <h2 className="profile-student-fullname" id="viewFullName">{data.fullName}</h2>
                    <div className="profile-meta-tags">
                      <span className="profile-role-tag">
                        <i className="bi bi-mortarboard-fill"></i>
                        <span>Student</span>
                      </span>
                      <span className="profile-enroll-date-text">
                        Enrolled <span id="viewEnrollDate">{formatDate(data.enrollDate)}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {onEdit && (
                  <div className="align-self-md-end mb-md-1">
                    <button
                      type="button"
                      className="btn btn-outline-primary d-inline-flex align-items-center gap-2 px-3 py-2 rounded-3 fw-semibold"
                      id="btnEditProfile"
                      onClick={onEdit}
                    >
                      <i className="bi bi-pencil-square"></i>
                      <span>Edit Profile</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Grouped Info Sections */}
            <div className="edit-form-wrap pt-3">
              <div className="row g-4">
                <div className="col-12 col-lg-6">
                  <div className="profile-section-box h-100">
                    <h3 className="profile-section-title">
                      <i className="bi bi-person-vcard text-primary"></i>
                      <span>Personal Information</span>
                    </h3>
                    <div className="profile-section-list">
                      <div className="profile-section-item">
                        <div className="profile-info-icon-box">
                          <i className="bi bi-calendar-event"></i>
                        </div>
                        <div className="flex-grow-1">
                          <div className="profile-info-label-group">
                            <span className="profile-info-label">Date of Birth</span>
                          </div>
                          <p className="profile-info-value" id="viewDob">{formatDate(data.dob)}</p>
                        </div>
                      </div>

                      <div className="profile-section-item">
                        <div className="profile-info-icon-box">
                          <i className="bi bi-gender-ambiguous"></i>
                        </div>
                        <div className="flex-grow-1">
                          <div className="profile-info-label-group">
                            <span className="profile-info-label">Gender</span>
                          </div>
                          <p className="profile-info-value" id="viewGender">{renderGender(data.gender)}</p>
                        </div>
                      </div>

                      <div className="profile-section-item">
                        <div className="profile-info-icon-box">
                          <i className="bi bi-geo-alt-fill"></i>
                        </div>
                        <div className="flex-grow-1">
                          <div className="profile-info-label-group">
                            <span className="profile-info-label">Address</span>
                          </div>
                          <p className="profile-info-value" id="viewAddress">{data.address || 'Not provided'}</p>
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
                    <div className="profile-section-list">
                      <div className="profile-section-item">
                        <div className="profile-info-icon-box">
                          <i className="bi bi-telephone-fill"></i>
                        </div>
                        <div className="flex-grow-1">
                          <div className="profile-info-label-group">
                            <span className="profile-info-label">Phone Number</span>
                          </div>
                          <p className="profile-info-value" id="viewPhone">{data.phone || 'Not provided'}</p>
                        </div>
                      </div>

                      <div className="profile-section-item">
                        <div className="profile-info-icon-box">
                          <i className="bi bi-envelope-fill"></i>
                        </div>
                        <div className="flex-grow-1">
                          <div className="profile-info-label-group">
                            <span className="profile-info-label">Email</span>
                          </div>
                          <p className="profile-info-value" id="viewEmail">{data.email || 'Not provided'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
    </>
  );
};

export default ProfileViewCard;
