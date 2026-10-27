import type { UserDto } from '../BLL/models/UserDto';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * [CQRS Query Side] Tầng Network API đọc dữ liệu Người dùng (Users) dùng chung
 */
export const userApi = {
  /**
   * GET /api/users
   */
  async getAll(): Promise<UserDto[]> {
    const res = await fetch(`${API_BASE_URL}/users`, {
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
   * GET /api/users/{id}
   */
  async getById(id: number): Promise<UserDto> {
    const res = await fetch(`${API_BASE_URL}/users/${id}`, {
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

export default userApi;
