import type { ManagedGradeDto } from "../models/GradeDto";

export function normalizeGradeName(value: string): string {
  return value.normalize("NFKC").replace(/\s+/gu, " ").trim();
}
export function gradeNameError(value: string): string | null {
  const name = normalizeGradeName(value);
  return !name || name.length > 50 || Array.from(name).some(char => char.charCodeAt(0) < 32 || char.charCodeAt(0) === 127)
    ? "Tên khối lớp là bắt buộc, tối đa 50 ký tự và không chứa ký tự điều khiển." : null;
}
export function filterGrades(items: ManagedGradeDto[], search: string, sort: string) {
  const query = normalizeGradeName(search).toLocaleLowerCase("vi-VN");
  return items.filter(item => !query || item.gradeName.toLocaleLowerCase("vi-VN").includes(query))
    .sort((a, b) => sort === "newest" ? b.gradeId - a.gradeId : sort === "oldest" ? a.gradeId - b.gradeId
      : sort === "classes" ? b.totalClasses - a.totalClasses || a.gradeName.localeCompare(b.gradeName, "vi", {numeric: true})
        : (sort === "za" ? -1 : 1) * a.gradeName.localeCompare(b.gradeName, "vi", {numeric: true}));
}
