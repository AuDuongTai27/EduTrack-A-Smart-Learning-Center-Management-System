export type SubmissionStatus = 'not-submitted' | 'submitted' | 'overdue';

export interface AssignmentDetailItem {
  id?: number;
  title: string;
  class: string;
  dueDate: string;
  defaultStatus: SubmissionStatus;
  classId: number;
  score?: string;
  description?: string | null;
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
  1: { title: '[FE-Mock] Functions Assignment - Week 3', class: 'Advanced Math — Grade 11', dueDate: '16/08/2026', defaultStatus: 'not-submitted', classId: 1 },
  2: { title: '[FE-Mock] 15-Minute Quiz - Derivatives', class: 'Advanced Math — Grade 11', dueDate: '10/08/2026', defaultStatus: 'submitted', classId: 1, score: '9.0 / 10' },
  3: { title: '[FE-Mock] Homework - Inequalities', class: 'Advanced Math — Grade 11', dueDate: '05/08/2026', defaultStatus: 'submitted', classId: 1, score: '8.5 / 10' },
  4: { title: '[FE-Mock] Chapter 2 Review - Trigonometry', class: 'Advanced Math — Grade 11', dueDate: '28/07/2026', defaultStatus: 'overdue', classId: 1 },
  5: { title: '[FE-Mock] Mechanics Assignment - Week 4', class: 'Basic Physics — Grade 11', dueDate: '17/08/2026', defaultStatus: 'not-submitted', classId: 2 },
  6: { title: '[FE-Mock] Velocity Measurement Lab', class: 'Basic Physics — Grade 11', dueDate: '09/08/2026', defaultStatus: 'submitted', classId: 2, score: '8.0 / 10' },
  7: { title: '[FE-Mock] Advanced Electricity Assignment', class: 'Basic Physics — Grade 11', dueDate: '02/08/2026', defaultStatus: 'overdue', classId: 2 },
  8: { title: '[FE-Mock] Speaking Practice - Topic: Hobbies', class: 'Communicative English — Grade 11', dueDate: '16/08/2026', defaultStatus: 'not-submitted', classId: 3 },
  9: { title: '[FE-Mock] Vocabulary Quiz - Unit 3', class: 'Communicative English — Grade 11', dueDate: '09/08/2026', defaultStatus: 'submitted', classId: 3, score: '9.5 / 10' },
  10: { title: '[FE-Mock] Listening Exercise - BBC Learning', class: 'Communicative English — Grade 11', dueDate: '03/08/2026', defaultStatus: 'submitted', classId: 3, score: '8.5 / 10' },
  11: { title: '[FE-Mock] Hydrocarbons Exercise - Synthesis', class: 'Chemistry 11 — Grade 11', dueDate: '15/08/2026', defaultStatus: 'not-submitted', classId: 4 },
  12: { title: '[FE-Mock] Balancing Redox Reactions', class: 'Chemistry 11 — Grade 11', dueDate: '08/08/2026', defaultStatus: 'submitted', classId: 4, score: '9.0 / 10' },
  13: { title: '[FE-Mock] 45-Minute Written Test', class: 'Chemistry 11 — Grade 11', dueDate: '29/07/2026', defaultStatus: 'overdue', classId: 4 },
  14: { title: '[FE-Mock] Argumentative Essay - Open Topic', class: 'Advanced Literature — Grade 11', dueDate: '15/08/2026', defaultStatus: 'not-submitted', classId: 5 },
  15: { title: '[FE-Mock] Poetry Analysis - Xuan Dieu', class: 'Advanced Literature — Grade 11', dueDate: '07/08/2026', defaultStatus: 'submitted', classId: 5, score: '8.5 / 10' },
  16: { title: '[FE-Mock] Genetics Assignment - Week 5', class: 'General Biology — Grade 11', dueDate: '14/08/2026', defaultStatus: 'not-submitted', classId: 6 },
  17: { title: '[FE-Mock] Mind Map - Cell Biology', class: 'General Biology — Grade 11', dueDate: '07/08/2026', defaultStatus: 'submitted', classId: 6, score: '9.0 / 10' },
  18: { title: '[FE-Mock] Mitosis & Meiosis Exercise', class: 'General Biology — Grade 11', dueDate: '30/07/2026', defaultStatus: 'overdue', classId: 6 },
};

export const DEFAULT_ASG: AssignmentDetailItem = {
  title: '[FE-Mock] Week 3 Assignment — Quadratic Equations',
  class: 'Advanced Math — Grade 11',
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

import type { AssignmentDto } from '../../../../BLL/models/AssignmentDto';

/**
 * Chuyển đổi AssignmentDto từ Backend .NET sang AssignmentDetailItem cho màn hình chi tiết bài tập
 */
export function mapAssignmentDtoToDetailItem(
  dto: AssignmentDto,
  fallback?: AssignmentDetailItem
): AssignmentDetailItem {
  const due = new Date(dto.dueDate);
  const now = new Date();
  let defaultStatus: SubmissionStatus = 'not-submitted';

  if (fallback?.defaultStatus) {
    defaultStatus = fallback.defaultStatus;
  } else if (due < now) {
    defaultStatus = 'overdue';
  }

  const formattedDate = !isNaN(due.getTime())
    ? `${String(due.getDate()).padStart(2, '0')}/${String(due.getMonth() + 1).padStart(2, '0')}/${due.getFullYear()}`
    : 'No due date';

  return {
    id: dto.assignmentId,
    title: dto.title,
    class: dto.className || fallback?.class || 'Class',
    dueDate: formattedDate,
    defaultStatus,
    classId: dto.classId,
    score: fallback?.score || `${dto.maxScore} pts`,
    description: dto.description || fallback?.description || null,
  };
}

