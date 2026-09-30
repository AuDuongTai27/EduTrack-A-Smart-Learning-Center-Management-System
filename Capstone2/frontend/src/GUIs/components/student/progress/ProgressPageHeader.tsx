import React from 'react';

export const ProgressPageHeader: React.FC = () => {
  return (
    <>
{/* 1. Page Header with Overall Attendance */}
          <div className="progress-header-row">
            <div>
              <div className="progress-breadcrumbs">
                <span className="bc-primary">Học sinh</span>
                <span className="bc-sep">/</span>
                <span className="bc-muted">Tiến độ học tập</span>
              </div>
              <h1 className="progress-page-title">Tiến độ học tập</h1>
              <p className="progress-page-subtitle">Năm học 2025–2026 &middot; Học kỳ 1</p>
            </div>

            {/* Overall Attendance Hero Pill */}
            <div className="overall-attendance-pill">
              <div>
                <div className="overall-label">Điểm danh chung</div>
                <div className="overall-value">80%</div>
              </div>
              <div className="overall-divider"></div>
              <div>
                <div className="overall-label">Tổng buổi học</div>
                <div className="overall-value">35/44</div>
              </div>
            </div>
          </div>
    </>
  );
};

export default ProgressPageHeader;
