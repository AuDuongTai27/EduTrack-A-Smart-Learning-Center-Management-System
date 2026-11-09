import type { GradeDto } from "../BLL/models/GradeDto";
import { apiError } from "./apiError";

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

export function readGradeResponse(item: unknown): GradeDto {
  if (!item || typeof item !== "object" || !("gradeId" in item) || !Number.isSafeInteger(item.gradeId)
    || Number(item.gradeId) < 1 || Number(item.gradeId) > 2_147_483_647
    || !("gradeName" in item) || typeof item.gradeName !== "string" || !item.gradeName.trim())
    throw new Error("Dữ liệu khối lớp không hợp lệ. Vui lòng tải lại.");
  return item as GradeDto;
}

export const gradeApi = {
  async getAll(): Promise<GradeDto[]> {
    const response = await fetch(`${API_BASE_URL}/grades`, {headers: {Accept: "application/json"}});
    if (!response.ok) throw await apiError(response, "Không tải được danh mục khối lớp.");
    const data: unknown = await response.json();
    if (!Array.isArray(data))
      throw new Error("Danh mục khối lớp không hợp lệ. Vui lòng tải lại.");
    const items = data.map(readGradeResponse);
    if (new Set(items.map(item => item.gradeId)).size !== items.length)
      throw new Error("Danh mục khối lớp không hợp lệ. Vui lòng tải lại.");
    return items.sort((a, b) => a.gradeId - b.gradeId);
  },
  async getById(id: number): Promise<GradeDto> {
    if (!Number.isSafeInteger(id) || id <= 0) throw new Error("Mã khối lớp không hợp lệ.");
    const response = await fetch(`${API_BASE_URL}/grades/${id}`, {headers: {Accept: "application/json"}});
    if (!response.ok) throw await apiError(response, "Không tải được khối lớp.");
    const item = readGradeResponse(await response.json());
    if (item.gradeId !== id) throw new Error("Máy chủ trả về sai khối lớp. Vui lòng tải lại.");
    return item;
  },
};
