import type { User } from './User';
import type { Class } from './Class';

/**
 * Ánh xạ 1-1 từ EduTrack.API.Models.Entities.Notification (bảng notifications)
 */
export interface Notification {
  notificationId: number;
  userId?: number | null;
  classId?: number | null;
  title: string;
  content: string;
  type: 'system' | 'class' | 'payment' | 'grade' | string;
  isRead: boolean;
  createdAt: string;

  // Navigation Properties
  user?: User | null;
  class?: Class | null;
}
