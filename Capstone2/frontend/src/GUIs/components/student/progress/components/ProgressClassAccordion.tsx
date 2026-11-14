import React, { useState, useEffect } from 'react';
import type { ProgressClassItem, ProgressFeedbackFilter } from '../progressData';
import { isEvaluationFeedback, isAssignmentFeedback } from '../progressData';
import { TeacherFeedbackItem } from './TeacherFeedbackItem';

export interface ProgressClassAccordionProps {
  item: ProgressClassItem;
  isOpen: boolean;
  onToggle: () => void;
  parentFilter?: ProgressFeedbackFilter;
}

export function ProgressClassAccordion({
  item,
  isOpen,
  onToggle,
  parentFilter = 'all',
}: ProgressClassAccordionProps) {
  const [localFilter, setLocalFilter] = useState<ProgressFeedbackFilter>(parentFilter);

  useEffect(() => {
    setLocalFilter(parentFilter);
  }, [parentFilter]);

  const totalCount = item.feedbacks.length;
  const evalCount = item.feedbacks.filter(isEvaluationFeedback).length;
  const asgCount = item.feedbacks.filter(isAssignmentFeedback).length;

  const filteredFeedbacks = item.feedbacks.filter((fb) => {
    if (localFilter === 'evaluation') return isEvaluationFeedback(fb);
    if (localFilter === 'assignment') return isAssignmentFeedback(fb);
    return true;
  });

  return (
    <div
      className={`class-accordion-card ${item.colorTheme} ${
        item.isCompleted ? 'is-completed-class' : ''
      } ${isOpen ? 'is-open' : ''}`}
    >
      <button type="button" className="class-row-header-btn" onClick={onToggle}>
        <div className="class-subject-icon-box">
          <i className={`bi ${item.icon}`}></i>
        </div>
        <div className="class-row-center-info">
          <div className="class-title-meta">
            <span className="class-main-name">{item.className}</span>
            <span className="class-meta-sep">&middot;</span>
            <span className="class-subject-name">{item.subjectName}</span>
            {item.isCompleted && (
              <span className="completed-tag">
                <i className="bi bi-patch-check-fill me-1"></i>
                Completed
              </span>
            )}
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
          <span className="count-label">
            {item.isCompleted ? 'sessions completed' : 'sessions attended'}
          </span>
        </div>
        <div className="class-pct-square-badge d-none d-sm-flex">
          {item.percentage}%
        </div>
        <div className="class-chevron-circle">
          <i className="bi bi-chevron-down"></i>
        </div>
      </button>

      <div className="class-accordion-body">
        <div className="accordion-sub-header d-flex align-items-center justify-content-between flex-wrap gap-2">
          <div className="d-flex align-items-center gap-2">
            <div className="accordion-sub-dot"></div>
            <span className="accordion-sub-title">
              {item.isCompleted
                ? `Final Evaluation (${filteredFeedbacks.length}/${totalCount})`
                : `Feedback & Progress (${filteredFeedbacks.length}/${totalCount})`}
            </span>
          </div>

          <div className="accordion-feedback-filter-group">
            <button
              type="button"
              className={`accordion-filter-btn ${localFilter === 'all' ? 'active' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                setLocalFilter('all');
              }}
            >
              All ({totalCount})
            </button>
            <button
              type="button"
              className={`accordion-filter-btn ${localFilter === 'evaluation' ? 'active' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                setLocalFilter('evaluation');
              }}
            >
              <i className="bi bi-person-badge-fill me-1"></i>
              Evaluations ({evalCount})
            </button>
            <button
              type="button"
              className={`accordion-filter-btn ${localFilter === 'assignment' ? 'active' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                setLocalFilter('assignment');
              }}
            >
              <i className="bi bi-journal-check me-1"></i>
              Assignments ({asgCount})
            </button>
          </div>
        </div>

        {filteredFeedbacks.length === 0 ? (
          <div className="feedback-empty-state">
            <i
              className={`bi ${
                localFilter === 'evaluation' ? 'bi-person-badge' : 'bi-journal-x'
              } fs-3 mb-2 text-secondary`}
            ></i>
            <p className="mb-0 small fw-medium">
              {localFilter === 'evaluation'
                ? 'No feedback or periodic evaluations from the teacher in this class yet.'
                : 'No assignments or reports recorded in this class yet.'}
            </p>
          </div>
        ) : (
          <div className="feedback-list">
            {filteredFeedbacks.map((fb, idx) => (
              <TeacherFeedbackItem key={idx} feedback={fb} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ProgressClassAccordion;
