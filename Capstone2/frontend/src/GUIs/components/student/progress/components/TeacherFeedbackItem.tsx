import React from 'react';
import type { ProgressFeedback } from '../progressData';
import { isEvaluationFeedback } from '../progressData';

export interface TeacherFeedbackItemProps {
  feedback: ProgressFeedback;
}

function renderStatusLabel(label: string, type: string): string {
  if (!label) {
    if (type === 'dat') return 'Passed';
    if (type === 'canluuy') return 'Needs Attention';
    if (type === 'chuadat') return 'Not Passed';
    return '';
  }
  const l = label.toLowerCase();
  if (l === 'đạt' || l === 'dat') return 'Passed';
  if (l === 'khen ngợi' || l === 'khen ngoi') return 'Praise';
  if (l === 'cần lưu ý' || l === 'can luu y') return 'Needs Attention';
  if (l === 'chưa đạt' || l === 'chua dat') return 'Not Passed';
  if (l === 'tiến bộ tốt' || l === 'tien bo tot') return 'Good Progress';
  return label;
}

export function TeacherFeedbackItem({ feedback }: TeacherFeedbackItemProps) {
  const isEvaluation = isEvaluationFeedback(feedback);

  const cleanTitle = feedback.assignmentTitle
    .replace(/\[Đánh giá định kỳ\]/gi, '')
    .replace(/\[Đánh giá tổng kết\]/gi, '')
    .replace(/\[Đánh giá\]/gi, '')
    .replace(/\[Bài tập\]/gi, '')
    .replace(/\[Periodic Evaluation\]/gi, '')
    .replace(/\[Final Evaluation\]/gi, '')
    .replace(/\[Evaluation\]/gi, '')
    .replace(/\[Assignment\]/gi, '')
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
            {isEvaluation
              ? feedback.assignmentTitle.includes('tổng kết') || feedback.assignmentTitle.toLowerCase().includes('final')
                ? 'Final Evaluation'
                : 'Periodic Evaluation'
              : 'Assignment'}
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
        <i className={`bi ${feedback.statusIcon}`}></i> {renderStatusLabel(feedback.statusLabel, feedback.statusType)}
      </span>
    </div>
  );
}

export default TeacherFeedbackItem;
