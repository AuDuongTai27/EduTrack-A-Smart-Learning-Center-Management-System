import React, { useState, useMemo } from 'react';
import type { ProgressFeedback, ProgressFeedbackFilter } from '../progress/progressData';
import { isEvaluationFeedback, isAssignmentFeedback } from '../progress/progressData';

export interface ClassEvaluationsSectionProps {
  feedbacks?: ProgressFeedback[];
  classNameTitle?: string;
}

export function ClassEvaluationsSection({
  feedbacks = [],
  classNameTitle,
}: ClassEvaluationsSectionProps) {
  const [filterType, setFilterType] = useState<ProgressFeedbackFilter>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const evalCount = useMemo(() => feedbacks.filter(isEvaluationFeedback).length, [feedbacks]);
  const asgCount = useMemo(() => feedbacks.filter(isAssignmentFeedback).length, [feedbacks]);

  const filteredFeedbacks = useMemo(() => {
    return feedbacks.filter((fb) => {
      if (filterType === 'evaluation' && !isEvaluationFeedback(fb)) return false;
      if (filterType === 'assignment' && !isAssignmentFeedback(fb)) return false;

      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchTitle = fb.assignmentTitle?.toLowerCase().includes(term);
        const matchQuote = fb.quote?.toLowerCase().includes(term);
        const matchTeacher = fb.teacherName?.toLowerCase().includes(term);
        return matchTitle || matchQuote || matchTeacher;
      }

      return true;
    });
  }, [feedbacks, filterType, searchTerm]);

  const renderStatusBadge = (statusLabel: string, statusType: string) => {
    let badgeClass = 'bg-success-subtle text-success border-success-subtle';
    let iconClass = 'bi-check-circle-fill';

    if (statusType === 'canluuy') {
      badgeClass = 'bg-warning-subtle text-warning border-warning-subtle';
      iconClass = 'bi-exclamation-triangle-fill';
    } else if (statusType === 'chuadat') {
      badgeClass = 'bg-danger-subtle text-danger border-danger-subtle';
      iconClass = 'bi-x-circle-fill';
    }

    return (
      <span className={`badge ${badgeClass} border px-2.5 py-1 rounded-2 fw-semibold d-inline-flex align-items-center gap-1`}>
        <i className={`bi ${iconClass}`} style={{ fontSize: '11px' }} />
        <span>{statusLabel}</span>
      </span>
    );
  };

  return (
    <details className="card class-list-card border-0 mb-4">
      {/* 1. Header: Thống nhất hoàn toàn với style Teacher & TA (Không subtitle, toggle chỉ có icon) */}
      <summary className="class-list-header d-flex align-items-center justify-content-between py-3 px-4 flex-wrap gap-2 cursor-pointer">
        <div className="d-flex align-items-center gap-2">
          <i className="bi bi-star-fill text-primary fs-5" />
          <h4 className="class-list-title mb-0">
            Teacher Evaluations &amp; Feedback ({feedbacks.length})
          </h4>
        </div>

        {/* Toggle icon chevron */}
        <i className="bi bi-chevron-down details-chevron text-muted" />
      </summary>

      {/* 2. Toolbar: Filter Pills & Search Box */}
      <div className="px-4 py-2.5 border-bottom bg-light bg-opacity-40 d-flex align-items-center justify-content-between flex-wrap gap-2.5">
        {/* Filter Pills */}
        <div className="d-flex align-items-center gap-1.5 flex-wrap">
          <button
            type="button"
            className={`btn btn-sm rounded-pill px-3 py-1 fw-medium d-inline-flex align-items-center gap-1.5 transition-all ${
              filterType === 'all'
                ? 'btn-primary shadow-xs'
                : 'btn-outline-secondary bg-white text-secondary border'
            }`}
            style={{ fontSize: '13px' }}
            onClick={() => setFilterType('all')}
          >
            <i className="bi bi-grid-fill" style={{ fontSize: '12px' }} />
            <span>All ({feedbacks.length})</span>
          </button>

          <button
            type="button"
            className={`btn btn-sm rounded-pill px-3 py-1 fw-medium d-inline-flex align-items-center gap-1.5 transition-all ${
              filterType === 'evaluation'
                ? 'btn-primary shadow-xs'
                : 'btn-outline-secondary bg-white text-secondary border'
            }`}
            style={{ fontSize: '13px' }}
            onClick={() => setFilterType('evaluation')}
          >
            <i className="bi bi-person-badge-fill" style={{ fontSize: '12px' }} />
            <span>Teacher Evaluations ({evalCount})</span>
          </button>

          <button
            type="button"
            className={`btn btn-sm rounded-pill px-3 py-1 fw-medium d-inline-flex align-items-center gap-1.5 transition-all ${
              filterType === 'assignment'
                ? 'btn-primary shadow-xs'
                : 'btn-outline-secondary bg-white text-secondary border'
            }`}
            style={{ fontSize: '13px' }}
            onClick={() => setFilterType('assignment')}
          >
            <i className="bi bi-journal-check" style={{ fontSize: '12px' }} />
            <span>Assignment Feedback ({asgCount})</span>
          </button>
        </div>

        {/* Search Input */}
        <div>
          <div className="input-group input-group-sm" style={{ width: 280 }}>
            <span className="input-group-text bg-white border-end-0 text-muted rounded-start-2">
              <i className="bi bi-search" style={{ fontSize: '12px' }} />
            </span>
            <input
              type="search"
              className="form-control form-control-sm border-start-0 ps-1 rounded-end-2"
              placeholder="Search feedback..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ fontSize: '13px' }}
            />
          </div>
        </div>
      </div>

      {/* 3. Feedback Items List */}
      <div className="p-4 bg-white d-flex flex-column gap-3">
        {filteredFeedbacks.length > 0 ? (
          filteredFeedbacks.map((item, idx) => {
            const isEval = isEvaluationFeedback(item);
            const cleanTitle = item.assignmentTitle
              .replace(/\[Đánh giá định kỳ\]/gi, '')
              .replace(/\[Đánh giá tổng kết\]/gi, '')
              .replace(/\[Periodic Evaluation\]/gi, '')
              .replace(/\[Evaluation\]/gi, '')
              .trim();

            return (
              <div
                key={idx}
                className="p-3.5 rounded-3 border bg-white shadow-xs d-flex flex-column gap-2"
                style={{
                  borderLeft: isEval ? '4px solid #F59E0B' : '4px solid #2563EB',
                }}
              >
                {/* Header row: Category Badge, Title & Status */}
                <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                  <div className="d-flex align-items-center gap-2 flex-wrap">
                    {/* Thống nhất Icon theo yêu cầu: Đánh giá bình thường vs Đánh giá theo bài tập */}
                    {isEval ? (
                      <span
                        className="badge rounded-pill px-2.5 py-1 fw-semibold d-inline-flex align-items-center gap-1.5"
                        style={{
                          backgroundColor: '#FEF3C7',
                          color: '#92400E',
                          border: '1px solid #FDE68A',
                          fontSize: '12px',
                        }}
                      >
                        <i className="bi bi-person-badge-fill" />
                        <span>Teacher Evaluation</span>
                      </span>
                    ) : (
                      <span
                        className="badge rounded-pill px-2.5 py-1 fw-semibold d-inline-flex align-items-center gap-1.5"
                        style={{
                          backgroundColor: '#EFF6FF',
                          color: '#2563EB',
                          border: '1px solid #BFDBFE',
                          fontSize: '12px',
                        }}
                      >
                        <i className="bi bi-journal-check" />
                        <span>Assignment Feedback</span>
                      </span>
                    )}

                    <span className="fw-bold text-dark" style={{ fontSize: '14.5px' }}>
                      {cleanTitle}
                    </span>
                  </div>

                  {/* Status Badge */}
                  {renderStatusBadge(item.statusLabel, item.statusType)}
                </div>

                {/* Quote Block */}
                <div
                  className="p-3 rounded-2 text-dark bg-light bg-opacity-70 d-flex align-items-start gap-2.5 my-1"
                  style={{ fontSize: '13.5px', lineHeight: 1.6 }}
                >
                  <i className="bi bi-quote fs-4 text-primary opacity-50 flex-shrink-0" style={{ marginTop: '-4px' }} />
                  <span className="fst-italic">{item.quote}</span>
                </div>

                {/* Teacher Meta */}
                <div className="d-flex align-items-center gap-2 text-muted small" style={{ fontSize: '12.5px' }}>
                  <div
                    className="rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center flex-shrink-0"
                    style={{ width: 22, height: 22, fontSize: '11px' }}
                  >
                    <i className="bi bi-person-fill" />
                  </div>
                  <span>Evaluator: <strong className="text-dark">{item.teacherName}</strong></span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-5 text-center text-muted">
            <i className="bi bi-chat-square-dots fs-1 d-block mb-2 text-secondary opacity-50" />
            <h6 className="fw-semibold text-dark mb-1">No evaluations or feedback found</h6>
            <small className="text-muted">
              {searchTerm
                ? 'Try adjusting your search keywords.'
                : 'No evaluations have been recorded for this class yet.'}
            </small>
          </div>
        )}
      </div>
    </details>
  );
}

export default ClassEvaluationsSection;
