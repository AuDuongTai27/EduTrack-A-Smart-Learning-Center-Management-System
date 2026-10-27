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

/**
 * [CQRS Query Side] Tầng Network API đọc dữ liệu Liên kết Phụ huynh - Học sinh dùng chung
 */
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
};

export default parentStudentApi;
