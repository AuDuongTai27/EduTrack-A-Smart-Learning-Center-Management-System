export interface NotificationDto {
  notificationId: number;
  userId?: number | null;
  userName?: string | null;
  classId?: number | null;
  className?: string | null;
  title: string;
  content: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}
