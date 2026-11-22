import React from 'react';
import type { ClassDetailItem } from './classDetailData';

interface ClassInfoCardProps {
  cls: ClassDetailItem;
}

export function ClassInfoCard({ cls }: ClassInfoCardProps) {
  return (
    <div className="class-info-card">
      <div className="class-info-topbar" style={{ background: 'var(--et-brand-banner)' }}></div>
      <div className="class-info-body">

        {/* Teacher Profile Header */}
        <div className="teacher-profile-header">
          <div className="teacher-profile-info">
            <div className="teacher-avatar-large" id="teacherAvatar" style={{ background: 'var(--et-brand-banner)' }}>
              {cls.teacherInitials}
            </div>
            <div>
              <h3 className="teacher-info-name" id="teacherName">{cls.teacher}</h3>
              <p className="teacher-info-role">Lead Teacher</p>
            </div>
          </div>

          {/* Teacher Contact Pills */}
          <div className="teacher-contacts">
            <div className="contact-pill-item">
              <div className="contact-icon-box" style={{ backgroundColor: 'var(--et-mint)', color: 'var(--et-primary)' }}>
                <i className="bi bi-envelope"></i>
              </div>
              <div>
                <p className="contact-label">Email</p>
                <p className="contact-value" id="teacherEmail">{cls.email || 'Not provided'}</p>
              </div>
            </div>

            <div className="contact-pill-item">
              <div className="contact-icon-box" style={{ backgroundColor: '#ECFDF5', color: '#059669' }}>
                <i className="bi bi-telephone"></i>
              </div>
              <div>
                <p className="contact-label">Phone</p>
                <p className="contact-value" id="teacherPhone">{cls.phone || 'Not provided'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Teaching Assistant Profile Row */}
        {cls.taName && (
          <div className="teacher-profile-header mt-3 pt-3 border-top">
            <div className="teacher-profile-info">
              <div
                className="teacher-avatar-large"
                id="taAvatar"
                style={{
                  backgroundColor: 'var(--et-mint)',
                  color: 'var(--et-primary)',
                  border: '1px solid #A7F3D0',
                }}
              >
                {cls.taInitials || 'TA'}
              </div>
              <div>
                <h3 className="teacher-info-name" id="taName">{cls.taName}</h3>
                <p className="teacher-info-role">Teaching Assistant</p>
              </div>
            </div>

            <div className="teacher-contacts">
              <div className="contact-pill-item">
                <div className="contact-icon-box" style={{ backgroundColor: 'var(--et-mint)', color: 'var(--et-primary)' }}>
                  <i className="bi bi-envelope"></i>
                </div>
                <div>
                  <p className="contact-label">Email</p>
                  <p className="contact-value" id="taEmail">{cls.taEmail || 'Not provided'}</p>
                </div>
              </div>

              <div className="contact-pill-item">
                <div className="contact-icon-box" style={{ backgroundColor: '#ECFDF5', color: '#059669' }}>
                  <i className="bi bi-telephone"></i>
                </div>
                <div>
                  <p className="contact-label">Phone</p>
                  <p className="contact-value" id="taPhone">{cls.taPhone || 'Not provided'}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="info-card-divider"></div>

        {/* Meta Info Row */}
        <div className="info-meta-row">
          <div className="info-meta-item">
            <div className="info-meta-icon-box" style={{ backgroundColor: 'var(--et-mint)', color: 'var(--et-primary)' }}>
              <i className="bi bi-calendar-event"></i>
            </div>
            <div>
              <p className="contact-label">Schedule</p>
              <p className="contact-value" id="classSchedule">{cls.schedule || 'TBA'}</p>
            </div>
          </div>

          <div className="info-meta-item">
            <div className="info-meta-icon-box" style={{ backgroundColor: '#ECFDF5', color: '#059669' }}>
              <i className="bi bi-geo-alt"></i>
            </div>
            <div>
              <p className="contact-label">Room</p>
              <p className="contact-value" id="classRoom">
                {cls.room ? (cls.room.startsWith('Room') || cls.room.startsWith('Lab') ? cls.room : `Room ${cls.room}`) : 'TBA'}
              </p>
            </div>
          </div>
        </div>

        {/* Description Box */}
        {cls.description?.trim() && (
          <div className="info-description-box">
            <p id="classDesc">
              {cls.description}
            </p>
          </div>
        )}

      </div>
    </div>
  );
};

export default ClassInfoCard;
