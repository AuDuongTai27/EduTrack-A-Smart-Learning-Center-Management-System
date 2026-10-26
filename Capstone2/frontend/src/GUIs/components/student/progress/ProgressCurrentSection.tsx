import React, { useState } from 'react';
import { CURRENT_PROGRESS_CLASSES, type ProgressClassItem } from './progressData';
import { ProgressClassAccordion } from './components/ProgressClassAccordion';

export interface ProgressCurrentSectionProps {
  classes?: ProgressClassItem[];
}

export function ProgressCurrentSection({ classes = CURRENT_PROGRESS_CLASSES }: ProgressCurrentSectionProps) {
  const [openCards, setOpenCards] = useState<Record<string, boolean>>({
    card1: true,
  });

  const toggleCard = (id: string) => {
    setOpenCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <section className="mb-5">
      <div className="progress-section-header">
        <div>
          <h2 className="progress-section-title">Tiến độ hiện tại</h2>
          <div className="progress-section-subtitle">
            {classes.length} lớp đang học &middot; Học kỳ 1
          </div>
        </div>
        <div className="live-studying-badge">
          <span className="live-dot-ping">
            <span className="ping"></span>
            <span className="dot"></span>
          </span>
          <span>Đang học</span>
        </div>
      </div>

      {classes.map((cls) => (
        <ProgressClassAccordion
          key={cls.id}
          item={cls}
          isOpen={!!openCards[cls.id]}
          onToggle={() => toggleCard(cls.id)}
        />
      ))}
    </section>
  );
};

export default ProgressCurrentSection;
