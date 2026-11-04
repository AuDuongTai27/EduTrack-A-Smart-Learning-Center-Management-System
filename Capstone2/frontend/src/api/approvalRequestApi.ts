import type { ApprovalRequestDto } from "../BLL/models/ApprovalRequestDto";

export interface CreateApprovalRequestPayload {
  requestedBy: number;
  requestType: string;
  title: string;
  reason: string;
  description?: string;
  priority: string;
  studentId?: number | null;
  classId?: number | null;
  invoiceId?: number | null;
}

export type UpdateApprovalRequestPayload = CreateApprovalRequestPayload;

export interface ReviewApprovalRequestPayload {
  reviewedBy: number;
  status: "pending" | "approved" | "rejected";
  reviewNotes?: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

export const approvalRequestApi = {
  /**
   * GET /api/approvalrequests
   */
  async getAll(): Promise<ApprovalRequestDto[]> {
    const res = await fetch(`${API_BASE_URL}/approvalrequests`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
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
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      throw new Error(`HTTP Error ${res.status}: ${res.statusText}`);
    }

    return await res.json();
  },

  /**
   * POST /api/approvalrequests
   */
  async create(dto: CreateApprovalRequestPayload): Promise<ApprovalRequestDto> {
    const res = await fetch(`${API_BASE_URL}/approvalrequests`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dto),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => null);
      throw new Error(error?.message || `HTTP ${res.status}`);
    }

    return res.json();
  },

  /**
   * PUT /api/approvalrequests/{id}
   */
  async update(
    id: number,
    dto: UpdateApprovalRequestPayload,
  ): Promise<ApprovalRequestDto> {
    const res = await fetch(`${API_BASE_URL}/approvalrequests/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dto),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => null);
      throw new Error(error?.message || `HTTP ${res.status}`);
    }

    return res.json();
  },

  /**
   * PUT /api/approvalrequests/{id}/review
   */
  async review(
    id: number,
    dto: ReviewApprovalRequestPayload,
  ): Promise<ApprovalRequestDto> {
    const res = await fetch(`${API_BASE_URL}/approvalrequests/${id}/review`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dto),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => null);
      throw new Error(error?.message || `HTTP ${res.status}`);
    }

    return res.json();
  },
};

export default approvalRequestApi;
