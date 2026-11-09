import React, { useState, useEffect } from 'react';
import type { ProgressClassItem } from './progressData';
import { ProgressClassAccordion } from './components/ProgressClassAccordion';

export interface ProgressPastHistorySectionProps {
  classes?: ProgressClassItem[];
}

export function ProgressPastHistorySection({ classes = [] }: ProgressPastHistorySectionProps) {
  const [showPast, setShowPast] = useState(true);
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

  return (
    <section className="past-progress-section pb-5 mb-4">
      {/* Section Header đồng bộ với Tiến độ hiện tại */}
      <div className="progress-section-header">
        <div>
          <h2 className="progress-section-title">Lớp đã học xong</h2>
          <div className="progress-section-subtitle">
            {classes.length > 0
              ? `${classes.length} khóa học đã hoàn thành · Tất cả các kỳ trước · Chuyên cần đạt ${avgPastRate}%`
              : '0 khóa học đã hoàn thành · Tất cả các kỳ trước'}
          </div>
        </div>

        {classes.length > 0 && (
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
              <span>{showPast ? 'Thu gọn danh sách' : `Xem ${classes.length} lớp đã học`}</span>
              <i className={`bi bi-chevron-down toggle-arrow ${showPast ? 'rotate' : ''}`}></i>
            </button>
          </div>
        )}
      </div>

      {/* Khi không có lớp nào hoàn thành */}
      {classes.length === 0 ? (
        <div className="past-empty-state">
          <div className="past-empty-icon-box">
            <i className="bi bi-mortarboard-fill"></i>
          </div>
          <h6 className="past-empty-title">Chưa có khóa học nào đã kết thúc</h6>
          <p className="past-empty-desc">
            Học sinh hiện đang tham gia các lớp học trong chương trình hiện tại. Khi khóa học hoàn thành, toàn bộ hồ sơ chuyên cần và nhận xét tổng kết sẽ được lưu trữ tại đây.
          </p>
        </div>
      ) : (
        <>
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
                    Hồ sơ các khóa học đã kết thúc ({classes.length} lớp học)
                  </div>
                  <div className="past-preview-subtitle">
                    Bao gồm: {classes.map((c) => c.className).join(', ')} &middot; Nhấn để xem lại toàn bộ nhận xét tổng kết
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
            {classes.map((cls) => (
              <ProgressClassAccordion
                key={cls.id}
                item={cls}
                isOpen={!!openCards[cls.id]}
                onToggle={() => toggleCard(cls.id)}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

export default ProgressPastHistorySection;
