/**
 * EduTrack - Main JavaScript File
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Format today's date in Vietnamese for Welcome Banner
  const dateElement = document.getElementById('currentDateText');
  if (dateElement) {
    const now = new Date();
    try {
      const formattedDate = now.toLocaleDateString('vi-VN', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
      // Capitalize first letter
      dateElement.textContent = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
    } catch (e) {
      dateElement.textContent = 'Hôm nay';
    }
  }

  // 2. Auto-close mobile offcanvas on link click
  const offcanvasElement = document.getElementById('mobileSidebar');
  if (offcanvasElement && typeof bootstrap !== 'undefined') {
    const offcanvasInstance = bootstrap.Offcanvas.getOrCreateInstance(offcanvasElement);
    const mobileLinks = offcanvasElement.querySelectorAll('.sidebar-nav-link, .student-chip');
    
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        offcanvasInstance.hide();
      });
    });
  }

  // 3. Initialize any Bootstrap Tooltips if present
  if (typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
  }
});
