/**
 * EduTrack - Progress (Tiến độ học tập) JavaScript Controller
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Accordion Class Cards Toggle
  const classCards = document.querySelectorAll('.class-accordion-card');

  classCards.forEach((card) => {
    const headerBtn = card.querySelector('.class-row-header-btn');
    if (headerBtn) {
      headerBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const isOpen = card.classList.contains('is-open');

        // Toggle current card
        if (isOpen) {
          card.classList.remove('is-open');
        } else {
          card.classList.add('is-open');
        }
      });
    }
  });

  // 2. Past History Progress Toggle
  const btnTogglePast = document.getElementById('btnTogglePast');
  const pastHistoryContainer = document.getElementById('pastHistoryContainer');
  const togglePastText = document.getElementById('togglePastText');

  if (btnTogglePast && pastHistoryContainer) {
    btnTogglePast.addEventListener('click', () => {
      const isOpen = pastHistoryContainer.classList.contains('is-open');

      if (isOpen) {
        pastHistoryContainer.classList.remove('is-open');
        btnTogglePast.classList.remove('is-open');
        if (togglePastText) {
          togglePastText.textContent = 'Xem tiến độ trước đây';
        }
      } else {
        pastHistoryContainer.classList.add('is-open');
        btnTogglePast.classList.add('is-open');
        if (togglePastText) {
          togglePastText.textContent = 'Ẩn tiến độ trước đây';
        }

        // Smooth scroll to past section
        pastHistoryContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }
});
