import type { ClassDetailData } from "../BLL/models/ClassManagement";
import { apiError } from "./apiError";

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";
const endpoints = {students: "studentclasses", teachers: "teacherclasses", assistants: "taclasses",
  schedules: "classschedules", sessions: "classsessions"} as const;
export type ClassRelation = keyof typeof endpoints;
export const classManagementApi = {
  async getRelation<K extends ClassRelation>(kind: K, classId: number): Promise<ClassDetailData[K]> {
    const response = await fetch(`${API_BASE_URL}/${endpoints[kind]}`, {headers: {Accept: "application/json"}});
    if (!response.ok) throw await apiError(response, "Không tải được thông tin lớp học.");
    const data: unknown = await response.json();
    if (!Array.isArray(data) || data.some(item => !item || !Number.isInteger(item.classId)))
      throw new Error("Dữ liệu liên kết lớp học không hợp lệ. Vui lòng tải lại.");
    return data.filter(item => item.classId === classId) as ClassDetailData[K];
  },
};
