export interface NotificationItem {
  id: number;
  category: 'class' | 'system' | 'payment' | 'message' | 'achievement';
  title: string;
  summary: string;
  timestamp: string;
  unread: boolean;
}

export interface CategoryMeta {
  label: string;
  icon: string;
  cls: string;
}

export const CATEGORY_CONFIG: Record<string, CategoryMeta> = {
  class: { label: 'Lớp học', icon: 'bi-book-fill', cls: 'notif-cat-class' },
  system: { label: 'Hệ thống', icon: 'bi-shield-fill-check', cls: 'notif-cat-system' },
  payment: { label: 'Học phí', icon: 'bi-credit-card-fill', cls: 'notif-cat-payment' },
  message: { label: 'Tin nhắn', icon: 'bi-chat-dots-fill', cls: 'notif-cat-message' },
  achievement: { label: 'Thành tích', icon: 'bi-star-fill', cls: 'notif-cat-achievement' },
};

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 1,
    category: 'class',
    title: 'Bài tập mới: Phương trình lượng giác nâng cao',
    summary: 'Thầy Nguyễn Văn An vừa giao 5 bài tập tự luận mới cho lớp Toán 10A. Hạn nộp: 23:59 Chủ Nhật tuần này.',
    timestamp: '10 phút trước',
    unread: true,
  },
  {
    id: 2,
    category: 'payment',
    title: 'Hóa đơn học phí Tháng 8 đã phát hành',
    summary: 'Học phí kỳ Tháng 8 / 2026 với tổng số tiền 7.500.000 đ đã được tạo. Hạn thanh toán đến hết ngày 15/08/2026.',
    timestamp: '2 giờ trước',
    unread: true,
  },
  {
    id: 3,
    category: 'class',
    title: 'Thay đổi phòng học môn Vật Lý 10B',
    summary: 'Buổi học chiều Thứ 5 (17:00) chuyển từ Phòng P.103 sang Lab Thực hành Lý L.02 (Tầng 2, Tòa B).',
    timestamp: '5 giờ trước',
    unread: true,
  },
  {
    id: 4,
    category: 'message',
    title: 'Tin nhắn từ Cô Trần Thị Mai',
    summary: '“Em nhớ chuẩn bị bài thuyết trình phần Sóng cơ học trước buổi học ngày mai nhé.”',
    timestamp: 'Hôm qua',
    unread: false,
  },
  {
    id: 5,
    category: 'system',
    title: 'Đổi mật khẩu thành công',
    summary: 'Mật khẩu tài khoản EduTrack của bạn đã được cập nhật. Nếu không phải bạn thực hiện, hãy liên hệ hỗ trợ ngay.',
    timestamp: '2 ngày trước',
    unread: false,
  },
  {
    id: 6,
    category: 'payment',
    title: 'Hạn nộp học phí còn 3 ngày',
    summary: 'Hóa đơn học phí Tháng 8 số tiền 7.500.000 đ sẽ đến hạn thanh toán vào ngày 15/08/2026.',
    timestamp: '2 ngày trước',
    unread: true,
  },
  {
    id: 7,
    category: 'class',
    title: 'Tài liệu học tập mới đã tải lên',
    summary: 'Thầy An vừa đăng tải 3 phiếu bài tập mới cho môn Toán Nâng Cao — Chương 3: Phương trình bậc hai.',
    timestamp: '3 ngày trước',
    unread: false,
  },
  {
    id: 8,
    category: 'class',
    title: 'Ghi nhận điểm danh — Hóa Học',
    summary: 'Hệ thống đã ghi nhận bạn có mặt trong buổi học ngày 16/08 với Cô Phạm Thu Hà.',
    timestamp: '4 ngày trước',
    unread: false,
  },
  {
    id: 9,
    category: 'system',
    title: 'Cập nhật hồ sơ cá nhân',
    summary: 'Email liên hệ của bạn đã được cập nhật thành minhanh.nguyen@gmail.com.',
    timestamp: '5 ngày trước',
    unread: false,
  },
  {
    id: 10,
    category: 'achievement',
    title: 'Báo cáo tiến độ học tập tháng',
    summary: 'Báo cáo tháng 7 của bạn đã hoàn tất. Điểm tổng kết: A−. Xem chi tiết tại trang Tiến độ.',
    timestamp: '1 tuần trước',
    unread: false,
  },
  {
    id: 11,
    category: 'class',
    title: 'Buổi học được nghỉ — Workshop Viết luận',
    summary: 'Buổi học ngày 12/08 nghỉ lễ. Buổi học tiếp theo sẽ diễn ra vào ngày 19/08.',
    timestamp: '1 tuần trước',
    unread: false,
  },
  {
    id: 12,
    category: 'system',
    title: 'Bảo trì hệ thống EduTrack',
    summary: 'Hệ thống sẽ tạm dừng hoạt động từ 02:00 – 04:00 ngày 21/08 để nâng cấp định kỳ.',
    timestamp: '1 tuần trước',
    unread: false,
  },
];
