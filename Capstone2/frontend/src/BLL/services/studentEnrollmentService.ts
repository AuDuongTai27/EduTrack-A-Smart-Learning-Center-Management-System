import type { ClassDto } from "../models/ClassDto";

export function eligibleEnrollmentClasses(classes: ClassDto[], gradeId: number): ClassDto[] {
  return [...new Map(classes.filter(c => c.gradeId === gradeId
    && ["active", "upcoming"].includes(c.status?.trim().toLowerCase())).map(c => [c.classId, c])).values()]
    .sort((a, b) => a.className.localeCompare(b.className, "vi", { numeric: true }));
}

export function toggleEnrollmentClass(selected: number[], id: number, checked: boolean): number[] {
  return checked ? [...new Set([...selected, id])] : selected.filter(value => value !== id);
}
