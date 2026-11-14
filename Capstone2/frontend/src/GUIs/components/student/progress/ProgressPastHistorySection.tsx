import React, { useState, useEffect } from 'react';
import {
  type ProgressClassItem,
  type ProgressFeedbackFilter,
  isEvaluationFeedback,
  isAssignmentFeedback,
} from './progressData';
import { ProgressClassAccordion } from './components/ProgressClassAccordion';

export interface ProgressPastHistorySectionProps {
  classes?: ProgressClassItem[];
}

export function ProgressPastHistorySection({ classes = [] }: ProgressPastHistorySectionProps) {
  const [showPast, setShowPast] = useState(true);
  const [filter, setFilter] = useState<ProgressFeedbackFilter>('all');
  const [openCards, setOpenCards] = useState<Record<string, boolean>>(() => {
    const firstId = classes[0]?.id;
    return firstId ? { [firstId]: true } : {};
  });

  useEffect(() => {
    if (classes.length > 0) {
      const firstId = classes[0].id;
      setOpenCards((prev) => (Object.keys(prev).length === 0 || !prev[firstId] ? { [firstId]: true } : prev));
    }
  }, [classes]);

  const toggleCard = (id: string) => {
    setOpenCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const totalPastSessions = classes.reduce(
    (sum, item) => sum + item.total,
    0
  );
  const totalPastAttended = classes.reduce(
    (sum, item) => sum + item.attended,
    0
  );
  const avgPastRate =
    totalPastSessions > 0
      ? Math.round((totalPastAttended / totalPastSessions) * 100)
      : 100;

  const totalFeedbacks = classes.reduce((sum, c) => sum + c.feedbacks.length, 0);
  const totalEvaluations = classes.reduce(
    (sum, c) => sum + c.feedbacks.filter(isEvaluationFeedback).length,
    0
  );
  const totalAssignments = classes.reduce(
    (sum, c) => sum + c.feedbacks.filter(isAssignmentFeedback).length,
    0
  );

  return (
    <section className="past-progress-section pb-5 mb-4">
      {/* Section Header synced with Current Progress */}
      <div className="progress-section-header flex-wrap gap-2">
        <div>
          <h2 className="progress-section-title">Completed Classes</h2>
          <div className="progress-section-subtitle">
            {classes.length > 0
              ? `${classes.length} completed ${classes.length === 1 ? 'course' : 'courses'} · All previous terms · Attendance rate ${avgPastRate}%`
              : '0 completed courses · All previous terms'}
          </div>
        </div>

        {classes.length > 0 && (
          <div className="d-flex align-items-center gap-2 flex-wrap">
            {showPast && totalFeedbacks > 0 && (
              <div className="progress-filter-tabs">
                <button
                  type="button"
                  className={`progress-filter-btn ${filter === 'all' ? 'active' : ''}`}
                  onClick={() => setFilter('all')}
                >
                  <span>All</span>
                  <span className="progress-filter-count">{totalFeedbacks}</span>
                </button>
                <button
                  type="button"
                  className={`progress-filter-btn ${filter === 'evaluation' ? 'active' : ''}`}
                  onClick={() => setFilter('evaluation')}
                >
                  <i className="bi bi-person-badge-fill me-1"></i>
                  <span>Evaluations</span>
                  <span className="progress-filter-count">{totalEvaluations}</span>
                </button>
                <button
                  type="button"
                  className={`progress-filter-btn ${filter === 'assignment' ? 'active' : ''}`}
                  onClick={() => setFilter('assignment')}
                >
                  <i className="bi bi-journal-check me-1"></i>
                  <span>Assignments</span>
                  <span className="progress-filter-count">{totalAssignments}</span>
                </button>
              </div>
            )}

            <div className="past-completed-summary-badge d-none d-sm-inline-flex">
              <i className="bi bi-award-fill"></i>
              <span>Completed {totalPastAttended}/{totalPastSessions} sessions</span>
            </div>

            <button
              type="button"
              className={`btn-toggle-past-classes ${showPast ? 'is-open' : ''}`}
              id="btnTogglePastClasses"
              onClick={() => setShowPast((prev) => !prev)}
            >
              <i className={`bi ${showPast ? 'bi-eye-slash' : 'bi-clock-history'}`}></i>
              <span>{showPast ? 'Collapse list' : `View ${classes.length} completed ${classes.length === 1 ? 'class' : 'classes'}`}</span>
              <i className={`bi bi-chevron-down toggle-arrow ${showPast ? 'rotate' : ''}`}></i>
            </button>
          </div>
        )}
      </div>

      {/* When no classes are completed */}
      {classes.length === 0 ? (
        <div className="past-empty-state">
          <div className="past-empty-icon-box">
            <i className="bi bi-mortarboard-fill"></i>
          </div>
          <h6 className="past-empty-title">No completed courses yet</h6>
          <p className="past-empty-desc">
            The student is currently enrolled in classes in the ongoing program. When a course is completed, all attendance records and final evaluations will be archived here.
          </p>
        </div>
      ) : (
        <>
          {/* When collapsed: Display concise summary card matching card layout */}
          {!showPast && (
            <div
              className="past-collapsed-preview-card"
              onClick={() => setShowPast(true)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') setShowPast(true);
              }}
            >
              <div className="d-flex align-items-center gap-3">
                <div className="past-preview-icon-box">
                  <i className="bi bi-archive-fill"></i>
                </div>
                <div>
                  <div className="past-preview-title">
                    Completed Course Records ({classes.length} {classes.length === 1 ? 'class' : 'classes'})
                  </div>
                  <div className="past-preview-subtitle">
                    Includes: {classes.map((c) => c.className).join(', ')} &middot; Click to review all final feedback
                  </div>
                </div>
              </div>
              <span className="past-preview-action">
                Expand <i className="bi bi-chevron-right ms-1"></i>
              </span>
            </div>
          )}

          {/* When expanded: List of completed classes */}
          <div
            className={`past-history-container ${showPast ? 'is-open' : ''}`}
            id="pastHistoryContainer"
          >
            {classes.map((cls) => (
              <ProgressClassAccordion
                key={cls.id}
                item={cls}
                isOpen={!!openCards[cls.id]}
                onToggle={() => toggleCard(cls.id)}
                parentFilter={filter}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

export default ProgressPastHistorySection;
