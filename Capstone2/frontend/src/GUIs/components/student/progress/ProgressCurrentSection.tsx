import React, { useState } from 'react';

export const ProgressCurrentSection: React.FC = () => {
  const [openCards, setOpenCards] = useState<Record<string, boolean>>({
    card1: true,
    card2: false,
    card3: false,
  });

  const toggleCard = (key: string) => {
    setOpenCards((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <>
{/* 3. Current Classes Section */}
          <section className="mb-5">
            <div className="progress-section-header">
              <div>
                <h2 className="progress-section-title">Tiến độ hiện tại</h2>
                <div className="progress-section-subtitle">3 lớp đang học &middot; Học kỳ 1</div>
              </div>
              <div className="live-studying-badge">
                <span className="live-dot-ping">
                  <span className="ping"></span>
                  <span className="dot"></span>
                </span>
                <span>Đang học</span>
              </div>
            </div>

            {/* Class 1: Lớp Toán 10A */}
            <div className={`class-accordion-card prog-blue ${openCards.card1 ? "is-open" : ""}`}>
              <button type="button" className="class-row-header-btn" onClick={() => toggleCard("card1")}>
                <div className="class-subject-icon-box">
                  <i className="bi bi-calculator"></i>
                </div>
                <div className="class-row-center-info">
                  <div className="class-title-meta">
                    <span className="class-main-name">Lớp Toán 10A</span>
                    <span className="class-meta-sep">&middot;</span>
                    <span className="class-subject-name">Toán học</span>
                  </div>
                  <div className="attendance-bar-wrap">
                    <div className="attendance-progress-track">
                      <div className="attendance-progress-fill" style={{ width: '75%' }}></div>
                    </div>
                    <div className="attendance-counts-text">
                      12<span className="sep">/</span>16<span className="pct-text">(75%)</span>
                    </div>
                  </div>
                </div>
                <div className="class-attendance-right-meta d-none d-md-flex">
                  <span className="count-num">12/16</span>
                  <span className="count-label">buổi điểm danh</span>
                </div>
                <div className="class-pct-square-badge d-none d-sm-flex">
                  75%
                </div>
                <div className="class-chevron-circle">
                  <i className="bi bi-chevron-down"></i>
                </div>
              </button>

              <div className="class-accordion-body">
                <div className="accordion-sub-header">
                  <div className="accordion-sub-dot"></div>
                  <span className="accordion-sub-title">Nhận xét từ giáo viên (3)</span>
                </div>
                <div className="feedback-list">
                  {/* Item 1 */}
                  <div className="feedback-row-item">
                    <div className="feedback-left-line"></div>
                    <div className="feedback-content">
                      <h3 className="feedback-asg-title">Bài tập chương 3: Phương trình bậc hai</h3>
                      <div className="feedback-quote-row">
                        <i className="bi bi-quote"></i>
                        <p className="feedback-quote-text">Em làm bài khá tốt, cần chú ý phần đặt ẩn phụ hơn ở câu cuối.</p>
                      </div>
                      <div className="feedback-teacher-meta">
                        <div className="teacher-mini-circle"><i className="bi bi-person-fill"></i></div>
                        <span className="teacher-mini-name">Cô Hương</span>
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
                      <h3 className="feedback-asg-title">Kiểm tra giữa kỳ</h3>
                      <div className="feedback-quote-row">
                        <i className="bi bi-quote"></i>
                        <p className="feedback-quote-text">Điểm số đạt yêu cầu, nhưng cần ôn luyện thêm phần hình học giải tích.</p>
                      </div>
                      <div className="feedback-teacher-meta">
                        <div className="teacher-mini-circle"><i className="bi bi-person-fill"></i></div>
                        <span className="teacher-mini-name">Cô Hương</span>
                      </div>
                    </div>
                    <span className="progress-status-badge psb-caithien">
                      <i className="bi bi-exclamation-circle"></i> Cần cải thiện
                    </span>
                  </div>
                  {/* Item 3 */}
                  <div className="feedback-row-item">
                    <div className="feedback-left-line"></div>
                    <div className="feedback-content">
                      <h3 className="feedback-asg-title">Bài tập về nhà tuần 8</h3>
                      <div className="feedback-empty-text">Chưa có phản hồi từ giáo viên.</div>
                      <div className="feedback-teacher-meta">
                        <div className="teacher-mini-circle"><i className="bi bi-person-fill"></i></div>
                        <span className="teacher-mini-name">Cô Hương</span>
                      </div>
                    </div>
                    <span className="progress-status-badge psb-chuacoxn">
                      <i className="bi bi-chat-dots"></i> Chưa có nhận xét
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Class 2: Lớp Vật lý 10B */}
            <div className={`class-accordion-card prog-violet ${openCards.card2 ? "is-open" : ""}`}>
              <button type="button" className="class-row-header-btn" onClick={() => toggleCard("card2")}>
                <div className="class-subject-icon-box">
                  <i className="bi bi-lightning-charge"></i>
                </div>
                <div className="class-row-center-info">
                  <div className="class-title-meta">
                    <span className="class-main-name">Lớp Vật lý 10B</span>
                    <span className="class-meta-sep">&middot;</span>
                    <span className="class-subject-name">Vật lý</span>
                  </div>
                  <div className="attendance-bar-wrap">
                    <div className="attendance-progress-track">
                      <div className="attendance-progress-fill" style={{ width: '67%' }}></div>
                    </div>
                    <div className="attendance-counts-text">
                      8<span className="sep">/</span>12<span className="pct-text">(67%)</span>
                    </div>
                  </div>
                </div>
                <div className="class-attendance-right-meta d-none d-md-flex">
                  <span className="count-num">8/12</span>
                  <span className="count-label">buổi điểm danh</span>
                </div>
                <div className="class-pct-square-badge d-none d-sm-flex">
                  67%
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
                      <h3 className="feedback-asg-title">Thực hành chương 2: Động lực học</h3>
                      <div className="feedback-quote-row">
                        <i className="bi bi-quote"></i>
                        <p className="feedback-quote-text">Báo cáo thực hành đầy đủ, trình bày khoa học và rõ ràng. Rất tốt!</p>
                      </div>
                      <div className="feedback-teacher-meta">
                        <div className="teacher-mini-circle"><i className="bi bi-person-fill"></i></div>
                        <span className="teacher-mini-name">Thầy Minh</span>
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
                      <h3 className="feedback-asg-title">Bài tập về nhà tuần 6</h3>
                      <div className="feedback-quote-row">
                        <i className="bi bi-quote"></i>
                        <p className="feedback-quote-text">Cần bổ sung thêm phần giải thích hiện tượng vật lý, không chỉ tính số.</p>
                      </div>
                      <div className="feedback-teacher-meta">
                        <div className="teacher-mini-circle"><i className="bi bi-person-fill"></i></div>
                        <span className="teacher-mini-name">Thầy Minh</span>
                      </div>
                    </div>
                    <span className="progress-status-badge psb-caithien">
                      <i className="bi bi-exclamation-circle"></i> Cần cải thiện
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Class 3: Lớp Tiếng Anh 11C */}
            <div className={`class-accordion-card prog-teal ${openCards.card3 ? "is-open" : ""}`}>
              <button type="button" className="class-row-header-btn" onClick={() => toggleCard("card3")}>
                <div className="class-subject-icon-box">
                  <i className="bi bi-translate"></i>
                </div>
                <div className="class-row-center-info">
                  <div className="class-title-meta">
                    <span className="class-main-name">Lớp Tiếng Anh 11C</span>
                    <span className="class-meta-sep">&middot;</span>
                    <span className="class-subject-name">Tiếng Anh</span>
                  </div>
                  <div className="attendance-bar-wrap">
                    <div className="attendance-progress-track">
                      <div className="attendance-progress-fill" style={{ width: '94%' }}></div>
                    </div>
                    <div className="attendance-counts-text">
                      15<span className="sep">/</span>16<span className="pct-text">(94%)</span>
                    </div>
                  </div>
                </div>
                <div className="class-attendance-right-meta d-none d-md-flex">
                  <span className="count-num">15/16</span>
                  <span className="count-label">buổi điểm danh</span>
                </div>
                <div className="class-pct-square-badge d-none d-sm-flex">
                  94%
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
                      <h3 className="feedback-asg-title">Writing Task: Descriptive Essay</h3>
                      <div className="feedback-quote-row">
                        <i className="bi bi-quote"></i>
                        <p className="feedback-quote-text">Bài viết mạch lạc, từ vựng phong phú và cấu trúc câu đa dạng. Tiếp tục phát huy!</p>
                      </div>
                      <div className="feedback-teacher-meta">
                        <div className="teacher-mini-circle"><i className="bi bi-person-fill"></i></div>
                        <span className="teacher-mini-name">Cô Lan</span>
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
                      <h3 className="feedback-asg-title">Grammar Test — Unit 5</h3>
                      <div className="feedback-empty-text">Chưa có phản hồi từ giáo viên.</div>
                      <div className="feedback-teacher-meta">
                        <div className="teacher-mini-circle"><i className="bi bi-person-fill"></i></div>
                        <span className="teacher-mini-name">Cô Lan</span>
                      </div>
                    </div>
                    <span className="progress-status-badge psb-chuacoxn">
                      <i className="bi bi-chat-dots"></i> Chưa có nhận xét
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </section>
    </>
  );
};

export default ProgressCurrentSection;
