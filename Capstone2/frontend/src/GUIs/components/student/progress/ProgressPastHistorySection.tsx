import React, { useState } from 'react';
import { PAST_PROGRESS_CLASSES } from './progressData';
import { ProgressClassAccordion } from './components/ProgressClassAccordion';

export function ProgressPastHistorySection() {
  const [showPast, setShowPast] = useState(false);
  const [openCards, setOpenCards] = useState<Record<string, boolean>>({});

  const toggleCard = (id: string) => {
    setOpenCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <section>
      <div className="past-classes-toggle-wrapper">
        <button
          type="button"
          className="btn-toggle-past-classes"
          id="btnTogglePastClasses"
          onClick={() => setShowPast(!showPast)}
        >
          <div className="toggle-left-info">
            <div className="toggle-icon-box">
              <i className="bi bi-clock-history"></i>
            </div>
            <div>
              <span className="toggle-title">Lớp đã học xong</span>
              <span className="toggle-meta">
                &middot; {PAST_PROGRESS_CLASSES.length} lớp &middot; Học kỳ trước
              </span>
            </div>
          </div>
          <i className={`bi bi-chevron-down toggle-arrow ${showPast ? 'rotate' : ''}`}></i>
        </button>
      </div>

      <div className={`past-history-container ${showPast ? 'is-open' : ''}`} id="pastHistoryContainer">
        <div className="past-divider-row">
          <div className="past-divider-line"></div>
          <div className="past-divider-pill">
            <i className="bi bi-archive-fill"></i>
            <span>Lịch sử tiến độ</span>
          </div>
          <div className="past-divider-line"></div>
        </div>

        {PAST_PROGRESS_CLASSES.map((cls) => (
          <ProgressClassAccordion
            key={cls.id}
            item={cls}
            isOpen={!!openCards[cls.id]}
            onToggle={() => toggleCard(cls.id)}
          />
        ))}
      </div>
    </section>
  );
};

export default ProgressPastHistorySection;
