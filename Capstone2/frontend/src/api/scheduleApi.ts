import type { ClassScheduleDto } from '../BLL/models/ClassScheduleDto';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Tầng Network API thuần túy cho Schedule (HTTP Client)
 * Chịu trách nhiệm duy nhất: Gửi request HTTP tới Backend .NET
 */
export const scheduleApi = {
  /**
   * GET /api/classschedules
   */
  async getAll(): Promise<ClassScheduleDto[]> {
    const res = await fetch(`${API_BASE_URL}/classschedules`, {
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
   * GET /api/classschedules/{id}
   */
  async getById(id: number): Promise<ClassScheduleDto> {
    const res = await fetch(`${API_BASE_URL}/classschedules/${id}`, {
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

export default scheduleApi;
