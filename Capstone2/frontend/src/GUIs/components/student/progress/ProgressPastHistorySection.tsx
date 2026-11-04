import React, { useState } from 'react';
import { PAST_PROGRESS_CLASSES } from './progressData';
import { ProgressClassAccordion } from './components/ProgressClassAccordion';

export function ProgressPastHistorySection() {
  const [showPast, setShowPast] = useState(true);
  const [openCards, setOpenCards] = useState<Record<string, boolean>>(() => {
    const firstId = PAST_PROGRESS_CLASSES[0]?.id || 'card4';
    return { [firstId]: true };
  });

  const toggleCard = (id: string) => {
    setOpenCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const totalPastSessions = PAST_PROGRESS_CLASSES.reduce(
    (sum, item) => sum + item.total,
    0
  );
  const totalPastAttended = PAST_PROGRESS_CLASSES.reduce(
    (sum, item) => sum + item.attended,
    0
  );
  const avgPastRate =
    totalPastSessions > 0
      ? Math.round((totalPastAttended / totalPastSessions) * 100)
      : 100;

  return (
    <section className="past-progress-section pb-5 mb-4">
      {/* Section Header đồng bộ với Tiến độ hiện tại */}
      <div className="progress-section-header">
        <div>
          <h2 className="progress-section-title">Lớp đã học xong</h2>
          <div className="progress-section-subtitle">
            {PAST_PROGRESS_CLASSES.length} khóa học đã hoàn thành &middot; Tất cả các kỳ trước &middot; Chuyên cần đạt {avgPastRate}%
          </div>
        </div>

        <div className="d-flex align-items-center gap-2 flex-wrap">
          <div className="past-completed-summary-badge d-none d-sm-inline-flex">
            <i className="bi bi-award-fill"></i>
            <span>Đã hoàn tất {totalPastAttended}/{totalPastSessions} buổi</span>
          </div>

          <button
            type="button"
            className={`btn-toggle-past-classes ${showPast ? 'is-open' : ''}`}
            id="btnTogglePastClasses"
            onClick={() => setShowPast((prev) => !prev)}
          >
            <i className={`bi ${showPast ? 'bi-eye-slash' : 'bi-clock-history'}`}></i>
            <span>{showPast ? 'Thu gọn danh sách' : `Xem ${PAST_PROGRESS_CLASSES.length} lớp đã học`}</span>
            <i className={`bi bi-chevron-down toggle-arrow ${showPast ? 'rotate' : ''}`}></i>
          </button>
        </div>
      </div>

      {/* Khi thu gọn: Hiển thị thẻ tóm tắt gọn gàng, đồng bộ với layout card */}
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
                Hồ sơ các khóa học đã kết thúc ({PAST_PROGRESS_CLASSES.length} lớp học)
              </div>
              <div className="past-preview-subtitle">
                Bao gồm: {PAST_PROGRESS_CLASSES.map((c) => c.className).join(', ')} &middot; Nhấn để xem lại toàn bộ nhận xét tổng kết
              </div>
            </div>
          </div>
          <span className="past-preview-action">
            Mở rộng <i className="bi bi-chevron-right ms-1"></i>
          </span>
        </div>
      )}

      {/* Khi mở rộng: Danh sách các lớp đã hoàn thành */}
      <div
        className={`past-history-container ${showPast ? 'is-open' : ''}`}
        id="pastHistoryContainer"
      >
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
}

export default ProgressPastHistorySection;
