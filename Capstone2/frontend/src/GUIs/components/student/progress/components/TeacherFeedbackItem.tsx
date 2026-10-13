import React from 'react';
import type { ProgressFeedback } from '../progressData';

export interface TeacherFeedbackItemProps {
  feedback: ProgressFeedback;
}

export function TeacherFeedbackItem({ feedback }: TeacherFeedbackItemProps) {
  return (
    <div className="feedback-row-item">
      <div className="feedback-left-line"></div>
      <div className="feedback-content">
        <h3 className="feedback-asg-title">{feedback.assignmentTitle}</h3>
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
};

export default TeacherFeedbackItem;
