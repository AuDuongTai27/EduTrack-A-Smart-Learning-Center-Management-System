import type { ClassStaffAssignment, ClassStaffKind } from "../BLL/services/classStaffService";
import { apiError } from "./apiError";

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";
async function confirmedAssignment(response: Response, kind: ClassStaffKind, classId: number, userId: number,
  status: "active" | "inactive", assignmentId?: number): Promise<ClassStaffAssignment> {
  if (!response.ok) throw await apiError(response, "Không lưu được phân công. Vui lòng thử lại.");
  const data = await response.json();
  const idKey = kind === "teachers" ? "teacherClassId" : "taClassId";
  const userKey = kind === "teachers" ? "teacherId" : "taId";
  if (!data || !Number.isSafeInteger(data[idKey]) || data[idKey] <= 0 || data.classId !== classId
    || data[userKey] !== userId || data.status !== status || (assignmentId !== undefined && data[idKey] !== assignmentId))
    throw new Error("Máy chủ chưa xác nhận đúng phân công. Vui lòng tải lại danh sách trước khi thử lại.");
  return data;
}
export const classStaffApi = {
  async assign(kind: ClassStaffKind, classId: number, userId: number): Promise<ClassStaffAssignment> {
    if (!Number.isSafeInteger(classId) || classId <= 0 || !Number.isSafeInteger(userId) || userId <= 0)
      throw new Error("Vui lòng chọn lớp và tài khoản hợp lệ.");
    const response = await fetch(`${API_BASE_URL}/classes/${classId}/${kind}`, {
      method: "POST", headers: {"Content-Type": "application/json", Accept: "application/json"},
      body: JSON.stringify({userId}),
    });
    return confirmedAssignment(response, kind, classId, userId, "active");
  },
  async deactivate(kind: ClassStaffKind, classId: number, assignmentId: number, userId: number): Promise<ClassStaffAssignment> {
    if ([classId, assignmentId, userId].some(id => !Number.isSafeInteger(id) || id <= 0))
      throw new Error("Mã lớp hoặc phân công không hợp lệ.");
    const response = await fetch(`${API_BASE_URL}/classes/${classId}/${kind}/${assignmentId}/deactivate`, {
      method: "PATCH", headers: {Accept: "application/json"},
    });
    return confirmedAssignment(response, kind, classId, userId, "inactive", assignmentId);
  },
};
