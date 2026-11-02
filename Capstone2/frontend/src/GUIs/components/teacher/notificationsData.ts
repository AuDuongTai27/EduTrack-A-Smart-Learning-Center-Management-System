export interface TeacherNotification {
  id: string | number;
  sender: string;
  avatarUrl?: string;
  initials?: string;
  initialsBgClass?: string;
  initialsColorClass?: string;
  isNew?: boolean;
  isRead?: boolean;
  timeAgo: string;
  title: string;
  description: string;
  hasBottomBorder?: boolean;
  addedOn?: string;
  daysAgo?: string;
  icon?: string;
  iconBgClass?: string;
  iconColorClass?: string;
}

export const MOCK_TEACHER_NOTIFICATIONS: TeacherNotification[] = [
  {
    id: 1,
    sender: "Phòng Quản Lý Đào Tạo",
    initials: "ĐT",
    initialsBgClass: "bg-info-subtle",
    initialsColorClass: "text-info",
    isNew: true,
    isRead: false,
    timeAgo: "10 phút trước",
    title: "Cập nhật Lịch giảng dạy Học kỳ mới 2026/2027",
    description:
      "Thời khóa biểu chính thức học kỳ mới đã được cập nhật. Thầy/Cô vui lòng kiểm tra phòng học và thời gian bắt đầu từ tuần tới.",
    hasBottomBorder: true,
  },
  {
    id: 2,
    sender: "Ban Giám Đốc EduTrack",
    initials: "ET",
    initialsBgClass: "bg-primary-subtle",
    initialsColorClass: "text-primary",
    isNew: true,
    isRead: false,
    timeAgo: "2 giờ trước",
    title: "Phân công Trợ giảng Âu Dương Tài hỗ trợ Lớp Toán 9A1",
    description:
      "Trợ giảng Âu Dương Tài đã được phân công phối hợp quản lý chuyên cần và chấm bài tập tại Lớp 9 - Advanced Mathematics.",
    hasBottomBorder: true,
  },
  {
    id: 3,
    sender: "Phòng Hành Chính & Nhân Sự",
    initials: "HC",
    initialsBgClass: "bg-warning-subtle",
    initialsColorClass: "text-warning",
    isNew: true,
    isRead: false,
    timeAgo: "5 giờ trước",
    title: "Đơn xin phép giảng dạy đã được phê duyệt",
    description:
      "Yêu cầu đổi lịch giảng dạy của bạn đã được Ban Quản Lý xem xét và phê duyệt thành công.",
    hasBottomBorder: true,
  },
  {
    id: 4,
    sender: "Tổ Chuyên Môn",
    initials: "CM",
    initialsBgClass: "bg-success-subtle",
    initialsColorClass: "text-success",
    isNew: false,
    isRead: true,
    timeAgo: "1 ngày trước",
    title: "Nhắc nhở cập nhật kết quả kiểm tra & đánh giá học viên",
    description:
      "Hệ thống đã mở cổng nhập nhận xét định kỳ và điểm số bài tập tuần qua cho các học viên cần kèm thêm.",
    hasBottomBorder: true,
  },
  {
    id: 5,
    sender: "Ban Giám Đốc EduTrack",
    initials: "ET",
    initialsBgClass: "bg-primary-subtle",
    initialsColorClass: "text-primary",
    isNew: false,
    isRead: true,
    timeAgo: "3 ngày trước",
    title: "Họp Hội đồng chuyên môn & Đào tạo nghiệp vụ Quý IV",
    description:
      "Kính mời quý thầy cô và trợ giảng tham dự buổi sinh hoạt chuyên môn đánh giá phương pháp giảng dạy mới tại Hội trường A.",
    hasBottomBorder: false,
  },
];

// Alias for general notification usage
export const MOCK_NOTIFICATIONS = MOCK_TEACHER_NOTIFICATIONS;

export default MOCK_TEACHER_NOTIFICATIONS;
