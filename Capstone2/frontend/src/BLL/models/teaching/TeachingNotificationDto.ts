/**
 * [Bounded Context: Teaching]
 * DTO đại diện cho thông báo của Giáo viên (Teacher) và Trợ giảng (Teaching Assistant)
 */
export interface TeachingNotificationDto {
  notificationId: number;
  userId?: number | null;
  classId?: number | null;
  className?: string | null;
  title: string;
  content: string;
  sender: string;
  initials: string;
  initialsBgClass: string;
  initialsColorClass: string;
  type: string;
  isNew: boolean;
  isRead: boolean;
  timeAgo: string;
  createdAt: string;
}

