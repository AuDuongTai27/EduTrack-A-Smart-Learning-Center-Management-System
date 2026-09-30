import React, { useState } from 'react';
import { TuitionPageHeader } from '../../components/student/tuition/TuitionPageHeader';
import { TuitionBillCard } from '../../components/student/tuition/TuitionBillCard';
import { TuitionPaymentCTA } from '../../components/student/tuition/TuitionPaymentCTA';
import { TuitionHistorySection } from '../../components/student/tuition/TuitionHistorySection';
import { TuitionPaymentModal } from '../../components/student/tuition/TuitionPaymentModal';

export const StudentTuitionPage: React.FC = () => {
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  return (
    <main className="main-content">
      <div className="content-container tuition-container">
        {/* 1. Breadcrumbs & Page Header */}
        <TuitionPageHeader />

        {/* 2. Bill Card (2-Column Grid) */}
        <TuitionBillCard />

        {/* 3. Payment CTA Action */}
        <TuitionPaymentCTA onPayNow={() => setModalOpen(true)} />

        {/* 4. Payment History Section */}
        <TuitionHistorySection />
      </div>

      {/* Payment Modal */}
      <TuitionPaymentModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </main>
  );
};

export default StudentTuitionPage;
