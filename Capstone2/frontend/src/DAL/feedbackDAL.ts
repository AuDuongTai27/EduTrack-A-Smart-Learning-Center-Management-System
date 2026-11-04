import {
  approvalRequestApi,
  type CreateApprovalRequestPayload,
  type UpdateApprovalRequestPayload,
  type ReviewApprovalRequestPayload,
} from "../api/approvalRequestApi";

import type { ApprovalRequestDto } from "../BLL/models/ApprovalRequestDto";

export interface ApprovalRequestsFetchResult {
  data: ApprovalRequestDto[];
  isLiveApi: boolean;
  error?: string | null;
}

export const feedbackDAL = {
  async getAllRequests(): Promise<ApprovalRequestsFetchResult> {
    const data = await approvalRequestApi.getAll();
    return { data, isLiveApi: true };
  },

  async getRequestById(id: number): Promise<ApprovalRequestDto> {
    return approvalRequestApi.getById(id);
  },

  async createRequest(
    dto: CreateApprovalRequestPayload,
  ): Promise<ApprovalRequestDto> {
    return approvalRequestApi.create(dto);
  },

  async updateRequest(
    id: number,
    dto: UpdateApprovalRequestPayload,
  ): Promise<ApprovalRequestDto> {
    return approvalRequestApi.update(id, dto);
  },

  async reviewRequest(
    id: number,
    dto: ReviewApprovalRequestPayload,
  ): Promise<ApprovalRequestDto> {
    return approvalRequestApi.review(id, dto);
  },

  getAll(): Promise<ApprovalRequestsFetchResult> {
    return this.getAllRequests();
  },

  getById(id: number): Promise<ApprovalRequestDto> {
    return this.getRequestById(id);
  },
};

export const approvalRequestDAL = feedbackDAL;
export default feedbackDAL;
