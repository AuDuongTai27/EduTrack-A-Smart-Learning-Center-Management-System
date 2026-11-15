import type { GradeDto } from "../BLL/models/GradeDto";
import { apiError } from "./apiError";

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

export function readGradeResponse(item: unknown): GradeDto {
  if (!item || typeof item !== "object" || !("gradeId" in item) || !Number.isSafeInteger(item.gradeId)
    || Number(item.gradeId) < 1 || Number(item.gradeId) > 2_147_483_647
    || !("gradeName" in item) || typeof item.gradeName !== "string" || !item.gradeName.trim())
    throw new Error("Invalid grade level data. Please reload.");
  return item as GradeDto;
}

export const gradeApi = {
  async getAll(): Promise<GradeDto[]> {
    const response = await fetch(`${API_BASE_URL}/grades`, {headers: {Accept: "application/json"}});
    if (!response.ok) throw await apiError(response, "Failed to load grade levels.");
    const data: unknown = await response.json();
    if (!Array.isArray(data))
      throw new Error("Invalid grade level list. Please reload.");
    const items = data.map(readGradeResponse);
    if (new Set(items.map(item => item.gradeId)).size !== items.length)
      throw new Error("Invalid grade level list. Please reload.");
    return items.sort((a, b) => a.gradeId - b.gradeId);
  },
  async getById(id: number): Promise<GradeDto> {
    if (!Number.isSafeInteger(id) || id <= 0) throw new Error("Invalid grade level ID.");
    const response = await fetch(`${API_BASE_URL}/grades/${id}`, {headers: {Accept: "application/json"}});
    if (!response.ok) throw await apiError(response, "Failed to load grade level.");
    const item = readGradeResponse(await response.json());
    if (item.gradeId !== id) throw new Error("Server returned the wrong grade level. Please reload.");
    return item;
  },
};
