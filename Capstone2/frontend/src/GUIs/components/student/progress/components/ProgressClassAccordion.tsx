import React from 'react';
import type { ProgressClassItem } from '../progressData';
import { TeacherFeedbackItem } from './TeacherFeedbackItem';

export interface ProgressClassAccordionProps {
  item: ProgressClassItem;
  isOpen: boolean;
  onToggle: () => void;
}

export function ProgressClassAccordion({
  item,
  isOpen,
  onToggle,
}: ProgressClassAccordionProps) {
  return (
    <div className={`class-accordion-card ${item.colorTheme} ${isOpen ? 'is-open' : ''}`}>
      <button type="button" className="class-row-header-btn" onClick={onToggle}>
        <div className="class-subject-icon-box">
          <i className={`bi ${item.icon}`}></i>
        </div>
        <div className="class-row-center-info">
          <div className="class-title-meta">
            <span className="class-main-name">{item.className}</span>
            <span className="class-meta-sep">&middot;</span>
            <span className="class-subject-name">{item.subjectName}</span>
            {item.isCompleted && <span className="completed-tag">Đã hoàn thành</span>}
          </div>
          <div className="attendance-bar-wrap">
            <div className="attendance-progress-track">
              <div
                className="attendance-progress-fill"
                style={{ width: `${item.percentage}%` }}
              ></div>
            </div>
            <div className="attendance-counts-text">
              {item.attended}
              <span className="sep">/</span>
              {item.total}
              <span className="pct-text">({item.percentage}%)</span>
            </div>
          </div>
        </div>
        <div className="class-attendance-right-meta d-none d-md-flex">
          <span className="count-num">
            {item.attended}/{item.total}
          </span>
          <span className="count-label">buổi điểm danh</span>
        </div>
        <div className="class-pct-square-badge d-none d-sm-flex">
          {item.percentage}%
        </div>
        <div className="class-chevron-circle">
          <i className="bi bi-chevron-down"></i>
        </div>
      </button>

      <div className="class-accordion-body">
        <div className="accordion-sub-header">
          <div className="accordion-sub-dot"></div>
          <span className="accordion-sub-title">
            Nhận xét từ giáo viên ({item.feedbacks.length})
          </span>
        </div>
        <div className="feedback-list">
          {item.feedbacks.map((fb, idx) => (
            <TeacherFeedbackItem key={idx} feedback={fb} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProgressClassAccordion;
