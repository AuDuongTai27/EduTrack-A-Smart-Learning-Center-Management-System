import type { ClassDto } from '../BLL/models/ClassDto';
import { apiError } from './apiError';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export function readClassResponse(data: unknown): ClassDto {
  if (!data || typeof data !== 'object' || !('classId' in data) || !Number.isSafeInteger(data.classId)
      || Number(data.classId) <= 0 || !('className' in data) || typeof data.className !== 'string' || !data.className.trim()) {
    throw new Error('Invalid class response. Please reload the list to verify the result.');
  }
  return data as ClassDto;
}

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
      throw await apiError(res, 'Failed to load class list.');
    }

    const data: unknown = await res.json();
    if (!Array.isArray(data)) throw new Error('Invalid class list.');
    return data.map(readClassResponse);
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
      throw await apiError(res, 'Failed to load class details.');
    }

    const item = readClassResponse(await res.json());
    if (item.classId !== id) throw new Error('Server returned the wrong class. Please reload.');
    return item;
  },
};

export default classApi;
