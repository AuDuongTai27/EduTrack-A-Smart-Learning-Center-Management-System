import React, { useState } from 'react';

export const ProgressPastHistorySection: React.FC = () => {
  const [showPast, setShowPast] = useState<boolean>(false);
  const [openCards, setOpenCards] = useState<Record<string, boolean>>({
    card4: false,
    card5: false,
  });

  const toggleCard = (key: string) => {
    setOpenCards((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <>
{/* 4. Past Progress History Section */}
          <div className="d-flex justify-content-center mb-4">
            <button type="button" className={`btn-toggle-past ${showPast ? "is-open" : ""}`} id="btnTogglePast" onClick={() => setShowPast(p => !p)}>
              <i className="bi bi-clock-history"></i>
              <span id="togglePastText">{showPast ? "Ẩn tiến độ trước đây" : "Xem tiến độ trước đây"}</span>
              <i className="bi bi-chevron-down"></i>
            </button>
          </div>

          <div className={`past-history-container ${showPast ? "is-open" : ""}`} id="pastHistoryContainer">
            <div className="past-divider-row">
              <div className="past-divider-line"></div>
              <div className="past-divider-pill">
                <i className="bi bi-archive-fill"></i>
                <span>Lịch sử tiến độ</span>
              </div>
              <div className="past-divider-line"></div>
            </div>

            {/* Class 4 (Past): Lớp Hóa học 9A */}
            <div className={`class-accordion-card prog-orange ${openCards.card4 ? "is-open" : ""}`}>
              <button type="button" className="class-row-header-btn" onClick={() => toggleCard("card4")}>
                <div className="class-subject-icon-box">
                  <i className="bi bi-droplet"></i>
                </div>
                <div className="class-row-center-info">
                  <div className="class-title-meta">
                    <span className="class-main-name">Lớp Hóa học 9A</span>
                    <span className="class-meta-sep">&middot;</span>
                    <span className="class-subject-name">Hóa học</span>
                    <span className="completed-tag">Đã hoàn thành</span>
                  </div>
                  <div className="attendance-bar-wrap">
                    <div className="attendance-progress-track">
                      <div className="attendance-progress-fill" style={{ width: '100%' }}></div>
                    </div>
                    <div className="attendance-counts-text">
                      20<span className="sep">/</span>20<span className="pct-text">(100%)</span>
                    </div>
                  </div>
                </div>
                <div className="class-attendance-right-meta d-none d-md-flex">
                  <span className="count-num">20/20</span>
                  <span className="count-label">buổi điểm danh</span>
                </div>
                <div className="class-pct-square-badge d-none d-sm-flex">
                  100%
                </div>
                <div className="class-chevron-circle">
                  <i className="bi bi-chevron-down"></i>
                </div>
              </button>

              <div className="class-accordion-body">
                <div className="accordion-sub-header">
                  <div className="accordion-sub-dot"></div>
                  <span className="accordion-sub-title">Nhận xét từ giáo viên (2)</span>
                </div>
                <div className="feedback-list">
                  {/* Item 1 */}
                  <div className="feedback-row-item">
                    <div className="feedback-left-line"></div>
                    <div className="feedback-content">
                      <h3 className="feedback-asg-title">Bài tập cuối khóa — Chương 5</h3>
                      <div className="feedback-quote-row">
                        <i className="bi bi-quote"></i>
                        <p className="feedback-quote-text">Hoàn thành xuất sắc, nắm vững kiến thức toàn bộ chương trình hóa đại cương.</p>
                      </div>
                      <div className="feedback-teacher-meta">
                        <div className="teacher-mini-circle"><i className="bi bi-person-fill"></i></div>
                        <span className="teacher-mini-name">Thầy Đức</span>
                      </div>
                    </div>
                    <span className="progress-status-badge psb-dat">
                      <i className="bi bi-check2-all"></i> Đạt
                    </span>
                  </div>
                  {/* Item 2 */}
                  <div className="feedback-row-item">
                    <div className="feedback-left-line"></div>
                    <div className="feedback-content">
                      <h3 className="feedback-asg-title">Kiểm tra cuối kỳ</h3>
                      <div className="feedback-quote-row">
                        <i className="bi bi-quote"></i>
                        <p className="feedback-quote-text">Điểm 9/10 — Xuất sắc! Em có năng khiếu rõ ràng với môn này.</p>
                      </div>
                      <div className="feedback-teacher-meta">
                        <div className="teacher-mini-circle"><i className="bi bi-person-fill"></i></div>
                        <span className="teacher-mini-name">Thầy Đức</span>
                      </div>
                    </div>
                    <span className="progress-status-badge psb-dat">
                      <i className="bi bi-check2-all"></i> Đạt
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Class 5 (Past): Lớp Ngữ văn 9B */}
            <div className={`class-accordion-card prog-rose ${openCards.card5 ? "is-open" : ""}`}>
              <button type="button" className="class-row-header-btn" onClick={() => toggleCard("card5")}>
                <div className="class-subject-icon-box">
                  <i className="bi bi-journal-text"></i>
                </div>
                <div className="class-row-center-info">
                  <div className="class-title-meta">
                    <span className="class-main-name">Lớp Ngữ văn 9B</span>
                    <span className="class-meta-sep">&middot;</span>
                    <span className="class-subject-name">Ngữ văn</span>
                    <span className="completed-tag">Đã hoàn thành</span>
                  </div>
                  <div className="attendance-bar-wrap">
                    <div className="attendance-progress-track">
                      <div className="attendance-progress-fill" style={{ width: '78%' }}></div>
                    </div>
                    <div className="attendance-counts-text">
                      14<span className="sep">/</span>18<span className="pct-text">(78%)</span>
                    </div>
                  </div>
                </div>
                <div className="class-attendance-right-meta d-none d-md-flex">
                  <span className="count-num">14/18</span>
                  <span className="count-label">buổi điểm danh</span>
                </div>
                <div className="class-pct-square-badge d-none d-sm-flex">
                  78%
                </div>
                <div className="class-chevron-circle">
                  <i className="bi bi-chevron-down"></i>
                </div>
              </button>

              <div className="class-accordion-body">
                <div className="accordion-sub-header">
                  <div className="accordion-sub-dot"></div>
                  <span className="accordion-sub-title">Nhận xét từ giáo viên (2)</span>
                </div>
                <div className="feedback-list">
                  {/* Item 1 */}
                  <div className="feedback-row-item">
                    <div className="feedback-left-line"></div>
                    <div className="feedback-content">
                      <h3 className="feedback-asg-title">Phân tích tác phẩm: Truyện Kiều</h3>
                      <div className="feedback-quote-row">
                        <i className="bi bi-quote"></i>
                        <p className="feedback-quote-text">Cần đào sâu hơn vào tầng nghĩa biểu tượng, phần dẫn chứng còn hạn chế.</p>
                      </div>
                      <div className="feedback-teacher-meta">
                        <div className="teacher-mini-circle"><i className="bi bi-person-fill"></i></div>
                        <span className="teacher-mini-name">Cô Mai</span>
                      </div>
                    </div>
                    <span className="progress-status-badge psb-caithien">
                      <i className="bi bi-exclamation-circle"></i> Cần cải thiện
                    </span>
                  </div>
                  {/* Item 2 */}
                  <div className="feedback-row-item">
                    <div className="feedback-left-line"></div>
                    <div className="feedback-content">
                      <h3 className="feedback-asg-title">Kiểm tra cuối kỳ</h3>
                      <div className="feedback-quote-row">
                        <i className="bi bi-quote"></i>
                        <p className="feedback-quote-text">Bài làm tương đối tốt, đạt yêu cầu của chương trình.</p>
                      </div>
                      <div className="feedback-teacher-meta">
                        <div className="teacher-mini-circle"><i className="bi bi-person-fill"></i></div>
                        <span className="teacher-mini-name">Cô Mai</span>
                      </div>
                    </div>
                    <span className="progress-status-badge psb-dat">
                      <i className="bi bi-check2-all"></i> Đạt
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="past-footer-note">
              2 lớp đã hoàn thành &middot; Học kỳ 2 &middot; Năm học 2024–2025
            </div>
          </div>
    </>
  );
};

export default ProgressPastHistorySection;
