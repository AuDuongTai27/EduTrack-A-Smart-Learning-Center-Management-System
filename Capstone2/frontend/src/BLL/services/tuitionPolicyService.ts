import type { TuitionDto } from "../models/TuitionDto";

const CENTER_TIME_ZONE = "Asia/Ho_Chi_Minh";

function centerDate(now: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: CENTER_TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(now);
  return ["year", "month", "day"].map(type => parts.find(part => part.type === type)?.value).join("-");
}

export function tuitionMonthKey(now: Date): string {
  return centerDate(now).slice(0, 7);
}

/** Preview only; the backend determines the actual due date when saving. */
export function defaultTuitionDueDate(now = new Date()): string {
  const [year, month, day] = centerDate(now).split("-").map(Number);
  const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  return new Date(Date.UTC(year, month, Math.min(day, lastDay))).toISOString().slice(0, 10);
}

export function isTuitionOverdue(
  invoice: Pick<TuitionDto, "dueDate" | "status">,
  remaining: number,
  now = new Date(),
): boolean {
  if (!Number.isFinite(remaining) || remaining <= 0 || invoice.status?.trim().toLowerCase() === "pending_adjustment") return false;
  const due = invoice.dueDate?.slice(0, 10);
  return !!due && /^\d{4}-\d{2}-\d{2}$/.test(due) && due < centerDate(now);
}

export function tuitionPaymentStatus(
  amountDue: number, paidAmount: number, dueDate: string, existingStatus: string, now = new Date(),
): string {
  if (existingStatus?.trim().toLowerCase() === "pending_adjustment") return "pending_adjustment";
  if (paidAmount >= amountDue) return "paid";
  return isTuitionOverdue({ dueDate, status: "unpaid" }, amountDue - paidAmount, now) ? "overdue" : "unpaid";
}
