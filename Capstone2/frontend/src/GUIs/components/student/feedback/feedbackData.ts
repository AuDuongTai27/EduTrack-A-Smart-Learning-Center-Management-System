export interface FeedbackApprovalRequest {
  id: number;
  requestType: 'feedback';
  title: string;
  description: string;
  senderName: string;
  senderRole: 'parent' | 'student';
  createdAt: string;
  status: 'pending' | 'approved' | 'rejected';
  statusLabel: string;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
}

export const INITIAL_FEEDBACK_REQUESTS: FeedbackApprovalRequest[] = [
  {
    id: 1,
    requestType: 'feedback',
    title: 'Góp ý về phòng thực hành Hóa học',
    description: 'Em mong muốn phòng thực hành có thêm kính bảo hộ và găng tay mới để đảm bảo an toàn hơn trong các buổi thí nghiệm.',
    senderName: 'Lê Văn An',
    senderRole: 'student',
    createdAt: '12/10/2026 14:30',
    status: 'approved',
    statusLabel: 'Đã giải quyết',
    reviewedBy: 'Thầy Nguyễn Văn Minh (Giáo vụ)',
    reviewedAt: '13/10/2026 09:15',
    reviewNotes: 'Trung tâm đã ghi nhận và bổ sung 20 bộ bảo hộ mới tại phòng thực hành C301.',
  },
  {
    id: 2,
    requestType: 'feedback',
    title: 'Đề xuất đổi lịch học bù môn Toán',
    description: 'Do tuần sau trường phổ thông có đợt thi giữa kỳ, em xin chuyển buổi học bù Toán thứ 4 sang chiều thứ 7.',
    senderName: 'Lê Văn An',
    senderRole: 'student',
    createdAt: '10/10/2026 18:20',
    status: 'pending',
    statusLabel: 'Chờ tiếp nhận',
  },
  {
    id: 3,
    requestType: 'feedback',
    title: 'Thắc mắc tài liệu ôn tập Tiếng Anh',
    description: 'Tài liệu nghe Unit 4 trên hệ thống bị lỗi file âm thanh, em xin trung tâm re-upload lại file chất lượng cao hơn ạ.',
    senderName: 'Lê Văn An',
    senderRole: 'student',
    createdAt: '05/10/2026 20:10',
    status: 'approved',
    statusLabel: 'Đã giải quyết',
    reviewedBy: 'Cô Phạm Thu Thảo (Giáo viên)',
    reviewedAt: '06/10/2026 08:30',
    reviewNotes: 'Cô đã upload lại file MP3 chất lượng cao lên mục Tài liệu lớp học rồi nhé.',
  },
];
