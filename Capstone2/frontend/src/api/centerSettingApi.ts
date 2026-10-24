import type { CenterSettingDto } from '../BLL/models/CenterSettingDto';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Tầng Network API cho Cấu hình trung tâm (Center Settings)
 */
export const centerSettingApi = {
  /**
   * GET /api/centersettings
   */
  async getAll(): Promise<CenterSettingDto[]> {
    const res = await fetch(`${API_BASE_URL}/centersettings`, {
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
   * GET /api/centersettings/{id}
   */
  async getById(id: number): Promise<CenterSettingDto> {
    const res = await fetch(`${API_BASE_URL}/centersettings/${id}`, {
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

export default centerSettingApi;
