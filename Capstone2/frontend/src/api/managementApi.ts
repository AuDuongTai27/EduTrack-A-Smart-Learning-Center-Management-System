import type { UserDto } from "../BLL/models/UserDto";
import type { ClassDto } from "../BLL/models/ClassDto";
import type { SubjectDto } from "../BLL/models/SubjectDto";
import type { TuitionDto, PaymentDto } from "../BLL/models/TuitionDto";
import type { ParentStudentDto } from "./parentStudentApi";
import { apiError } from "./apiError";
import { readClassResponse } from "./classApi";

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

export interface CreateStudentRequest {
  userCode: string;
  fullName: string;
  email?: string;
  phone?: string;
  role: "student";
  specialty?: string;
  gender: string;
  gradeId: number | null;
  classIds: number[];
}

export class StudentCreationConflictError extends Error {
  readonly studentId: number;
  readonly studentCode: string;
  constructor(message: string, studentId: number, studentCode: string) {
    super(message);
    this.studentId = studentId;
    this.studentCode = studentCode;
  }
}

export interface CreateClassRequest {
  className: string;
  gradeId: number | null;
  subjectId: number;
  room?: string | null;
  tuitionFee: number;
  startDate: string;
  endDate?: string | null;
  status?: string;
}

export interface UpdateClassRequest {
  className: string;
  gradeId: number | null;
  subjectId: number;
  room?: string | null;
  tuitionFee: number;
  startDate: string;
  endDate?: string | null;
  status: string;
}

export interface CreateTuitionInvoiceRequest {
  studentId: number;
  classId: number;
  periodMonth: number;
  periodYear: number;
  amountDue: number;
}

export interface UpdateTuitionInvoiceRequest {
  periodMonth: number;
  periodYear: number;
  amountDue: number;
  dueDate: string;
  status?: string;
}

export interface RecordPaymentRequest {
  amount: number;
  paymentMethod: string;
  externalPaymentVerified?: boolean;
  transactionCode?: string;
  paidByUserId?: number;
  recordedBy?: number;
  note?: string;
  additionalChargeAmount?: number;
  additionalChargeNote?: string;
}

/**
 * [Bounded Context: Management]
 * Tầng Network API dành riêng cho Thành viên 1 (Center Manager & Admin Staff)
 * Chứa toàn bộ các thao tác POST / PUT / PATCH / DELETE (và GET nâng cao) của nhánh Management.
 */
export const managementApi = {
  async createStudent(data: CreateStudentRequest): Promise<UserDto> {
    let response: Response;
    try {
      response = await fetch(`${API_BASE_URL}/users/students`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
      });
    } catch {
      throw new Error("Mất kết nối khi lưu học sinh và đăng ký lớp. Giữ nguyên form và bấm Lưu hồ sơ để thử lại an toàn cùng yêu cầu.");
    }
    if (!response.ok) {
      if (response.status === 409) {
        const conflict = await response.clone().json().catch(() => null);
        if (conflict?.code === "student_creation_conflict" && Number.isSafeInteger(conflict.existingStudentId)
          && conflict.existingStudentId > 0 && conflict.existingStudentCode === data.userCode)
          throw new StudentCreationConflictError(conflict.message, conflict.existingStudentId, conflict.existingStudentCode);
      }
      throw await apiError(response, "Không thể hoàn tất việc lưu học sinh và đăng ký lớp. Giữ nguyên form và thử lại.");
    }
    const result = await response.json().catch(() => null);
    if (!result || !Number.isSafeInteger(result.userId) || result.userId <= 0
      || result.userCode !== data.userCode || result.gradeId !== data.gradeId
      || typeof result.fullName !== "string" || !result.roles?.includes("student"))
      throw new Error("Máy chủ chưa xác nhận kết quả hợp lệ. Giữ nguyên form và bấm Lưu hồ sơ để kiểm tra lại cùng yêu cầu.");
    return result;
  },
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
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(
        errBody.message || `HTTP Error ${res.status}: ${res.statusText}`,
      );
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
      gradeId?: number | null;
      gender?: string;
      status?: string;
    },
  ): Promise<UserDto> {
    const res = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw await apiError(res, "Không thể cập nhật hồ sơ.");
    const updated: UserDto = await res.json();
    if ("gradeId" in data && updated.gradeId !== data.gradeId)
      throw new Error("Máy chủ chưa xác nhận khối lớp đã lưu. Vui lòng mở lại hồ sơ để kiểm tra trước khi thử lại.");
    return updated;
  },

  async updateUserStatus(
    id: number,
    status: string,
  ): Promise<{ success: boolean; status: string; message: string }> {
    const res = await fetch(`${API_BASE_URL}/users/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(
        errBody.message || `HTTP Error ${res.status}: ${res.statusText}`,
      );
    }
    return await res.json();
  },

  async deleteUser(id: number): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(
        errBody.message || `HTTP Error ${res.status}: ${res.statusText}`,
      );
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
    updateExisting?: boolean;
  }): Promise<ParentStudentDto> {
    const res = await fetch(`${API_BASE_URL}/parentstudents`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dto),
    });
    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(
        errBody.message || `HTTP Error ${res.status}: ${res.statusText}`,
      );
    }
    return await res.json();
  },

  async removeParentStudent(
    parentId: number,
    studentId: number,
  ): Promise<{ success: boolean; message: string }> {
    const res = await fetch(
      `${API_BASE_URL}/parentstudents/${parentId}/${studentId}`,
      {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      },
    );
    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(
        errBody.message || `HTTP Error ${res.status}: ${res.statusText}`,
      );
    }
    return await res.json();
  },

  // ==========================================================================
  // 3. QUẢN LÝ MÔN HỌC (SUBJECTS)
  // ==========================================================================
  async createSubject(data: {
    subjectCode: string;
    subjectName: string;
    description?: string;
  }): Promise<SubjectDto> {
    const res = await fetch(`${API_BASE_URL}/subjects`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(
        errBody.message || `HTTP Error ${res.status}: ${res.statusText}`,
      );
    }
    return await res.json();
  },

  async updateSubject(
    id: number,
    data: { subjectCode?: string; subjectName: string; description?: string },
  ): Promise<SubjectDto> {
    const res = await fetch(`${API_BASE_URL}/subjects/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(
        errBody.message || `HTTP Error ${res.status}: ${res.statusText}`,
      );
    }
    return await res.json();
  },

  async deleteSubject(
    id: number,
  ): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE_URL}/subjects/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(
        errBody.message || `HTTP Error ${res.status}: ${res.statusText}`,
      );
    }
    return await res.json();
  },

  // ==========================================================================
  // 4. QUẢN LÝ LỚP HỌC (CLASSES)
  // ==========================================================================
  async createClass(data: CreateClassRequest): Promise<ClassDto> {
    const res = await fetch(`${API_BASE_URL}/classes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      throw await apiError(res, "Không thể tạo lớp học.");
    }
    return readClassResponse(await res.json());
  },

  async updateClass(id: number, data: UpdateClassRequest): Promise<ClassDto> {
    const res = await fetch(`${API_BASE_URL}/classes/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      throw await apiError(res, "Không thể cập nhật lớp học.");
    }
    const item = readClassResponse(await res.json());
    if (item.classId !== id) throw new Error("Phản hồi cập nhật không đúng lớp. Hãy tải lại danh sách để kiểm tra.");
    return item;
  },

  async deleteClass(id: number): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE_URL}/classes/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) {
      throw await apiError(res, "Không thể xóa lớp học.");
    }
    if (res.status === 204) return {message: "Đã xóa lớp học."};
    return await res.json();
  },

  // ==========================================================================
  // 5. QUẢN LÝ HỌC PHÍ (TUITION)
  // ==========================================================================

  async createTuitionInvoice(
    data: CreateTuitionInvoiceRequest,
  ): Promise<TuitionDto> {
    const res = await fetch(`${API_BASE_URL}/tuitioninvoices`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({
        message: res.statusText,
      }));

      throw new Error(err.message || `Lỗi khi tạo hóa đơn: ${res.status}`);
    }

    return await res.json();
  },

  async updateTuitionInvoice(
    id: number,
    data: UpdateTuitionInvoiceRequest,
  ): Promise<TuitionDto> {
    const res = await fetch(`${API_BASE_URL}/tuitioninvoices/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({
        message: res.statusText,
      }));

      throw new Error(err.message || `Lỗi khi cập nhật hóa đơn: ${res.status}`);
    }

    return await res.json();
  },

  async recordTuitionPayment(
    invoiceId: number,
    data: RecordPaymentRequest,
  ): Promise<PaymentDto> {
    const res = await fetch(
      `${API_BASE_URL}/tuitioninvoices/${invoiceId}/payments`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      },
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({
        message: res.statusText,
      }));

      throw new Error(
        err.message || `Lỗi khi ghi nhận thanh toán: ${res.status}`,
      );
    }

    return await res.json();
  },
};

export default managementApi;
