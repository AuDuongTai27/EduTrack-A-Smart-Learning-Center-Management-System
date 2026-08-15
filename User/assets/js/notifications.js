/**
 * EduTrack - Notifications JavaScript Controller
 */

const NOTIFICATIONS = [
  {
    id: 1,
    category: "class",
    title: "Đổi lịch học — Toán Nâng Cao",
    summary: "Buổi học Thứ 3 với Thầy Nguyễn Văn An được chuyển sang Thứ 5 lúc 16:00.",
    timestamp: "2 giờ trước",
    unread: true,
  },
  {
    id: 2,
    category: "achievement",
    title: "Huy hiệu mới: Giải bài tập xuất sắc",
    summary: "Em đã hoàn thành 10 bài tập liên tiếp đúng hạn. Tiếp tục phát huy nhé!",
    timestamp: "5 giờ trước",
    unread: true,
  },
  {
    id: 3,
    category: "class",
    title: "Nhắc nhở buổi học sắp tới",
    summary: "Môn Vật lý với Cô Trần Thị Mai sẽ bắt đầu sau 30 phút. Phòng P.103, Tòa nhà B.",
    timestamp: "Hôm qua",
    unread: true,
  },
  {
    id: 4,
    category: "message",
    title: "Tin nhắn mới từ Thầy Nguyễn Văn An",
    summary: "\"Bài kiểm tra đại số tuần trước của em làm rất tốt — nhớ xem lại tài liệu đính kèm trước Thứ 5 nhé.\"",
    timestamp: "Hôm qua",
    unread: false,
  },
  {
    id: 5,
    category: "system",
    title: "Đổi mật khẩu thành công",
    summary: "Mật khẩu tài khoản EduTrack của bạn đã được cập nhật. Nếu không phải bạn thực hiện, hãy liên hệ hỗ trợ ngay.",
    timestamp: "2 ngày trước",
    unread: false,
  },
  {
    id: 6,
    category: "payment",
    title: "Hạn nộp học phí còn 3 ngày",
    summary: "Hóa đơn học phí Tháng 8 số tiền 7.500.000 đ sẽ đến hạn thanh toán vào ngày 15/08/2026.",
    timestamp: "2 ngày trước",
    unread: true,
  },
  {
    id: 7,
    category: "class",
    title: "Tài liệu học tập mới đã tải lên",
    summary: "Thầy An vừa đăng tải 3 phiếu bài tập mới cho môn Toán Nâng Cao — Chương 3: Phương trình bậc hai.",
    timestamp: "3 ngày trước",
    unread: false,
  },
  {
    id: 8,
    category: "class",
    title: "Ghi nhận điểm danh — Hóa Học",
    summary: "Hệ thống đã ghi nhận bạn có mặt trong buổi học ngày 16/08 với Cô Phạm Thu Hà.",
    timestamp: "4 ngày trước",
    unread: false,
  },
  {
    id: 9,
    category: "system",
    title: "Cập nhật hồ sơ cá nhân",
    summary: "Email liên hệ của bạn đã được cập nhật thành minhanh.nguyen@gmail.com.",
    timestamp: "5 ngày trước",
    unread: false,
  },
  {
    id: 10,
    category: "achievement",
    title: "Báo cáo tiến độ học tập tháng",
    summary: "Báo cáo tháng 7 của bạn đã hoàn tất. Điểm tổng kết: A−. Xem chi tiết tại trang Tiến độ.",
    timestamp: "1 tuần trước",
    unread: false,
  },
  {
    id: 11,
    category: "class",
    title: "Buổi học được nghỉ — Workshop Viết luận",
    summary: "Buổi học ngày 12/08 nghỉ lễ. Buổi học tiếp theo sẽ diễn ra vào ngày 19/08.",
    timestamp: "1 tuần trước",
    unread: false,
  },
  {
    id: 12,
    category: "system",
    title: "Bảo trì hệ thống EduTrack",
    summary: "Hệ thống sẽ tạm dừng hoạt động từ 02:00 – 04:00 ngày 21/08 để nâng cấp định kỳ.",
    timestamp: "1 tuần trước",
    unread: false,
  },
];

const CATEGORY_CONFIG = {
  class:       { label: "Lớp học",    icon: "bi-book-fill",          cls: "notif-cat-class" },
  system:      { label: "Hệ thống",   icon: "bi-shield-fill-check",  cls: "notif-cat-system" },
  payment:     { label: "Học phí",    icon: "bi-credit-card-fill",   cls: "notif-cat-payment" },
  message:     { label: "Tin nhắn",   icon: "bi-chat-dots-fill",     cls: "notif-cat-message" },
  achievement: { label: "Thành tích", icon: "bi-star-fill",          cls: "notif-cat-achievement" },
};

let activeTab = "All";
const readIds = new Set();

document.addEventListener('DOMContentLoaded', () => {
  const notifListContainer = document.getElementById('notifListContainer');
  const notifEmptyState = document.getElementById('notifEmptyState');
  const unreadSubtitle = document.getElementById('unreadSubtitle');
  const btnMarkAllRead = document.getElementById('btnMarkAllRead');
  const unreadTabCounter = document.getElementById('unreadTabCounter');
  const notifFooterNote = document.getElementById('notifFooterNote');
  const filterTabBtns = document.querySelectorAll('[data-notif-tab]');

  function getUnreadCount() {
    return NOTIFICATIONS.filter(n => n.unread && !readIds.has(n.id)).length;
  }

  function render() {
    const unreadCount = getUnreadCount();

    // 1. Update Subtitle
    if (unreadSubtitle) {
      if (unreadCount > 0) {
        unreadSubtitle.textContent = `Bạn có ${unreadCount} thông báo chưa đọc`;
      } else {
        unreadSubtitle.textContent = 'Đã đọc hết tất cả thông báo!';
      }
    }

    // 2. Update Mark All Read button visibility
    if (btnMarkAllRead) {
      if (unreadCount > 0) {
        btnMarkAllRead.classList.remove('d-none');
      } else {
        btnMarkAllRead.classList.add('d-none');
      }
    }

    // 3. Update tab unread counter
    if (unreadTabCounter) {
      if (unreadCount > 0) {
        unreadTabCounter.textContent = unreadCount;
        unreadTabCounter.classList.remove('d-none');
      } else {
        unreadTabCounter.classList.add('d-none');
      }
    }

    // 4. Update sidebar badge
    const sidebarBadges = document.querySelectorAll('.sidebar-badge');
    sidebarBadges.forEach(badge => {
      badge.textContent = unreadCount;
      if (unreadCount === 0) {
        badge.classList.add('d-none');
      } else {
        badge.classList.remove('d-none');
      }
    });

    // 5. Filter notifications
    const filtered = NOTIFICATIONS.filter(n => {
      const isUnread = n.unread && !readIds.has(n.id);
      if (activeTab === "Unread") return isUnread;
      if (activeTab === "Class") return n.category === "class";
      if (activeTab === "System") return n.category === "system" || n.category === "payment";
      return true;
    });

    // 6. Render List
    if (filtered.length === 0) {
      if (notifListContainer) notifListContainer.classList.add('d-none');
      if (notifEmptyState) notifEmptyState.classList.remove('d-none');
      if (notifFooterNote) notifFooterNote.classList.add('d-none');
    } else {
      if (notifEmptyState) notifEmptyState.classList.add('d-none');
      if (notifListContainer) {
        notifListContainer.classList.remove('d-none');
        let html = '';

        filtered.forEach(n => {
          const isUnread = n.unread && !readIds.has(n.id);
          const cfg = CATEGORY_CONFIG[n.category] || CATEGORY_CONFIG.system;

          html += `
            <button type="button" class="notification-item-btn ${isUnread ? 'is-unread' : ''} ${cfg.cls}" data-notif-id="${n.id}">
              <div class="notif-category-icon-box">
                <i class="bi ${cfg.icon}"></i>
              </div>
              <div class="notif-main-content">
                <div class="notif-title-row">
                  <span class="notif-title-text">${n.title}</span>
                  <span class="notif-category-badge">${cfg.label}</span>
                </div>
                <p class="notif-summary-text">${n.summary}</p>
              </div>
              <div class="notif-right-meta">
                <div class="notif-time-text">
                  <i class="bi bi-clock"></i>
                  <span>${n.timestamp}</span>
                </div>
                ${isUnread ? '<span class="notif-unread-dot"></span>' : ''}
              </div>
            </button>
          `;
        });

        notifListContainer.innerHTML = html;

        // Attach click to mark single notification read
        const notifItemBtns = notifListContainer.querySelectorAll('.notification-item-btn');
        notifItemBtns.forEach(btn => {
          btn.addEventListener('click', () => {
            const id = parseInt(btn.getAttribute('data-notif-id'), 10);
            readIds.add(id);
            render();
          });
        });
      }

      if (notifFooterNote) {
        notifFooterNote.classList.remove('d-none');
        notifFooterNote.textContent = `Hiển thị ${filtered.length} thông báo · Nhấn vào thông báo để đánh dấu đã đọc`;
      }
    }
  }

  // Initial Render
  render();

  // Mark all read action
  if (btnMarkAllRead) {
    btnMarkAllRead.addEventListener('click', () => {
      NOTIFICATIONS.forEach(n => {
        if (n.unread) readIds.add(n.id);
      });
      render();
    });
  }

  // Filter Tabs click
  filterTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterTabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeTab = btn.getAttribute('data-notif-tab');
      render();
    });
  });
});
