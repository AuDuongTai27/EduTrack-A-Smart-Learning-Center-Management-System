import type { ClassDetailData } from "../BLL/models/ClassManagement";
import { apiError } from "./apiError";

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";
const endpoints = {students: "studentclasses", teachers: "teacherclasses", assistants: "taclasses",
  schedules: "classschedules", sessions: "classsessions"} as const;
export type ClassRelation = keyof typeof endpoints;
export const classManagementApi = {
  async getRelation<K extends ClassRelation>(kind: K, classId: number): Promise<ClassDetailData[K]> {
    const response = await fetch(`${API_BASE_URL}/${endpoints[kind]}`, {headers: {Accept: "application/json"}});
    if (!response.ok) throw await apiError(response, "Failed to load class information.");
    const data: unknown = await response.json();
    if (!Array.isArray(data) || data.some(item => !item || !Number.isInteger(item.classId)))
      throw new Error("Invalid class association data. Please reload.");
    return data.filter(item => item.classId === classId) as ClassDetailData[K];
  },
};
