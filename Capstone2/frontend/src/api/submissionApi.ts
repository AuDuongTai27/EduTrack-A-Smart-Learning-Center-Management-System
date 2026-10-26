import type { SubmissionDto } from '../BLL/models/SubmissionDto';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Tầng Network API thuần túy cho Bài nộp học sinh (Submissions)
 */
export const submissionApi = {
  /**
   * GET /api/submissions
   */
  async getAll(): Promise<SubmissionDto[]> {
    const res = await fetch(`${API_BASE_URL}/submissions`, {
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
   * GET /api/submissions/{id}
   */
  async getById(id: number): Promise<SubmissionDto> {
    const res = await fetch(`${API_BASE_URL}/submissions/${id}`, {
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

export default submissionApi;
