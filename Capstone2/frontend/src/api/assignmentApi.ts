import type { AssignmentDto } from '../BLL/models/AssignmentDto';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Tầng Network API thuần túy cho Assignment (HTTP Client)
 * Chịu trách nhiệm duy nhất: Gửi request HTTP tới Backend .NET
 */
export const assignmentApi = {
  /**
   * GET /api/assignments
   */
  async getAll(): Promise<AssignmentDto[]> {
    const res = await fetch(`${API_BASE_URL}/assignments`, {
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
   * GET /api/assignments/{id}
   */
  async getById(id: number): Promise<AssignmentDto> {
    const res = await fetch(`${API_BASE_URL}/assignments/${id}`, {
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

export default assignmentApi;
