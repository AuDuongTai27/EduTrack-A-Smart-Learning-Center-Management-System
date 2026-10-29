export interface FeedbackApprovalRequest {
  id: number;
  requestCode?: string;
  requestType: 'feedback';
  title: string;
  description: string;
  senderName: string;
  senderRole: 'parent' | 'student';
  className?: string;
  createdAt: string;
  status: 'pending' | 'approved' | 'rejected';
  statusLabel: string;
  canEdit: boolean;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
}

export const INITIAL_FEEDBACK_REQUESTS: FeedbackApprovalRequest[] = [
  {
    id: 1,
    requestCode: 'FB0001',
    requestType: 'feedback',
    title: 'Đề xuất bổ sung bài tập ôn thi giữa kỳ môn Toán 9',
    description: 'Thầy/Cô cho em xin thêm bộ đề trắc nghiệm chương Hệ thức lượng trong tam giác vuông để luyện tập trước kỳ thi giữa kỳ ạ.',
    senderName: 'Lê Văn An',
    senderRole: 'student',
    createdAt: '15/10/2026 14:20',
    status: 'pending',
    statusLabel: 'Chưa xem xét giải quyết',
    canEdit: true,
  },
  {
    id: 2,
    requestCode: 'FB0002',
    requestType: 'feedback',
    title: 'Góp ý tài liệu nghe Tiếng Anh và loa phòng học P.202',
    description: 'Loa tại phòng P.202 hơi nhỏ ở dãy bàn cuối, mong trung tâm kiểm tra giúp lớp em trước buổi học tuần tới ạ.',
    senderName: 'Lê Văn An',
    senderRole: 'student',
    createdAt: '12/10/2026 09:15',
    status: 'pending',
    statusLabel: 'Chờ duyệt',
    canEdit: false,
    reviewedBy: 'Trần Thị Nhân Viên (Admin Staff)',
  },
  {
    id: 3,
    requestCode: 'FB0003',
    requestType: 'feedback',
    title: 'Góp ý điều hòa phòng học 201',
    description: 'Em thấy phòng học 201 điều hòa bị chảy nước và hơi lạnh trong buổi học tối qua.',
    senderName: 'Lê Văn An',
    senderRole: 'student',
    createdAt: '09/09/2026 20:45',
    status: 'approved',
    statusLabel: 'Đã giải quyết',
    canEdit: false,
    reviewedBy: 'Trần Thị Nhân Viên (Admin Staff)',
    reviewedAt: '10/09/2026 08:30',
    reviewNotes: 'Trung tâm đã ghi nhận và cho bộ phận kỹ thuật bảo trì điều hòa sáng nay. Cảm ơn em!',
  },
];
