import React from 'react';
import type { StudentProfileData } from './profileData';
import { formatDate } from './profileData';

interface ProfileViewCardProps {
  data: StudentProfileData;
}

export const ProfileViewCard: React.FC<ProfileViewCardProps> = ({ data }) => {
  return (
    <>
      {/* 2. Profile View Card (Chế độ xem) */}
          <div className="profile-card" id="profileViewCard">
            {/* Hero Gradient Banner */}
            <div className="profile-hero-banner">
              <div className="decor-circle-1"></div>
              <div className="decor-circle-2"></div>
            </div>

            {/* Identity Row */}
            <div className="profile-identity-section">
              <div className="d-flex align-items-end gap-4 flex-wrap">
                <div className="profile-avatar-wrapper">
                  <img src={data.avatarUrl} alt="Avatar" className="profile-avatar-img" id="viewAvatarImg" />
                  <span className="profile-online-dot"></span>
                </div>
                <div className="profile-identity-info">
                  <h2 className="profile-student-fullname" id="viewFullName">Nguyễn Thị Minh Anh</h2>
                  <div className="profile-meta-tags">
                    <span className="profile-role-tag">
                      <i className="bi bi-mortarboard-fill"></i>
                      <span>Học sinh</span>
                    </span>
                    <span className="profile-enroll-date-text">
                      EduTrack &bull; Nhập học <span id="viewEnrollDate">{formatDate(data.enrollDate)}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Info Rows */}
            <div className="mt-3">
              <div className="profile-info-row">
                <div className="profile-info-icon-box">
                  <i className="bi bi-calendar-event"></i>
                </div>
                <div className="flex-grow-1">
                  <div className="profile-info-label-group">
                    <span className="profile-info-label">Ngày sinh</span>
                  </div>
                  <p className="profile-info-value" id="viewDob">15/03/2006</p>
                </div>
              </div>

              <div className="profile-info-row">
                <div className="profile-info-icon-box">
                  <i className="bi bi-gender-ambiguous"></i>
                </div>
                <div className="flex-grow-1">
                  <div className="profile-info-label-group">
                    <span className="profile-info-label">Giới tính</span>
                  </div>
                  <p className="profile-info-value" id="viewGender">Nữ</p>
                </div>
              </div>

              <div className="profile-info-row">
                <div className="profile-info-icon-box locked">
                  <i className="bi bi-lock-fill"></i>
                </div>
                <div className="flex-grow-1">
                  <div className="profile-info-label-group">
                    <span className="profile-info-label">Ngày nhập học</span>
                    <span className="profile-locked-badge">
                      <i className="bi bi-lock-fill" style={{ fontSize: '9px' }}></i>
                      <span>Hệ thống</span>
                    </span>
                  </div>
                  <p className="profile-info-value locked">01/09/2023</p>
                </div>
              </div>

              <div className="profile-info-row">
                <div className="profile-info-icon-box">
                  <i className="bi bi-geo-alt-fill"></i>
                </div>
                <div className="flex-grow-1">
                  <div className="profile-info-label-group">
                    <span className="profile-info-label">Địa chỉ</span>
                  </div>
                  <p className="profile-info-value" id="viewAddress">45 Trần Hưng Đạo, Quận 1, TP. Hồ Chí Minh</p>
                </div>
              </div>

              <div className="profile-info-row">
                <div className="profile-info-icon-box">
                  <i className="bi bi-telephone-fill"></i>
                </div>
                <div className="flex-grow-1">
                  <div className="profile-info-label-group">
                    <span className="profile-info-label">Số điện thoại</span>
                  </div>
                  <p className="profile-info-value" id="viewPhone">0901 234 567</p>
                </div>
              </div>

              <div className="profile-info-row">
                <div className="profile-info-icon-box">
                  <i className="bi bi-envelope-fill"></i>
                </div>
                <div className="flex-grow-1">
                  <div className="profile-info-label-group">
                    <span className="profile-info-label">Email</span>
                  </div>
                  <p className="profile-info-value" id="viewEmail">minhanh.nguyen@gmail.com</p>
                </div>
              </div>
            </div>

            <div className="pb-3"></div>
          </div>
    </>
  );
};

export default ProfileViewCard;
