import type { Notification } from '../../BLL/models/Notification';

/**
 * Dữ liệu mẫu thông báo hệ thống bám sát DbSeeder.cs (bảng notifications)
 */
export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    notificationId: 1,
    userId: null,
    classId: null,
    title: 'EduTrack System Welcome',
    content: 'Welcome to EduTrack! Please complete your profile information.',
    type: 'system',
    isRead: false,
    createdAt: '2026-09-01T08:00:00Z',
  },
  {
    notificationId: 2,
    userId: 6, // STU001 - An
    classId: 1,
    title: 'Homework 01 Graded',
    content: 'Your submission for Homework 01 has been graded: 9.5/10.0',
    type: 'homework',
    isRead: true,
    createdAt: '2026-09-13T20:36:00Z',
  },
  {
    notificationId: 3,
    userId: 7, // STU002 - Bích
    classId: 1,
    title: 'Leave Request Approved',
    content: 'Your leave request for Session 2 has been approved by the Center Manager.',
    type: 'class',
    isRead: false,
    createdAt: '2026-09-09T16:05:00Z',
  },
  {
    notificationId: 4,
    userId: 8, // STU003 - Cường
    classId: 1,
    title: 'Tuition Due Reminder',
    content: 'Tuition invoice for Class 9 Advanced Mathematics is overdue. Please settle promptly.',
    type: 'tuition',
    isRead: false,
    createdAt: '2026-09-11T09:00:00Z',
  },
  {
    notificationId: 5,
    userId: null,
    classId: 1,
    title: 'Class Room Update',
    content: 'Session on 2026-09-15 will start 15 mins earlier for test review.',
    type: 'schedule',
    isRead: false,
    createdAt: '2026-09-14T10:00:00Z',
  },
  {
    notificationId: 6,
    userId: 9, // PAR001 - Phụ huynh Lê Văn Nam
    classId: 1,
    title: 'Tuition Receipt Acknowledged',
    content: 'Tuition for Le Van An (Class 9 Advanced Math) has been successfully recorded.',
    type: 'tuition',
    isRead: true,
    createdAt: '2026-09-05T10:30:00Z',
  },
];
