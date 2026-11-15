import type { GradeDto, ManagedGradeDto } from "../BLL/models/GradeDto";
import { gradeApi, readGradeResponse } from "./gradeApi";
import { apiError } from "./apiError";

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";
function summary(grade: GradeDto): ManagedGradeDto {
  if (!Number.isSafeInteger(grade.totalClasses) || Number(grade.totalClasses) < 0)
    throw new Error("Response is missing class count for the grade level. Please reload or check Backend.");
  return grade as ManagedGradeDto;
}
async function save(method: "POST" | "PUT", gradeName: string, id?: number) {
  const response = await fetch(`${API_BASE_URL}/grades${id === undefined ? "" : `/${id}`}`, {
    method, headers: {Accept: "application/json", "Content-Type": "application/json"}, body: JSON.stringify({gradeName}),
  });
  if (!response.ok) throw await apiError(response, "Failed to save grade level.");
  const item = summary(readGradeResponse(await response.json()));
  if (id !== undefined && item.gradeId !== id) throw new Error("Server confirmed the wrong grade level. Please reload.");
  return item;
}
export const gradeManagementApi = {
  async getAll() { return (await gradeApi.getAll()).map(summary); },
  async getById(id: number) { return summary(await gradeApi.getById(id)); },
  create(gradeName: string) { return save("POST", gradeName); },
  rename(id: number, gradeName: string) { return save("PUT", gradeName, id); },
  async delete(id: number) {
    const response = await fetch(`${API_BASE_URL}/grades/${id}`, {method: "DELETE", headers: {Accept: "application/json"}});
    if (!response.ok) throw await apiError(response, "Failed to delete grade level.");
    const data: unknown = await response.json();
    if (!data || typeof data !== "object" || !("message" in data) || typeof data.message !== "string"
      || ("success" in data && data.success === false)) throw new Error("Server has not confirmed deleting the grade level.");
  },
};
