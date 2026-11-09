import type { ClassDto } from '../BLL/models/ClassDto';
import { apiError } from './apiError';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export function readClassResponse(data: unknown): ClassDto {
  if (!data || typeof data !== 'object' || !('classId' in data) || !Number.isSafeInteger(data.classId)
      || Number(data.classId) <= 0 || !('className' in data) || typeof data.className !== 'string' || !data.className.trim()) {
    throw new Error('Phản hồi lớp học không hợp lệ. Hãy tải lại danh sách để kiểm tra kết quả.');
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
      throw await apiError(res, 'Không tải được danh sách lớp học.');
    }

    const data: unknown = await res.json();
    if (!Array.isArray(data)) throw new Error('Danh sách lớp học không hợp lệ.');
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
      throw await apiError(res, 'Không tải được chi tiết lớp học.');
    }

    const item = readClassResponse(await res.json());
    if (item.classId !== id) throw new Error('Máy chủ trả về sai lớp học. Vui lòng tải lại.');
    return item;
  },
};

export default classApi;
