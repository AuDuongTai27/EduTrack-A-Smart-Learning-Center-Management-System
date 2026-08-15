/**
 * EduTrack - Tuition & Payment JavaScript Controller
 */

document.addEventListener('DOMContentLoaded', () => {
  const btnPayNow = document.getElementById('btnPayNow');
  const paymentModalEl = document.getElementById('paymentModal');

  if (btnPayNow && paymentModalEl) {
    const paymentModal = new bootstrap.Modal(paymentModalEl);

    btnPayNow.addEventListener('click', () => {
      paymentModal.show();
    });
  }

  // Payment Method Selection & Dynamic Checkmark Icon
  const methodCards = document.querySelectorAll('.payment-method-card');
  methodCards.forEach((card) => {
    card.addEventListener('click', () => {
      methodCards.forEach(c => {
        c.classList.remove('active');
        const checkIcon = c.querySelector('.method-check-icon');
        if (checkIcon) {
          checkIcon.classList.add('d-none');
        }
      });

      card.classList.add('active');
      const activeCheck = card.querySelector('.method-check-icon');
      if (activeCheck) {
        activeCheck.classList.remove('d-none');
      }
    });
  });

  // Confirm Payment Button
  const btnConfirmPayment = document.getElementById('btnConfirmPayment');
  if (btnConfirmPayment) {
    btnConfirmPayment.addEventListener('click', () => {
      btnConfirmPayment.disabled = true;
      btnConfirmPayment.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status"></span>Đang xử lý giao dịch...';

      setTimeout(() => {
        alert('🎉 Thanh toán thành công 7.500.000 đ! Hóa đơn điện tử đã được gửi đến email học sinh.');
        const modalInstance = bootstrap.Modal.getInstance(paymentModalEl);
        if (modalInstance) {
          modalInstance.hide();
        }
        btnConfirmPayment.disabled = false;
        btnConfirmPayment.innerHTML = 'Xác nhận thanh toán';
      }, 1200);
    });
  }
});
