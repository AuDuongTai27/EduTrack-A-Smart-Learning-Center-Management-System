import type { UserDto } from "../models/UserDto";
import type { ClassTaDto, ClassTeacherDto } from "../models/ClassManagement";

export type ClassStaffKind = "teachers" | "assistants";
export type ClassStaffAssignment = ClassTeacherDto | ClassTaDto;

export function eligibleClassStaff(users: UserDto[], kind: ClassStaffKind, assignments: ClassStaffAssignment[]): UserDto[] {
  const role = kind === "teachers" ? "teacher" : "teaching_assistant";
  const assigned = new Set(assignments.filter(item => item.status?.toLowerCase() === "active")
    .map(item => "teacherId" in item ? item.teacherId : item.taId));
  return users.filter(user => user.status?.toLowerCase() === "active"
    && user.roles?.some(name => name.toLowerCase() === role) && !assigned.has(user.userId))
    .sort((a, b) => a.fullName.localeCompare(b.fullName, "vi"));
}
