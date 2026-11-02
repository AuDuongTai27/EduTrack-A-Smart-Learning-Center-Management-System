import {
  notificationApi,
  type CreateNotificationPayload,
} from '../api/notificationApi';
import type { NotificationDto } from '../BLL/models/NotificationDto';

export interface NotificationsFetchResult {
  data: NotificationDto[];
  isLiveApi: boolean;
  error?: string | null;
}

export const notificationDAL = {
  // Backward compatible with existing pages; API failures are NOT hidden by mock data.
  async getAllNotifications(): Promise<NotificationsFetchResult> {
    const data = await notificationApi.getAll();
    return { data, isLiveApi: true };
  },

  async getNotificationById(id: number): Promise<NotificationDto> {
    return notificationApi.getById(id);
  },

  async createNotification(dto: CreateNotificationPayload): Promise<NotificationDto> {
    return notificationApi.create(dto);
  },

  async getSentNotifications(senderId: number): Promise<NotificationsFetchResult> {
    const data = await notificationApi.getSent(senderId);
    return { data, isLiveApi: true };
  },

  async getInbox(userId: number): Promise<NotificationDto[]> {
    return notificationApi.getInbox(userId);
  },

  async markAsRead(notificationId: number, userId: number): Promise<NotificationDto> {
    return notificationApi.markRead(notificationId, userId);
  },

  async deleteReadFromInbox(notificationId: number, userId: number): Promise<void> {
    return notificationApi.deleteReadFromInbox(notificationId, userId);
  },

  getAll(): Promise<NotificationsFetchResult> {
    return this.getAllNotifications();
  },

  getById(id: number): Promise<NotificationDto> {
    return this.getNotificationById(id);
  },
};

export default notificationDAL;
