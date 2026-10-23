import { notificationApi } from '../api/notificationApi';
import type { NotificationDto } from '../BLL/models/NotificationDto';
import { MOCK_NOTIFICATIONS } from './mockData/mockNotifications';

export interface NotificationsFetchResult {
  data: NotificationDto[];
  isLiveApi: boolean;
  error?: string | null;
}

/**
 * Tầng Data Access Layer (DAL) điều phối dữ liệu thông báo (Notification)
 * - Thử gọi Backend qua `notificationApi`
 * - Fallback sang `MOCK_NOTIFICATIONS` nếu Backend chưa bật
 */
export const notificationDAL = {
  /**
   * Lấy toàn bộ danh sách thông báo (có Fallback)
   */
  async getAllNotifications(): Promise<NotificationsFetchResult> {
    try {
      const data = await notificationApi.getAll();
      console.log('🟢 [notificationDAL] Kết nối Backend API thành công, nhận', data.length, 'thông báo.');
      return {
        data,
        isLiveApi: true,
      };
    } catch (err: any) {
      console.warn('🟡 [notificationDAL] Backend API không phản hồi, tự động dùng mockData:', err.message);

      const fallbackData: NotificationDto[] = MOCK_NOTIFICATIONS.map((n) => ({
        notificationId: n.notificationId,
        userId: n.userId,
        userName: n.userId ? `User #${n.userId}` : null,
        classId: n.classId,
        className: n.classId ? `Lớp #${n.classId}` : null,
        title: n.title.startsWith('[FE-Mock]') ? n.title : `[FE-Mock] ${n.title}`,
        content: n.content,
        type: n.type,
        isRead: n.isRead,
        createdAt: n.createdAt,
      }));

      return {
        data: fallbackData,
        isLiveApi: false,
        error: 'Backend API chưa bật (Đang dùng dữ liệu dự phòng mockData)',
      };
    }
  },

  /**
   * Lấy chi tiết thông báo theo ID
   */
  async getNotificationById(id: number): Promise<NotificationDto | null> {
    try {
      return await notificationApi.getById(id);
    } catch (err) {
      console.warn(`🟡 [notificationDAL] Không thể gọi API cho thông báo #${id}, tìm trong mockData:`, err);
      const found = MOCK_NOTIFICATIONS.find((n) => n.notificationId === id);
      if (!found) return null;
      return {
        notificationId: found.notificationId,
        userId: found.userId,
        userName: found.userId ? `User #${found.userId}` : null,
        classId: found.classId,
        className: found.classId ? `Lớp #${found.classId}` : null,
        title: found.title.startsWith('[FE-Mock]') ? found.title : `[FE-Mock] ${found.title}`,
        content: found.content,
        type: found.type,
        isRead: found.isRead,
        createdAt: found.createdAt,
      };
    }
  },
};

export default notificationDAL;
