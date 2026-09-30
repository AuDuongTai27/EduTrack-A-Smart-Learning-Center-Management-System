import React from 'react';
import type { ClassDetailItem } from './classDetailData';

interface ClassInfoCardProps {
  cls: ClassDetailItem;
}

export const ClassInfoCard: React.FC<ClassInfoCardProps> = ({ cls }) => {
  return (
    <div className="class-info-card">
      <div className="class-info-topbar" style={{ background: cls.grad }}></div>
      <div className="class-info-body">

        {/* Teacher Profile Header */}
        <div className="teacher-profile-header">
          <div className="teacher-profile-info">
            <div className="teacher-avatar-large" id="teacherAvatar" style={{ background: cls.grad }}>
              {cls.teacherInitials}
            </div>
            <div>
              <h3 className="teacher-info-name" id="teacherName">{cls.teacher}</h3>
              <p className="teacher-info-role">Giáo viên phụ trách</p>
            </div>
          </div>

          {/* Teacher Contact Pills */}
          <div className="teacher-contacts">
            <div className="contact-pill-item">
              <div className="contact-icon-box" style={{ backgroundColor: '#EFF6FF', color: '#2563EB' }}>
                <i className="bi bi-envelope"></i>
              </div>
              <div>
                <p className="contact-label">Email</p>
                <p className="contact-value" id="teacherEmail">{cls.email}</p>
              </div>
            </div>

            <div className="contact-pill-item">
              <div className="contact-icon-box" style={{ backgroundColor: '#ECFDF5', color: '#059669' }}>
                <i className="bi bi-telephone"></i>
              </div>
              <div>
                <p className="contact-label">Điện thoại</p>
                <p className="contact-value" id="teacherPhone">{cls.phone}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="info-card-divider"></div>

        {/* Meta Info Row */}
        <div className="info-meta-row">
          <div className="info-meta-item">
            <div className="info-meta-icon-box" style={{ backgroundColor: '#EFF6FF', color: '#2563EB' }}>
              <i className="bi bi-calendar-event"></i>
            </div>
            <div>
              <p className="contact-label">Lịch học</p>
              <p className="contact-value" id="classSchedule">{cls.schedule}</p>
            </div>
          </div>

          <div className="info-meta-item">
            <div className="info-meta-icon-box" style={{ backgroundColor: '#ECFDF5', color: '#059669' }}>
              <i className="bi bi-geo-alt"></i>
            </div>
            <div>
              <p className="contact-label">Phòng học</p>
              <p className="contact-value" id="classRoom">Phòng {cls.room}</p>
            </div>
          </div>

          <div className="info-meta-item">
            <div className="info-meta-icon-box" style={{ backgroundColor: '#F5F3FF', color: '#7C3AED' }}>
              <i className="bi bi-people"></i>
            </div>
            <div>
              <p className="contact-label">Số học sinh</p>
              <p className="contact-value" id="classStudentCount">{cls.studentCount} học sinh</p>
            </div>
          </div>
        </div>

        {/* Description Box */}
        <div className="info-description-box">
          <p id="classDesc">
            {cls.description}
          </p>
        </div>

      </div>
    </div>
  );
};

export default ClassInfoCard;
