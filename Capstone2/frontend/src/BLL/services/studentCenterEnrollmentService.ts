import type { ClassDto } from "../models/ClassDto";
import type { StudentCenterEnrollment } from "../../api/studentEnrollmentApi";
import { eligibleEnrollmentClasses } from "./studentEnrollmentService";

export function enrollmentStatus(status: string) {
  switch (status.trim().toLowerCase()) {
    case "active": return { label: "Active", badge: "bg-success-subtle text-success", canDrop: true };
    case "completed": return { label: "Completed", badge: "bg-primary-subtle text-primary", canDrop: false };
    case "dropped": return { label: "Dropped", badge: "bg-secondary-subtle text-secondary", canDrop: false };
    default: return { label: `Other status: ${status}`, badge: "bg-warning-subtle text-dark", canDrop: false };
  }
}

export function availableStudentClasses(classes: ClassDto[], gradeId: number | null, rows: StudentCenterEnrollment[]) {
  const retained = new Set(rows.map(row => row.classId));
  return gradeId == null ? [] : eligibleEnrollmentClasses(classes, gradeId).filter(item => !retained.has(item.classId));
}
