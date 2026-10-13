import type { ProgressNote } from '../../BLL/models/ProgressNote';

/**
 * Dữ liệu mẫu nhận xét tiến độ học sinh bám sát DbSeeder.cs (bảng progress_notes)
 */
export const MOCK_PROGRESS_NOTES: ProgressNote[] = [
  {
    noteId: 1,
    studentId: 6, // STU001 - An
    classId: 1, // Math 9
    writtenBy: 3, // ThS. Hoàng Quốc Việt
    content: 'An exhibits outstanding mathematical intuition. Consistently achieves top marks.',
    noteType: 'praise',
    createdAt: '2026-09-12T15:30:00Z',
  },
  {
    noteId: 2,
    studentId: 7, // STU002 - Bích
    classId: 1, // Math 9
    writtenBy: 5, // TA Tài
    content: 'Bich missed session 2 due to illness. Followed up and shared lecture slides.',
    noteType: 'feedback',
    createdAt: '2026-09-11T16:00:00Z',
  },
  {
    noteId: 3,
    studentId: 8, // STU003 - Cường
    classId: 1, // Math 9
    writtenBy: 3, // ThS. Hoàng Quốc Việt
    content: 'Cuong submitted homework 1 late. Needs to manage timetable and deadline alerts.',
    noteType: 'warning',
    createdAt: '2026-09-15T09:00:00Z',
  },
];
