export interface ParentStudentDto {
  parentId: number;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  studentId: number;
  studentName: string;
  studentCode: string;
  relationship: string;
  isPrimaryContact: boolean;
  createdAt: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const parentStudentApi = {
  /**
   * GET /api/parentstudents
   */
  async getAll(): Promise<ParentStudentDto[]> {
    const res = await fetch(`${API_BASE_URL}/parentstudents`, {
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
   * GET /api/parentstudents/{parentId}/{studentId}
   */
  async getById(parentId: number, studentId: number): Promise<ParentStudentDto> {
    const res = await fetch(`${API_BASE_URL}/parentstudents/${parentId}/${studentId}`, {
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
   * POST /api/parentstudents
   */
  async assign(dto: {
    parentId: number;
    studentId: number;
    relationship?: string;
    isPrimaryContact?: boolean;
  }): Promise<ParentStudentDto> {
    const res = await fetch(`${API_BASE_URL}/parentstudents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dto),
    });

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody.message || `HTTP Error ${res.status}: ${res.statusText}`);
    }

    return await res.json();
  },

  /**
   * DELETE /api/parentstudents/{parentId}/{studentId}
   */
  async delete(parentId: number, studentId: number): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE_URL}/parentstudents/${parentId}/${studentId}`, {
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

export default parentStudentApi;
