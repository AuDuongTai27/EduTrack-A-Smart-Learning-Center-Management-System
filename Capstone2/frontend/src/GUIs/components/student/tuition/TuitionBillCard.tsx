import React from 'react';

export const TuitionBillCard: React.FC = () => {
  return (
    <div className="bill-card">
      <div className="bill-accent-bar"></div>
      <div className="bill-grid-layout">
        {/* Left Column: Total Due */}
        <div className="bill-left-col">
          <div className="bill-total-label">Tổng tiền cần đóng</div>
          <div className="bill-hero-amount">7.500.000 đ</div>

          <div className="bill-meta-lines">
            <div className="bill-meta-item">
              <span className="bill-meta-title">Kỳ đóng:</span>
              <span className="bill-meta-value">Tháng 8 / 2026</span>
            </div>
            <div className="bill-meta-item">
              <span className="bill-meta-title">Hạn đóng:</span>
              <span className="bill-meta-due-date">15/08/2026</span>
            </div>
          </div>

          <div className="mt-auto">
            <div className="bill-remaining-chip">
              <i className="bi bi-info-circle-fill"></i>
              <span>Còn 8 ngày để thanh toán</span>
            </div>
          </div>
        </div>

        {/* Right Column: Breakdown */}
        <div className="bill-right-col">
          <div className="breakdown-heading-row">
            <h2 className="breakdown-heading">Chi phí từng phần</h2>
            <i
              className="bi bi-info-circle text-muted"
              title="Chi tiết các khoản phí trong kỳ học"
            ></i>
          </div>

          <div className="breakdown-list">
            <div className="breakdown-item-row">
              <span className="breakdown-item-name">Lớp Toán 9A – Đại Số</span>
              <span className="breakdown-item-amount">3.500.000 đ</span>
            </div>
            <div className="breakdown-item-row">
              <span className="breakdown-item-name">Lớp Vật Lý 9B – Cơ Học</span>
              <span className="breakdown-item-amount">2.000.000 đ</span>
            </div>
            <div className="breakdown-item-row">
              <span className="breakdown-item-name">Lớp Tiếng Anh – Giao Tiếp</span>
              <span className="breakdown-item-amount">1.500.000 đ</span>
            </div>
            <div className="breakdown-item-row">
              <span className="breakdown-item-name">Tài liệu học tập</span>
              <span className="breakdown-item-amount">300.000 đ</span>
            </div>
            <div className="breakdown-item-row">
              <span className="breakdown-item-name">Phí quản lý nền tảng</span>
              <span className="breakdown-item-amount">200.000 đ</span>
            </div>
          </div>

          <div className="breakdown-totals-box">
            <div className="breakdown-subtotal-row">
              <span>Tạm tính (Sub-total)</span>
              <span className="fw-semibold">7.500.000 đ</span>
            </div>
            <div className="breakdown-total-row">
              <span className="breakdown-total-label">Tổng cộng (Total)</span>
              <span className="breakdown-total-val">7.500.000 đ</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TuitionBillCard;
