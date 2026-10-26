import type { NotificationDto } from '../BLL/models/NotificationDto';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Tầng Network API thuần túy cho Notification (HTTP Client)
 * Chịu trách nhiệm: Gửi request HTTP tới Backend .NET
 */
export const notificationApi = {
  /**
   * GET /api/notifications
   */
  async getAll(): Promise<NotificationDto[]> {
    const res = await fetch(`${API_BASE_URL}/notifications`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error(`HTTP Error ${res.status}: ${res.statusText}`);
    }

    return await res.json();
  },

  /**
   * GET /api/notifications/{id}
   */
  async getById(id: number): Promise<NotificationDto> {
    const res = await fetch(`${API_BASE_URL}/notifications/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error(`HTTP Error ${res.status}: ${res.statusText}`);
    }

    return await res.json();
  },
};

export default notificationApi;
