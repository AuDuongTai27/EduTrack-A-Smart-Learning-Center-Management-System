import type { ParentStudentDto } from "../../api/parentStudentApi";

export const emptyParentStudentLink = () => ({ parentId: 0, studentId: 0, relationship: "Mother", isPrimaryContact: true, updateExisting: false });
export type ParentStudentLinkForm = ReturnType<typeof emptyParentStudentLink>;

export function selectParentStudentPair(previous: ParentStudentLinkForm, patch: Partial<Pick<ParentStudentLinkForm, "parentId" | "studentId">>, links: ParentStudentDto[]): ParentStudentLinkForm {
  const pair = { ...previous, ...patch };
  const existing = links.find(link => link.parentId === pair.parentId && link.studentId === pair.studentId);
  return existing
    ? { ...pair, relationship: existing.relationship, isPrimaryContact: existing.isPrimaryContact, updateExisting: true }
    : { ...emptyParentStudentLink(), parentId: pair.parentId, studentId: pair.studentId };
}

export function parentStudentLinkError(form: ParentStudentLinkForm): string | null {
  return form.parentId > 0 && form.studentId > 0 && form.parentId !== form.studentId
    ? null : "Please select both a valid parent and student.";
}
