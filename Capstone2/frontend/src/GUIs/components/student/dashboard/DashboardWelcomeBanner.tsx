import React from 'react';

export interface DashboardWelcomeBannerProps {
  studentName?: string;
  avatarInitials?: string;
}

export function DashboardWelcomeBanner({
  studentName = 'Lê Văn An',
  avatarInitials = 'VA',
}: DashboardWelcomeBannerProps) {
  const getFormattedDate = (): string => {
    try {
      const now = new Date();
      const formatted = now.toLocaleDateString('vi-VN', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
      return formatted.charAt(0).toUpperCase() + formatted.slice(1);
    } catch {
      return 'Hôm nay';
    }
  };

  return (
    <div className="welcome-banner">
      <div className="banner-avatar">{avatarInitials}</div>
      <div className="banner-content">
        <h2 className="banner-title">Chào mừng trở lại, {studentName}!</h2>
        <p className="banner-date" id="currentDateText">{getFormattedDate()}</p>
      </div>
      <div className="banner-watermark">
        <i className="bi bi-mortarboard"></i>
      </div>
    </div>
  );
}

export default DashboardWelcomeBanner;
