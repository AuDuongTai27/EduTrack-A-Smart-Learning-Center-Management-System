import type { SubjectDto } from '../BLL/models/SubjectDto';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Tầng Network API cho Môn học (Subjects)
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

  /**
   * POST /api/subjects
   */
  async create(data: { subjectCode: string; subjectName: string; description?: string }): Promise<SubjectDto> {
    const res = await fetch(`${API_BASE_URL}/subjects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody.message || `HTTP Error ${res.status}: ${res.statusText}`);
    }

    return await res.json();
  },

  /**
   * PUT /api/subjects/{id}
   */
  async update(id: number, data: { subjectCode?: string; subjectName: string; description?: string }): Promise<SubjectDto> {
    const res = await fetch(`${API_BASE_URL}/subjects/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody.message || `HTTP Error ${res.status}: ${res.statusText}`);
    }

    return await res.json();
  },

  /**
   * DELETE /api/subjects/{id}
   */
  async delete(id: number): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE_URL}/subjects/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody.message || `HTTP Error ${res.status}: ${res.statusText}`);
    }

    return await res.json();
  },
};

export default subjectApi;

