import {
  managementApi,
  type CreateClassRequest,
  type UpdateClassRequest,
  type CreateTuitionInvoiceRequest,
  type UpdateTuitionInvoiceRequest,
  type RecordPaymentRequest,
} from "../api/managementApi";

import type { UserDto } from "../BLL/models/UserDto";
import type { ClassDto } from "../BLL/models/ClassDto";
import type { SubjectDto } from "../BLL/models/SubjectDto";
import type { TuitionDto, PaymentDto } from "../BLL/models/TuitionDto";
import type { ParentStudentDto } from "../api/parentStudentApi";

export interface ClassActionResult {
  success: boolean;
  data?: ClassDto;
  message?: string;
  isLiveApi: boolean;
}

/**
 * [Bounded Context: Management]
 * All mutations must be confirmed by the Backend.
 * API errors intentionally propagate to the calling page's catch handler.
 * No fabricated IDs, mock entities, or local-only success responses.
 */
export const managementDAL = {
  // Users
  async createUser(dto: {
    userCode?: string;
    fullName: string;
    email?: string;
    phone?: string;
    role: string;
    specialty?: string;
    gender?: string;
  }): Promise<{ data: UserDto; isLiveApi: boolean }> {
    const created = await managementApi.createUser(dto);
    return { data: created, isLiveApi: true };
  },

  async updateUser(
    id: number,
    dto: {
      fullName: string;
      email?: string;
      phone?: string;
      role?: string;
      specialty?: string;
      gender?: string;
      status?: string;
    },
  ): Promise<{ data: UserDto; isLiveApi: boolean }> {
    const updated = await managementApi.updateUser(id, dto);
    return { data: updated, isLiveApi: true };
  },

  async updateUserStatus(
    id: number,
    status: string,
  ): Promise<{ success: boolean; isLiveApi: boolean }> {
    await managementApi.updateUserStatus(id, status);
    return { success: true, isLiveApi: true };
  },

  async deleteUser(
    id: number,
  ): Promise<{ success: boolean; isLiveApi: boolean; message?: string }> {
    const result = await managementApi.deleteUser(id);
    return { success: true, isLiveApi: true, message: result.message };
  },

  // Parent/student links: retained for compatibility until role scope is reconciled.
  async assignLink(dto: {
    parentId: number;
    studentId: number;
    relationship?: string;
    isPrimaryContact?: boolean;
  }): Promise<{ data: ParentStudentDto; isLiveApi: boolean }> {
    const created = await managementApi.assignParentStudent(dto);
    return { data: created, isLiveApi: true };
  },

  async removeLink(
    parentId: number,
    studentId: number,
  ): Promise<{ success: boolean; isLiveApi: boolean }> {
    await managementApi.removeParentStudent(parentId, studentId);
    return { success: true, isLiveApi: true };
  },

  // Subjects
  async createSubject(dto: {
    subjectCode: string;
    subjectName: string;
    description?: string;
  }): Promise<{ data: SubjectDto; isLiveApi: boolean }> {
    const created = await managementApi.createSubject(dto);
    return { data: created, isLiveApi: true };
  },

  async updateSubject(
    id: number,
    dto: { subjectCode?: string; subjectName: string; description?: string },
  ): Promise<{ data: SubjectDto; isLiveApi: boolean }> {
    const updated = await managementApi.updateSubject(id, dto);
    return { data: updated, isLiveApi: true };
  },

  async deleteSubject(
    id: number,
  ): Promise<{ success: boolean; isLiveApi: boolean; message?: string }> {
    const result = await managementApi.deleteSubject(id);
    return { success: true, isLiveApi: true, message: result.message };
  },

  // Classes
  async createClass(dto: CreateClassRequest): Promise<ClassActionResult> {
    const created = await managementApi.createClass(dto);
    return { success: true, data: created, isLiveApi: true };
  },

  async updateClass(
    id: number,
    dto: UpdateClassRequest,
  ): Promise<ClassActionResult> {
    const updated = await managementApi.updateClass(id, dto);
    return { success: true, data: updated, isLiveApi: true };
  },

  async deleteClass(
    id: number,
  ): Promise<{ success: boolean; message?: string; isLiveApi: boolean }> {
    const result = await managementApi.deleteClass(id);
    return { success: true, message: result.message, isLiveApi: true };
  },

  // Tuition: already uses the real API for all mutations.
  async createTuitionInvoice(
    dto: CreateTuitionInvoiceRequest,
  ): Promise<{ data: TuitionDto; isLiveApi: boolean }> {
    const created = await managementApi.createTuitionInvoice(dto);
    return { data: created, isLiveApi: true };
  },

  async updateTuitionInvoice(
    id: number,
    dto: UpdateTuitionInvoiceRequest,
  ): Promise<{ data: TuitionDto; isLiveApi: boolean }> {
    const updated = await managementApi.updateTuitionInvoice(id, dto);
    return { data: updated, isLiveApi: true };
  },

  async recordTuitionPayment(
    invoiceId: number,
    dto: RecordPaymentRequest,
  ): Promise<{ data: PaymentDto; isLiveApi: boolean }> {
    const payment = await managementApi.recordTuitionPayment(invoiceId, dto);
    return { data: payment, isLiveApi: true };
  },
};

export default managementDAL;
