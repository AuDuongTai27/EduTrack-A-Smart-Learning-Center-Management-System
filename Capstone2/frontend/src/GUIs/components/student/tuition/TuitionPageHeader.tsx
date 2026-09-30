import React from 'react';
import { Link } from 'react-router-dom';

export const TuitionPageHeader: React.FC = () => {
  return (
    <div className="mb-4">
      <div className="d-flex align-items-center gap-2 text-muted small mb-2">
        <Link to="/student/dashboard" className="text-decoration-none text-muted">
          Trang chủ
        </Link>
        <i className="bi bi-chevron-right" style={{ fontSize: '10px' }}></i>
        <span className="text-primary fw-semibold">Học phí và Thanh toán</span>
      </div>
      <h1 className="page-title fs-3 fw-bold">Học phí và Thanh toán</h1>
      <p className="page-subtitle">
        Kỳ học <span className="fw-semibold text-dark">Tháng 8 / 2026</span> · Xem chi tiết chi phí và lịch sử đóng học phí của bạn.
      </p>
    </div>
  );
};

export default TuitionPageHeader;
