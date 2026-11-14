import type { GradeDto } from "../models/GradeDto";
import type { UserDto } from "../models/UserDto";

export const sortedStudentGrades = (grades: GradeDto[]) => [...grades]
  .sort((a, b) => a.gradeName.localeCompare(b.gradeName, "vi", { numeric: true }) || a.gradeId - b.gradeId);

export function studentGradeLabel(student: Pick<UserDto, "gradeId" | "gradeName">, grades: GradeDto[], loaded = true): string {
  if (student.gradeId == null) return "Unassigned Grade";
  const grade = grades.find(g => g.gradeId === student.gradeId);
  if (grade) return grade.gradeName;
  if (!loaded) return student.gradeName || `Loading grade #${student.gradeId}`;
  return `Invalid grade (#${student.gradeId})`;
}

export function legacyStudentGradeNote(student: Pick<UserDto, "gradeId" | "specialty">): string | null {
  return student.gradeId == null && student.specialty ? `Legacy data: ${student.specialty}` : null;
}

export function matchesStudentGrade(student: Pick<UserDto, "gradeId">, filter: string, grades: GradeDto[]): boolean {
  if (filter === "All") return true;
  if (filter === "unassigned") return student.gradeId == null;
  if (filter === "invalid") return student.gradeId != null && !grades.some(g => g.gradeId === student.gradeId);
  return student.gradeId != null && String(student.gradeId) === filter;
}

export function compareStudentGrades(a: UserDto, b: UserDto, grades: GradeDto[], descending = false): number {
  const left = grades.find(g => g.gradeId === a.gradeId), right = grades.find(g => g.gradeId === b.gradeId);
  if (!left || !right) return left ? -1 : right ? 1 : a.fullName.localeCompare(b.fullName, "vi");
  const result = left.gradeName.localeCompare(right.gradeName, "vi", { numeric: true }) || left.gradeId - right.gradeId;
  return (descending ? -result : result) || a.fullName.localeCompare(b.fullName, "vi");
}
