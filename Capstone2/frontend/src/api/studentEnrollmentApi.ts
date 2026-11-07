import { apiError } from "./apiError";

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";
export interface StudentCenterEnrollment {
  scId: number;
  studentId: number;
  classId: number;
  className: string;
  status: string;
  enrolledDate: string | null;
  droppedAt: string | null;
  dropReason: string | null;
}

export function readStudentEnrollments(data: unknown, studentId: number): StudentCenterEnrollment[] {
  if (!Array.isArray(data) || data.some(row => !row || typeof row !== "object"
    || !Number.isSafeInteger(row.scId) || row.scId <= 0 || row.studentId !== studentId
    || !Number.isSafeInteger(row.classId) || row.classId <= 0
    || typeof row.className !== "string" || typeof row.status !== "string" || !row.status.trim())
    || new Set(data.map(row => row.scId)).size !== data.length
    || new Set(data.map(row => row.classId)).size !== data.length)
    throw new Error("Chưa xác nhận được danh sách lớp đã lưu. Vui lòng tải lại lớp để kiểm tra.");
  return data as StudentCenterEnrollment[];
}

async function call(studentId: number, path: string, init?: RequestInit): Promise<StudentCenterEnrollment[]> {
  if (!Number.isSafeInteger(studentId) || studentId <= 0) throw new Error("Học sinh không hợp lệ.");
  let response: Response;
  try { response = await fetch(`${API_BASE_URL}/${path}`, { ...init, headers: { "Content-Type": "application/json" } }); }
  catch { throw new Error("Chưa xác nhận được kết quả cập nhật lớp do lỗi kết nối. Tải lại lớp để kiểm tra trước khi thử lại."); }
  if (!response.ok) throw await apiError(response, "Không cập nhật được lớp của học sinh.");
  return readStudentEnrollments(await response.json(), studentId);
}

export const studentEnrollmentApi = {
  getForStudent: (studentId: number) => call(studentId, `studentclasses?studentId=${studentId}`),
  async add(studentId: number, gradeId: number, classIds: number[]) {
    const result = await call(studentId, `users/${studentId}/enrollments`, { method: "POST", body: JSON.stringify({ gradeId, classIds }) });
    if (!classIds.every(id => result.some(row => row.classId === id && row.status.trim().toLowerCase() === "active")))
      throw new Error("Phản hồi chưa xác nhận đủ các lớp đã chọn. Tải lại lớp để kiểm tra kết quả.");
    return result;
  },
  async drop(studentId: number, scId: number, reason: string) {
    const result = await call(studentId, `users/${studentId}/enrollments/${scId}/drop`, { method: "PATCH", body: JSON.stringify({ reason }) });
    if (!result.some(row => row.scId === scId && row.status.trim().toLowerCase() === "dropped"))
      throw new Error("Chưa xác nhận lớp đã ngừng học. Tải lại lớp để kiểm tra kết quả.");
    return result;
  },
};
