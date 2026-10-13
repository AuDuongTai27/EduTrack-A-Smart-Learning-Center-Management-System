import React, { useState } from 'react';
import { useParent } from '../../context/ParentContext';
import { TuitionBillCard } from '../../components/student/tuition/TuitionBillCard';
import { TuitionPaymentCTA } from '../../components/student/tuition/TuitionPaymentCTA';
import { TuitionHistorySection } from '../../components/student/tuition/TuitionHistorySection';
import { TuitionPaymentModal } from '../../components/student/tuition/TuitionPaymentModal';

export const ParentTuitionPage: React.FC = () => {
  const { selectedChild } = useParent();
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  if (!selectedChild) {
    return null;
  }

  return (
    <main className="main-content">
      <div className="content-container tuition-container">
        {/* 1. Header Dành Cho Phụ Huynh */}
        <div className="page-header d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
          <div>
            <h1 className="page-title mb-1">Học phí của con</h1>
            <p className="page-subtitle text-muted mb-0">
              Quản lý và thanh toán học phí trực tuyến cho bé <strong>{selectedChild.name}</strong> ({selectedChild.grade})
            </p>
          </div>

          <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-2 rounded-pill fw-semibold">
            <i className="bi bi-person-check me-1"></i> Hồ sơ: {selectedChild.name}
          </span>
        </div>

        {/* 2. Bill Card (Hóa đơn học phí hiện tại) */}
        <TuitionBillCard />

        {/* 3. Payment CTA Action (DÀNH RIÊNG CHO PHỤ HUYNH CÓ NÚT THANH TOÁN) */}
        <TuitionPaymentCTA onPayNow={() => setModalOpen(true)} />

        {/* 4. Payment History Section (Lịch sử các giao dịch) */}
        <TuitionHistorySection />
      </div>

      {/* Payment Modal (Modal cổng thanh toán online VNPay, MoMo, Ngân hàng) */}
      <TuitionPaymentModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </main>
  );
};

export default ParentTuitionPage;
