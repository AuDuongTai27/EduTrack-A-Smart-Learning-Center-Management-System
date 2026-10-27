import type { SubjectDto } from '../BLL/models/SubjectDto';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * [CQRS Query Side] Tầng Network API đọc dữ liệu Môn học (Subjects) dùng chung
 */
export const subjectApi = {
  /**
   * GET /api/subjects
   */
  async getAll(): Promise<SubjectDto[]> {
    const res = await fetch(`${API_BASE_URL}/subjects`, {
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
   * GET /api/subjects/{id}
   */
  async getById(id: number): Promise<SubjectDto> {
    const res = await fetch(`${API_BASE_URL}/subjects/${id}`, {
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

export default subjectApi;
