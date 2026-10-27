import type { UserDto } from '../BLL/models/UserDto';
import type { ClassDto } from '../BLL/models/ClassDto';
import type { SubjectDto } from '../BLL/models/SubjectDto';
import type { ParentStudentDto } from './parentStudentApi';

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
 * [Bounded Context: Management]
 * Tầng Network API dành riêng cho Thành viên 1 (Center Manager & Admin Staff)
 * Chứa toàn bộ các thao tác POST / PUT / PATCH / DELETE (và GET nâng cao) của nhánh Management.
 */
export const managementApi = {
  // ==========================================================================
  // 1. QUẢN LÝ NGƯỜI DÙNG & HỌC SINH (USERS)
  // ==========================================================================
  async createUser(data: {
    userCode?: string;
    fullName: string;
    email?: string;
    phone?: string;
    role: string;
    specialty?: string;
    gender?: string;
  }): Promise<UserDto> {
    const res = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody.message || `HTTP Error ${res.status}: ${res.statusText}`);
    }
    return await res.json();
  },

  async updateUser(
    id: number,
    data: {
      fullName: string;
      email?: string;
      phone?: string;
      role?: string;
      specialty?: string;
      gender?: string;
      status?: string;
    }
  ): Promise<UserDto> {
    const res = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody.message || `HTTP Error ${res.status}: ${res.statusText}`);
    }
    return await res.json();
  },

  async updateUserStatus(id: number, status: string): Promise<{ success: boolean; status: string; message: string }> {
    const res = await fetch(`${API_BASE_URL}/users/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody.message || `HTTP Error ${res.status}: ${res.statusText}`);
    }
    return await res.json();
  },

  async deleteUser(id: number): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody.message || `HTTP Error ${res.status}: ${res.statusText}`);
    }
    return await res.json();
  },

  // ==========================================================================
  // 2. LIÊN KẾT PHỤ HUYNH - HỌC SINH (PARENT - STUDENT LINKS)
  // ==========================================================================
  async assignParentStudent(dto: {
    parentId: number;
    studentId: number;
    relationship?: string;
    isPrimaryContact?: boolean;
  }): Promise<ParentStudentDto> {
    const res = await fetch(`${API_BASE_URL}/parentstudents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    });
    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody.message || `HTTP Error ${res.status}: ${res.statusText}`);
    }
    return await res.json();
  },

  async removeParentStudent(parentId: number, studentId: number): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE_URL}/parentstudents/${parentId}/${studentId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody.message || `HTTP Error ${res.status}: ${res.statusText}`);
    }
    return await res.json();
  },

  // ==========================================================================
  // 3. QUẢN LÝ MÔN HỌC (SUBJECTS)
  // ==========================================================================
  async createSubject(data: { subjectCode: string; subjectName: string; description?: string }): Promise<SubjectDto> {
    const res = await fetch(`${API_BASE_URL}/subjects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody.message || `HTTP Error ${res.status}: ${res.statusText}`);
    }
    return await res.json();
  },

  async updateSubject(
    id: number,
    data: { subjectCode?: string; subjectName: string; description?: string }
  ): Promise<SubjectDto> {
    const res = await fetch(`${API_BASE_URL}/subjects/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody.message || `HTTP Error ${res.status}: ${res.statusText}`);
    }
    return await res.json();
  },

  async deleteSubject(id: number): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE_URL}/subjects/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody.message || `HTTP Error ${res.status}: ${res.statusText}`);
    }
    return await res.json();
  },

  // ==========================================================================
  // 4. QUẢN LÝ LỚP HỌC (CLASSES)
  // ==========================================================================
  async createClass(data: CreateClassRequest): Promise<ClassDto> {
    const res = await fetch(`${API_BASE_URL}/classes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(err.message || `Lỗi khi tạo lớp học: ${res.status}`);
    }
    return await res.json();
  },

  async updateClass(id: number, data: UpdateClassRequest): Promise<ClassDto> {
    const res = await fetch(`${API_BASE_URL}/classes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(err.message || `Lỗi khi cập nhật lớp học: ${res.status}`);
    }
    return await res.json();
  },

  async deleteClass(id: number): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE_URL}/classes/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(err.message || `Lỗi khi xóa lớp học: ${res.status}`);
    }
    return await res.json();
  },

  // TODO [Thành viên 1 - Center Manager & Admin Staff]:
  // Viết bổ sung các hàm API mới cho các trang còn lại của CM & Admin Staff tại đây.
};

export default managementApi;
