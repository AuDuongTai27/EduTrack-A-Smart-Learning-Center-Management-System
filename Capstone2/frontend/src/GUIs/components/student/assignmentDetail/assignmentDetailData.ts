export type SubmissionStatus = 'not-submitted' | 'submitted' | 'overdue';

export interface AssignmentDetailItem {
  id?: number;
  title: string;
  class: string;
  dueDate: string;
  defaultStatus: SubmissionStatus;
  classId: number;
  score?: string;
}

export interface AttachedFileItem {
  id: number;
  name: string;
  size: string;
  type: 'pdf' | 'word' | 'excel';
  icon: string;
  iconBg: string;
  iconColor: string;
}

export const ASSIGNMENTS_DB: Record<number, AssignmentDetailItem> = {
  1: { title: 'Bài tập Hàm số - Tuần 3', class: 'Toán Nâng Cao — Lớp 11', dueDate: '16/08/2026', defaultStatus: 'not-submitted', classId: 1 },
  2: { title: 'Kiểm tra 15 phút - Đạo hàm', class: 'Toán Nâng Cao — Lớp 11', dueDate: '10/08/2026', defaultStatus: 'submitted', classId: 1, score: '9.0 / 10' },
  3: { title: 'Bài tập về nhà - Bất phương trình', class: 'Toán Nâng Cao — Lớp 11', dueDate: '05/08/2026', defaultStatus: 'submitted', classId: 1, score: '8.5 / 10' },
  4: { title: 'Ôn tập chương 2 - Lượng giác', class: 'Toán Nâng Cao — Lớp 11', dueDate: '28/07/2026', defaultStatus: 'overdue', classId: 1 },
  5: { title: 'Bài tập Cơ học - Tuần 4', class: 'Vật Lý Cơ Bản — Lớp 11', dueDate: '17/08/2026', defaultStatus: 'not-submitted', classId: 2 },
  6: { title: 'Bài thực hành đo vận tốc', class: 'Vật Lý Cơ Bản — Lớp 11', dueDate: '09/08/2026', defaultStatus: 'submitted', classId: 2, score: '8.0 / 10' },
  7: { title: 'Bài tập điện học nâng cao', class: 'Vật Lý Cơ Bản — Lớp 11', dueDate: '02/08/2026', defaultStatus: 'overdue', classId: 2 },
  8: { title: 'Speaking Practice - Topic: Hobbies', class: 'Tiếng Anh Giao Tiếp — Lớp 11', dueDate: '16/08/2026', defaultStatus: 'not-submitted', classId: 3 },
  9: { title: 'Vocabulary Quiz - Unit 3', class: 'Tiếng Anh Giao Tiếp — Lớp 11', dueDate: '09/08/2026', defaultStatus: 'submitted', classId: 3, score: '9.5 / 10' },
  10: { title: 'Listening Exercise - BBC Learning', class: 'Tiếng Anh Giao Tiếp — Lớp 11', dueDate: '03/08/2026', defaultStatus: 'submitted', classId: 3, score: '8.5 / 10' },
  11: { title: 'Bài tập Hidrocacbon - Tổng hợp', class: 'Hóa Học 11 — Lớp 11', dueDate: '15/08/2026', defaultStatus: 'not-submitted', classId: 4 },
  12: { title: 'Cân bằng phương trình oxi hóa khử', class: 'Hóa Học 11 — Lớp 11', dueDate: '08/08/2026', defaultStatus: 'submitted', classId: 4, score: '9.0 / 10' },
  13: { title: 'Bài kiểm tra viết - 45 phút', class: 'Hóa Học 11 — Lớp 11', dueDate: '29/07/2026', defaultStatus: 'overdue', classId: 4 },
  14: { title: 'Viết văn nghị luận - Chủ đề tự chọn', class: 'Ngữ Văn Nâng Cao — Lớp 11', dueDate: '15/08/2026', defaultStatus: 'not-submitted', classId: 5 },
  15: { title: 'Phân tích đoạn thơ - Xuân Diệu', class: 'Ngữ Văn Nâng Cao — Lớp 11', dueDate: '07/08/2026', defaultStatus: 'submitted', classId: 5, score: '8.5 / 10' },
  16: { title: 'Bài tập di truyền - Tuần 5', class: 'Sinh Học Đại Cương — Lớp 11', dueDate: '14/08/2026', defaultStatus: 'not-submitted', classId: 6 },
  17: { title: 'Sơ đồ tư duy - Tế bào học', class: 'Sinh Học Đại Cương — Lớp 11', dueDate: '07/08/2026', defaultStatus: 'submitted', classId: 6, score: '9.0 / 10' },
  18: { title: 'Bài tập nguyên phân & giảm phân', class: 'Sinh Học Đại Cương — Lớp 11', dueDate: '30/07/2026', defaultStatus: 'overdue', classId: 6 },
};

export const DEFAULT_ASG: AssignmentDetailItem = {
  title: 'Bài tập tuần 3 — Phương trình bậc hai',
  class: 'Toán Nâng Cao — Lớp 11',
  dueDate: '20/08/2026',
  defaultStatus: 'not-submitted',
  classId: 1,
  score: '8.5 / 10',
};

export const ATTACHED_FILES: AttachedFileItem[] = [
  {
    id: 1,
    name: 'Bai_tap_phuong_trinh_bac_2.pdf',
    size: '2.4 MB',
    type: 'pdf',
    icon: 'bi-file-earmark-pdf',
    iconBg: '#FEE2E2',
    iconColor: '#EF4444',
  },
  {
    id: 2,
    name: 'Vi_du_minh_hoa.docx',
    size: '856 KB',
    type: 'word',
    icon: 'bi-file-earmark-word',
    iconBg: '#EFF6FF',
    iconColor: '#2563EB',
  },
  {
    id: 3,
    name: 'Bang_cong_thuc_nghiem.xlsx',
    size: '124 KB',
    type: 'excel',
    icon: 'bi-file-earmark-excel',
    iconBg: '#F0FDF4',
    iconColor: '#16A34A',
  },
];
