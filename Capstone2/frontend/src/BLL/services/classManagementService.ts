import type { ClassDto } from "../models/ClassDto";
import type { SubjectDto } from "../models/SubjectDto";
import type { ClassFormValues } from "../models/ClassManagement";
import type { GradeDto } from "../models/GradeDto";

export const CLASS_STATUSES = ["active", "upcoming", "completed", "inactive"];
export const CREATE_CLASS_STATUSES = ["active", "upcoming"];
export function emptyClassForm(): ClassFormValues {
  return {className: "", gradeId: "", subjectId: "", room: "", tuitionFee: "", startDate: "", endDate: "", status: "active"};
}
export function classToForm(item: ClassDto): ClassFormValues {
  return {className: item.className, gradeId: item.gradeId == null ? "" : String(item.gradeId), subjectId: String(item.subjectId), room: item.room ?? "",
    tuitionFee: String(item.tuitionFee), startDate: item.startDate?.slice(0, 10) ?? "",
    endDate: item.endDate?.slice(0, 10) ?? "", status: item.status};
}
function validDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || value < "1000-01-01") return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}
export function suggestedClassEndDate(startDate: string): string {
  if (!validDate(startDate)) return "";
  const [year, month, day] = startDate.split("-").map(Number);
  if (year === 9999 && month === 12) return "";
  const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  return new Date(Date.UTC(year, month, Math.min(day, lastDay))).toISOString().slice(0, 10);
}
export function validateClassForm(form: ClassFormValues, subjects: SubjectDto[], mode: "create" | "edit" = "create",
  grades: GradeDto[] = [], allowUnclassified = false): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!form.className.trim()) errors.className = "Please enter class name.";
  else if (form.className.trim().length > 150) errors.className = "Class name must be at most 150 characters.";
  const subjectId = Number(form.subjectId);
  const gradeId = Number(form.gradeId);
  if (!(mode === "edit" && allowUnclassified && form.gradeId === "")
    && (!Number.isSafeInteger(gradeId) || !grades.some(grade => grade.gradeId === gradeId)))
    errors.gradeId = "Please select a valid grade level from the list.";
  if (!Number.isSafeInteger(subjectId) || subjectId <= 0 || !subjects.some(s => s.subjectId === subjectId))
    errors.subjectId = "Please select a valid subject from the list.";
  if (form.room.trim().length > 50) errors.room = "Room must be at most 50 characters.";
  const fee = Number(form.tuitionFee);
  if (!form.tuitionFee.trim() || !/^\d+(?:\.\d{1,2})?$/.test(form.tuitionFee.trim()) || !Number.isFinite(fee) || fee < 0 || fee > 9_999_999_999.99)
    errors.tuitionFee = "Tuition fee must be non-negative, up to 9,999,999,999.99 VND and 2 decimal places.";
  if (!validDate(form.startDate)) errors.startDate = "Please select a valid start date.";
  if (form.endDate && !validDate(form.endDate)) errors.endDate = "Invalid end date.";
  else if (form.endDate && validDate(form.startDate) && form.endDate < form.startDate)
    errors.endDate = "End date cannot be before start date.";
  if (!form.status.trim() || form.status.length > 20) errors.status = "Please select a valid status.";
  else if (mode === "create" && !CREATE_CLASS_STATUSES.includes(form.status.trim().toLowerCase()))
    errors.status = "New class status can only be Active or Upcoming.";
  return errors;
}
export function classFormPayload(form: ClassFormValues) {
  return {className: form.className.trim(), gradeId: form.gradeId === "" ? null : Number(form.gradeId), subjectId: Number(form.subjectId), room: form.room.trim() || null,
    tuitionFee: Number(form.tuitionFee), startDate: form.startDate, endDate: form.endDate || null, status: form.status};
}
export function filterClasses(items: ClassDto[], search: string, subject: string, status: string, sort: string, grade = "All") {
  const query = search.trim().toLocaleLowerCase("vi-VN");
  return items.filter(item => (!query || item.className.toLocaleLowerCase("vi-VN").includes(query))
    && (subject === "All" || String(item.subjectId) === subject)
    && (grade === "All" || (grade === "unclassified" ? item.gradeId == null : String(item.gradeId) === grade))
    && (status === "All" || item.status.toLowerCase() === status.toLowerCase()))
    .sort((a, b) => sort === "newest" ? b.classId - a.classId : sort === "oldest" ? a.classId - b.classId
      : (sort === "za" ? -1 : 1) * a.className.localeCompare(b.className, "vi", {numeric: true}));
}
export function classGradeLabel(item: Pick<ClassDto, "gradeId" | "gradeName">): string {
  return item.gradeId == null ? "Unclassified" : item.gradeName || `Grade #${item.gradeId}`;
}
export function groupClassesByGrade(items: ClassDto[]) {
  const groups = new Map<number | null, {gradeId: number | null; label: string; classes: ClassDto[]}>();
  for (const item of items) {
    const key = item.gradeId ?? null;
    if (!groups.has(key)) groups.set(key, {gradeId: key, label: classGradeLabel(item), classes: []});
    groups.get(key)!.classes.push(item);
  }
  return [...groups.values()].sort((a, b) => (a.gradeId ?? Infinity) - (b.gradeId ?? Infinity));
}
export function classError(cause: unknown): string {
  const message = cause instanceof Error ? cause.message : "Unable to process request. Please try again.";
  return /failed to fetch|networkerror|load failed/i.test(message) ? "Cannot connect to server. Please check your connection and try again." : message;
}
export function classDate(value?: string | null): string {
  const date = value?.slice(0, 10);
  return date && validDate(date) ? date.split("-").reverse().join("/") : "—";
}
