import type { TuitionDto } from "../models/TuitionDto";
import type { ClassDto } from "../models/ClassDto";
import { matchesTuitionStatus } from "./tuitionMetricsService";
export interface TuitionFilters { grade: string; classId: string; month: string; year: string; search: string; status: string }
export function filterTuitionInvoices(invoices: TuitionDto[], classes: ClassDto[], filters: TuitionFilters) {
  const query = filters.search.trim().toLocaleLowerCase("vi");
  const classGrades = new Map(classes.map(c => [c.classId, c.gradeId]));
  return invoices.filter(i => (filters.grade === "All" || String(classGrades.has(i.classId) ? classGrades.get(i.classId) : i.classGradeId) === filters.grade)
    && (filters.classId === "All" || String(i.classId) === filters.classId)
    && (!filters.month || i.periodMonth === Number(filters.month)) && (!filters.year || i.periodYear === Number(filters.year))
    && (!query || [i.studentName, i.studentCode, i.className, i.invoiceCode, `INV-${i.invoiceId}`].some(v => v?.toLocaleLowerCase("vi").includes(query)))
    && matchesTuitionStatus(i, filters.status));
}
