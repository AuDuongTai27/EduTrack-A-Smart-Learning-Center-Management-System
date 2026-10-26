import type { ClassDto } from '../BLL/models/ClassDto';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export interface CreateClassRequest {
  className: string;
  subjectId: number;
  room?: string | null;
  tuitionFee: number;
  startDate: string;
  endDate?: string | null;
  status?: string;
}

export interface UpdateClassRequest {
  className: string;
  subjectId: number;
  room?: string | null;
  tuitionFee: number;
  startDate: string;
  endDate?: string | null;
  status: string;
}

/**
 * Tầng Network API thuần túy (HTTP Client)
 * Chịu trách nhiệm duy nhất: Gửi request HTTP tới Backend .NET
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

  /**
   * POST /api/classes
   */
  async create(data: CreateClassRequest): Promise<ClassDto> {
    const res = await fetch(`${API_BASE_URL}/classes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(err.message || `Lỗi khi tạo lớp học: ${res.status}`);
    }

    return await res.json();
  },

  /**
   * PUT /api/classes/{id}
   */
  async update(id: number, data: UpdateClassRequest): Promise<ClassDto> {
    const res = await fetch(`${API_BASE_URL}/classes/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(err.message || `Lỗi khi cập nhật lớp học: ${res.status}`);
    }

    return await res.json();
  },

  /**
   * DELETE /api/classes/{id}
   */
  async delete(id: number): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE_URL}/classes/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(err.message || `Lỗi khi xóa lớp học: ${res.status}`);
    }

    return await res.json();
  },
};

export default classApi;
