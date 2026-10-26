import type { ApprovalRequestDto } from '../BLL/models/ApprovalRequestDto';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const approvalRequestApi = {
  /**
   * GET /api/approvalrequests
   */
  async getAll(): Promise<ApprovalRequestDto[]> {
    const res = await fetch(`${API_BASE_URL}/approvalrequests`, {
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
   * GET /api/approvalrequests/{id}
   */
  async getById(id: number): Promise<ApprovalRequestDto> {
    const res = await fetch(`${API_BASE_URL}/approvalrequests/${id}`, {
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

export default approvalRequestApi;
