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
  class: { label: 'Classes', icon: 'bi-book-fill', cls: 'notif-cat-class' },
  system: { label: 'System', icon: 'bi-shield-fill-check', cls: 'notif-cat-system' },
  payment: { label: 'Tuition', icon: 'bi-credit-card-fill', cls: 'notif-cat-payment' },
  message: { label: 'Messages', icon: 'bi-chat-dots-fill', cls: 'notif-cat-message' },
  achievement: { label: 'Achievements', icon: 'bi-star-fill', cls: 'notif-cat-achievement' },
};

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 1,
    category: 'class',
    title: '[FE-Mock] New Assignment: Advanced Trigonometric Equations',
    summary: 'Teacher Nguyen Van An has just assigned 5 new essay exercises for class Math 10A. Deadline: 23:59 this Sunday.',
    timestamp: '10 minutes ago',
    unread: true,
  },
  {
    id: 2,
    category: 'payment',
    title: '[FE-Mock] August Tuition Invoice Issued',
    summary: 'Tuition for August 2026 totaling 7,500,000 VND has been created. Payment deadline is until August 15, 2026.',
    timestamp: '2 hours ago',
    unread: true,
  },
  {
    id: 3,
    category: 'class',
    title: '[FE-Mock] Room Change for Physics 10B',
    summary: 'Thursday afternoon session (17:00) moved from Room P.103 to Physics Practice Lab L.02 (2nd Floor, Building B).',
    timestamp: '5 hours ago',
    unread: true,
  },
  {
    id: 4,
    category: 'message',
    title: 'Message from Ms. Tran Thi Mai',
    summary: '“Please remember to prepare your presentation on Mechanical Waves before tomorrow’s session.”',
    timestamp: 'Yesterday',
    unread: false,
  },
  {
    id: 5,
    category: 'system',
    title: 'Password Changed Successfully',
    summary: 'Your EduTrack account password has been updated. If you did not make this change, please contact support immediately.',
    timestamp: '2 days ago',
    unread: false,
  },
  {
    id: 6,
    category: 'payment',
    title: 'Tuition Payment Due in 3 Days',
    summary: 'August tuition invoice for the amount of 7,500,000 VND will be due on August 15, 2026.',
    timestamp: '2 days ago',
    unread: true,
  },
  {
    id: 7,
    category: 'class',
    title: 'New Learning Materials Uploaded',
    summary: 'Teacher An has uploaded 3 new assignment worksheets for Advanced Mathematics — Chapter 3: Quadratic Equations.',
    timestamp: '3 days ago',
    unread: false,
  },
  {
    id: 8,
    category: 'class',
    title: 'Attendance Recorded — Chemistry',
    summary: 'The system has recorded your attendance as present in the session on August 16 with Ms. Pham Thu Ha.',
    timestamp: '4 days ago',
    unread: false,
  },
  {
    id: 9,
    category: 'system',
    title: 'Personal Profile Updated',
    summary: 'Your contact email has been updated to minhanh.nguyen@gmail.com.',
    timestamp: '5 days ago',
    unread: false,
  },
  {
    id: 10,
    category: 'achievement',
    title: 'Monthly Learning Progress Report',
    summary: 'Your July report is complete. Overall grade: A−. See details on the Progress page.',
    timestamp: '1 week ago',
    unread: false,
  },
  {
    id: 11,
    category: 'class',
    title: 'Class Cancelled — Essay Writing Workshop',
    summary: 'Session on August 12 is cancelled for holiday. The next session will take place on August 19.',
    timestamp: '1 week ago',
    unread: false,
  },
  {
    id: 12,
    category: 'system',
    title: 'EduTrack System Maintenance',
    summary: 'The system will temporarily pause operations from 02:00 – 04:00 on August 21 for scheduled maintenance.',
    timestamp: '1 week ago',
    unread: false,
  },
];

import type { NotificationDto } from '../../../../BLL/models/NotificationDto';

/**
 * Convert NotificationDto from Backend to NotificationItem for UI
 */
export function mapNotificationDtoToItem(dto: NotificationDto): NotificationItem {
  let category: NotificationItem['category'] = 'system';
  const typeLower = (dto.type || '').toLowerCase();
  if (typeLower.includes('class') || typeLower.includes('homework') || typeLower.includes('assignment') || typeLower.includes('schedule')) {
    category = 'class';
  } else if (typeLower.includes('tuition') || typeLower.includes('payment') || typeLower.includes('fee')) {
    category = 'payment';
  } else if (typeLower.includes('message')) {
    category = 'message';
  } else if (typeLower.includes('achievement')) {
    category = 'achievement';
  }

  let timestamp = 'Just now';
  if (dto.createdAt) {
    try {
      const d = new Date(dto.createdAt);
      if (!isNaN(d.getTime())) {
        timestamp = `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
      }
    } catch {
      timestamp = dto.createdAt;
    }
  }

  return {
    id: dto.notificationId,
    category,
    title: dto.title,
    summary: dto.content,
    timestamp,
    unread: !dto.isRead,
  };
}
