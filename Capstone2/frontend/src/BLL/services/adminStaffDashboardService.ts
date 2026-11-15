import type { UserDto } from "../models/UserDto";
import type { TuitionDto, PaymentDto } from "../models/TuitionDto";
import { calculateTuitionMetrics } from "./tuitionMetricsService.ts";
import type { ApprovalRequestDto } from "../models/ApprovalRequestDto";
import type {
  MonitoringSessionDto,
  TeacherClassAssignmentDto,
} from "../../api/teachingMonitoringApi";

export const CENTER_TIME_ZONE = "Asia/Ho_Chi_Minh";
const normalize = (value: string | null | undefined) => (value ?? "").trim().toLowerCase();

export interface DashboardSection<T> {
  data: T | null;
  error: string | null;
}

export function getStaffUserId(user: { userId: number } | undefined, permissions: string[] | undefined): number | null {
  return user && Number.isInteger(user.userId) && user.userId > 0
    && permissions?.some((role) => normalize(role) === "admin_staff") ? user.userId : null;
}

// An empty successful response is data; a failed request is never converted to zero.
export async function loadDashboardSection<T>(request: Promise<T>): Promise<DashboardSection<T>> {
  try {
    return { data: await request, error: null };
  } catch (cause) {
    return {
      data: null,
      error: cause instanceof Error ? cause.message : "Failed to load data. Please try again.",
    };
  }
}

export function countActiveStudents(users: UserDto[]): number {
  return users.filter((user) => normalize(user.status) === "active"
    && user.roles?.some((role) => normalize(role) === "student")).length;
}

export function summarizeTuition(invoices: TuitionDto[], payments: PaymentDto[]) {
  const { unpaidCount, outstanding } = calculateTuitionMetrics(invoices, payments);
  return { unpaidCount, outstanding };
}

export function centerDateKey(now: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: CENTER_TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(now);
  return ["year", "month", "day"].map((type) => parts.find((part) => part.type === type)?.value).join("-");
}

export function getTodaySessions(
  sessions: MonitoringSessionDto[],
  assignments: TeacherClassAssignmentDto[],
  today: string,
) {
  return sessions
    // sessionDate is a database DATE, not an instant to convert between time zones.
    .filter((session) => session.sessionDate.slice(0, 10) === today && normalize(session.status) !== "cancelled")
    .map((session) => ({
      ...session,
      teacherNames: [...new Set(assignments
        .filter((assignment) => assignment.classId === session.classId && normalize(assignment.status) === "active")
        .map((assignment) => assignment.teacherName.trim())
        .filter(Boolean))].join(", "),
    }))
    .sort((a, b) => a.startTime.localeCompare(b.startTime) || a.sessionId - b.sessionId);
}

export function getSessionStatus(session: MonitoringSessionDto, now: Date): string {
  const status = normalize(session.status);
  if (status === "completed") return "Completed";
  if (status === "cancelled") return "Cancelled";
  if (status !== "scheduled") return session.status || "—";

  const time = new Intl.DateTimeFormat("en-GB", {
    timeZone: CENTER_TIME_ZONE, hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23",
  }).format(now);
  if (!session.startTime || !session.endTime) return "Scheduled";
  if (time < session.startTime) return "Upcoming";
  if (time < session.endTime) return "Ongoing";
  // Passing the end time does not prove a lesson was completed.
  return "Not updated";
}

export function getMyRequests(requests: ApprovalRequestDto[], userId: number) {
  return requests.filter((request) => request.requestedBy === userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt) || b.requestId - a.requestId);
}

export const REQUEST_TYPE_LABELS: Record<string, string> = {
  tuition_adjustment: "Tuition Adjustment",
  refund_request: "Refund Request",
  due_date_extension: "Due Date Extension",
  student_information_change: "Student Information Change",
  class_transfer: "Class Transfer",
  academic_support: "Academic Support",
  leave_request: "Leave Request",
  feedback: "Feedback",
  other: "Other Request",
};

export function formatRequestType(type?: string | null): string {
  if (!type) return "Other";
  const key = normalize(type);
  return REQUEST_TYPE_LABELS[key] || type;
}

export function getRequestContent(request: { description?: string | null; reason?: string | null }): string {
  const desc = (request.description || "").trim();
  const reason = (request.reason || "").trim();
  if (desc && reason && desc !== reason) {
    return `${desc}\n\nReason: ${reason}`;
  }
  return desc || reason || "No additional content.";
}

export function getReviewerDisplayInfo(request: ApprovalRequestDto): {
  reviewerText: string;
  isReviewed: boolean;
  reviewedAtText: string;
  reviewNotes: string | null;
} {
  const status = normalize(request.status);
  const isReviewed = status === "approved" || status === "rejected";
  const reviewerText = request.reviewerName?.trim()
    || (request.reviewedBy != null ? `Reviewer #${request.reviewedBy}` : (status === "pending" ? "Pending Director Approval" : "None"));
  const reviewedAtText = request.reviewedAt
    ? new Date(request.reviewedAt).toLocaleString("en-US", { timeZone: CENTER_TIME_ZONE })
    : "—";
  const reviewNotes = request.reviewNotes?.trim() || null;
  return { reviewerText, isReviewed, reviewedAtText, reviewNotes };
}

export function getRequestStatus(request: ApprovalRequestDto): string {
  if (normalize(request.status) === "pending") {
    return request.reviewedBy == null ? "Waiting" : "In Review";
  }
  return request.status || "—";
}
