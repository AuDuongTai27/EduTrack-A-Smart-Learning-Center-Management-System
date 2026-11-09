import React, { useState, useEffect } from 'react';
import {
  CURRENT_PROGRESS_CLASSES,
  type ProgressClassItem,
  type ProgressFeedbackFilter,
  isEvaluationFeedback,
  isAssignmentFeedback,
} from './progressData';
import { ProgressClassAccordion } from './components/ProgressClassAccordion';

export interface ProgressCurrentSectionProps {
  classes?: ProgressClassItem[];
}

export function ProgressCurrentSection({ classes = CURRENT_PROGRESS_CLASSES }: ProgressCurrentSectionProps) {
  const [openCards, setOpenCards] = useState<Record<string, boolean>>(() => {
    const firstId = classes[0]?.id || 'card1';
    return { [firstId]: true };
  });

  const [filter, setFilter] = useState<ProgressFeedbackFilter>('all');

  useEffect(() => {
    if (classes.length > 0) {
      const firstId = classes[0].id;
      setOpenCards((prev) => (Object.keys(prev).length === 0 || !prev[firstId] ? { [firstId]: true } : prev));
    }
  }, [classes]);

  const toggleCard = (id: string) => {
    setOpenCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

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
    <section className="mb-4">
      <div className="progress-section-header flex-wrap gap-2">
        <div>
          <h2 className="progress-section-title">Tiến độ hiện tại</h2>
          <div className="progress-section-subtitle">
            {classes.length} lớp đang học &middot; Học kỳ hiện tại
          </div>
        </div>

        <div className="d-flex align-items-center gap-2 flex-wrap">
          <div className="progress-filter-tabs">
            <button
              type="button"
              className={`progress-filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              <span>Tất cả</span>
              <span className="progress-filter-count">{totalFeedbacks}</span>
            </button>
            <button
              type="button"
              className={`progress-filter-btn ${filter === 'evaluation' ? 'active' : ''}`}
              onClick={() => setFilter('evaluation')}
            >
              <i className="bi bi-person-badge-fill me-1"></i>
              <span>Đánh giá</span>
              <span className="progress-filter-count">{totalEvaluations}</span>
            </button>
            <button
              type="button"
              className={`progress-filter-btn ${filter === 'assignment' ? 'active' : ''}`}
              onClick={() => setFilter('assignment')}
            >
              <i className="bi bi-journal-check me-1"></i>
              <span>Bài tập</span>
              <span className="progress-filter-count">{totalAssignments}</span>
            </button>
          </div>

          <div className="live-studying-badge">
            <span className="live-dot-ping">
              <span className="ping"></span>
              <span className="dot"></span>
            </span>
            <span>Đang học</span>
          </div>
        </div>
      </div>

      {classes.map((cls) => (
        <ProgressClassAccordion
          key={cls.id}
          item={cls}
          isOpen={!!openCards[cls.id]}
          onToggle={() => toggleCard(cls.id)}
          parentFilter={filter}
        />
      ))}
    </section>
  );
}

export default ProgressCurrentSection;
