import React from 'react';
import type { ProgressFeedback } from '../progressData';

export interface TeacherFeedbackItemProps {
  feedback: ProgressFeedback;
}

export function TeacherFeedbackItem({ feedback }: TeacherFeedbackItemProps) {
  const isEvaluation =
    feedback.assignmentTitle.includes('[Đánh giá định kỳ]') ||
    feedback.assignmentTitle.toLowerCase().includes('nhận xét định kỳ') ||
    feedback.assignmentTitle.toLowerCase().includes('ghi chú tiến độ');

  const cleanTitle = feedback.assignmentTitle
    .replace(/\[Đánh giá định kỳ\]/g, '')
    .replace(/\[Bài tập\]/g, '')
    .trim();

  const isWarningOrNegative =
    feedback.statusType === 'canluuy' ||
    feedback.statusType === 'chuadat';

  return (
    <div
      className={`feedback-row-item ${
        isWarningOrNegative ? 'feedback-highlight-warning' : ''
      }`}
    >
      <div
        className={`feedback-left-line ${
          isWarningOrNegative ? 'line-warning' : ''
        }`}
      ></div>
      <div className="feedback-content">
        <div className="feedback-title-row d-flex align-items-center flex-wrap gap-2 mb-1.5">
          <span
            className={`feedback-category-pill ${
              isEvaluation ? 'pill-evaluation' : 'pill-assignment'
            }`}
          >
            <i
              className={`bi ${
                isEvaluation ? 'bi-person-badge-fill' : 'bi-journal-check'
              } me-1`}
            />
            {isEvaluation ? 'Đánh giá định kỳ' : 'Bài tập'}
          </span>
          <h3 className="feedback-asg-title mb-0">{cleanTitle}</h3>
        </div>
        <div className="feedback-quote-row">
          <i className="bi bi-quote"></i>
          <p className="feedback-quote-text">{feedback.quote}</p>
        </div>
        <div className="feedback-teacher-meta">
          <div className="teacher-mini-circle">
            <i className="bi bi-person-fill"></i>
          </div>
          <span className="teacher-mini-name">{feedback.teacherName}</span>
        </div>
      </div>
      <span className={`progress-status-badge psb-${feedback.statusType}`}>
        <i className={`bi ${feedback.statusIcon}`}></i> {feedback.statusLabel}
      </span>
    </div>
  );
}

export default TeacherFeedbackItem;
