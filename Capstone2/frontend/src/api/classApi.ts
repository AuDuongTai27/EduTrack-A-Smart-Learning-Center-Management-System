import type { ClassDto } from '../BLL/models/ClassDto';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * [CQRS Query Side] Tầng Network API đọc dữ liệu Lớp học (Classes) dùng chung
 */
export const classApi = {
  /**
   * GET /api/classes
   */
  async getAll(): Promise<ClassDto[]> {
    const res = await fetch(`${API_BASE_URL}/classes`, {
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
   * GET /api/classes/{id}
   */
  async getById(id: number): Promise<ClassDto> {
    const res = await fetch(`${API_BASE_URL}/classes/${id}`, {
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

export default classApi;
