import assert from "node:assert/strict";
import test from "node:test";
import {
  centerDateKey,
  countActiveStudents,
  formatRequestType,
  getMyRequests,
  getRequestContent,
  getRequestStatus,
  getReviewerDisplayInfo,
  getSessionStatus,
  getStaffUserId,
  getTodaySessions,
  loadDashboardSection,
  summarizeTuition,
} from "../src/BLL/services/adminStaffDashboardService.ts";

test("zero records remain zero instead of fabricated KPI values", () => {
  assert.equal(countActiveStudents([]), 0);
  assert.deepEqual(summarizeTuition([], []), { unpaidCount: 0, outstanding: 0 });
});

test("active student accounts are identified by roles, not a STU code", () => {
  assert.equal(countActiveStudents([
    { userId: 11, userCode: "CUSTOM-1", status: "Active", roles: [" Student "] },
    { userId: 12, userCode: "STU002", status: "locked", roles: ["student"] },
    { userId: 13, userCode: "STU003", status: "active", roles: ["teacher"] },
    { userId: 14, userCode: "STU004", status: "inactive", roles: ["student"] },
  ]), 1);
});

test("debt subtracts all partial payments and does not trust invoice status", () => {
  assert.deepEqual(summarizeTuition([
    { invoiceId: 1, amountDue: 1_000_000, status: "paid" },
    { invoiceId: 2, amountDue: 500_000, status: "unpaid" },
    { invoiceId: 3, amountDue: 300_000, status: "pending_adjustment" },
  ], [
    { invoiceId: 1, amount: 100_000 },
    { invoiceId: 1, amount: 300_000 },
    { invoiceId: 2, amount: 500_000 },
    { invoiceId: 99, amount: 2_000_000 },
  ]), { unpaidCount: 2, outstanding: 900_000 });
});

test("additional charges are included once and overpayments cannot reduce another invoice's debt", () => {
  assert.deepEqual(summarizeTuition([
    { invoiceId: 1, amountDue: 1_200_000 },
    { invoiceId: 2, amountDue: 500_000 },
  ], [
    { invoiceId: 1, amount: 1_300_000, additionalChargeAmount: 200_000 },
    { invoiceId: 2, amount: 200_000 },
  ]), { unpaidCount: 1, outstanding: 300_000 });
});

test("the default mock student and a missing session never become staff ID 2", () => {
  assert.equal(getStaffUserId({ userId: 6 }, ["student"]), null);
  assert.equal(getStaffUserId(undefined, undefined), null);
  assert.equal(getStaffUserId({ userId: 2 }, undefined), null);
  assert.equal(getStaffUserId({ userId: 0 }, ["admin_staff"]), null);
  assert.equal(getStaffUserId({ userId: 42 }, [" ADMIN_STAFF "]), 42);
});

test("the center day respects midnight in Vietnam regardless of the browser timezone", () => {
  assert.equal(centerDateKey(new Date("2026-11-05T17:01:00Z")), "2026-11-06");
  assert.equal(centerDateKey(new Date("2026-11-06T16:59:00Z")), "2026-11-06");
});

const session = (overrides = {}) => ({
  sessionId: 1, classId: 10, className: "Lớp kiểm thử", sessionDate: "2026-11-06T00:00:00",
  startTime: "18:00:00", endTime: "20:00:00", room: null, status: "scheduled", ...overrides,
});

test("today's sessions exclude other dates and cancelled lessons and use only active assignments", () => {
  const rows = getTodaySessions([
    session(), session({ sessionId: 2, startTime: "08:00:00", endTime: "10:00:00" }),
    session({ sessionId: 3, sessionDate: "2026-11-05T00:00:00" }),
    session({ sessionId: 4, status: " Cancelled " }),
    session({ sessionId: 5, classId: 20 }),
  ], [
    { classId: 10, status: "active", teacherName: "Giáo viên A" },
    { classId: 10, status: "active", teacherName: "Giáo viên A" },
    { classId: 10, status: "Active", teacherName: "Giáo viên B" },
    { classId: 10, status: "inactive", teacherName: "Giáo viên cũ" },
    { classId: 30, status: "active", teacherName: "Giáo viên lớp khác" },
  ], "2026-11-06");
  assert.deepEqual(rows.map((row) => row.sessionId), [2, 1, 5]);
  assert.equal(rows[0].teacherNames, "Giáo viên A, Giáo viên B");
  assert.equal(rows[2].teacherNames, "");
  assert.equal(rows[0].room, null);
});

test("no materialized lesson means no session even when a weekly slot may exist", () => {
  assert.deepEqual(getTodaySessions([], [], "2026-11-06"), []);
});

test("session badges follow actual times and completion status, not row position", () => {
  assert.equal(getSessionStatus(session(), new Date("2026-11-06T10:59:00Z")), "Upcoming");
  assert.equal(getSessionStatus(session(), new Date("2026-11-06T11:00:00Z")), "Ongoing");
  assert.equal(getSessionStatus(session(), new Date("2026-11-06T13:00:00Z")), "Chưa cập nhật");
  assert.equal(getSessionStatus(session({ status: "completed" }), new Date("2026-11-06T13:00:00Z")), "Completed");
});

test("personal requests are filtered before counting, sorting and limiting the preview", () => {
  const requests = Array.from({ length: 6 }, (_, index) => ({
    requestId: index + 1, requestedBy: 42, status: "pending", createdAt: `2026-11-0${index + 1}T08:00:00`,
  }));
  requests.push({ requestId: 99, requestedBy: 2, status: "pending", createdAt: "2026-11-06T10:00:00" });
  const mine = getMyRequests(requests, 42);
  assert.equal(mine.length, 6);
  assert.deepEqual(mine.slice(0, 4).map((request) => request.requestId), [6, 5, 4, 3]);
  assert.equal(requests[0].requestId, 1, "source data is not reordered in place");
});

test("approval waiting and in review remain distinct while pending in the database", () => {
  assert.equal(getRequestStatus({ status: "pending", reviewedBy: null }), "Waiting");
  assert.equal(getRequestStatus({ status: "pending", reviewedBy: 7 }), "Đang xem xét giải quyết");
  assert.equal(getRequestStatus({ status: "approved", reviewedBy: 7 }), "approved");
  assert.equal(getRequestStatus({ status: "rejected", reviewedBy: 7 }), "rejected");
});

test("API failure stays distinct from an empty successful response; other sections still load", async () => {
  const [empty, failed, tuition] = await Promise.all([
    loadDashboardSection(Promise.resolve([])),
    loadDashboardSection(Promise.reject(new Error("HTTP 503"))),
    loadDashboardSection(Promise.resolve({ unpaidCount: 2, outstanding: 900_000 })),
  ]);
  assert.deepEqual(empty, { data: [], error: null });
  assert.deepEqual(failed, { data: null, error: "HTTP 503" });
  assert.equal(tuition.data.outstanding, 900_000);
});

test("request type labels map known types to Vietnamese and provide graceful fallback", () => {
  assert.equal(formatRequestType("tuition_adjustment"), "Điều chỉnh học phí");
  assert.equal(formatRequestType("refund_request"), "Yêu cầu hoàn phí");
  assert.equal(formatRequestType("due_date_extension"), "Gia hạn hạn nộp");
  assert.equal(formatRequestType("student_information_change"), "Thay đổi thông tin HV");
  assert.equal(formatRequestType("class_transfer"), "Chuyển lớp học");
  assert.equal(formatRequestType(null), "Khác");
  assert.equal(formatRequestType("custom_unknown_type"), "custom_unknown_type");
});

test("request content correctly extracts description and reason without losing details", () => {
  assert.equal(
    getRequestContent({ description: "Gia hạn nộp phí", reason: "Phụ huynh đang đi công tác" }),
    "Gia hạn nộp phí\n\nLý do: Phụ huynh đang đi công tác",
  );
  assert.equal(
    getRequestContent({ description: "Đề xuất giảm 10%", reason: "Đề xuất giảm 10%" }),
    "Đề xuất giảm 10%",
  );
  assert.equal(
    getRequestContent({ description: null, reason: "Chuyển lớp sang ca tối" }),
    "Chuyển lớp sang ca tối",
  );
  assert.equal(
    getRequestContent({ description: "", reason: "" }),
    "Không có nội dung thêm.",
  );
});

test("reviewer info distinguishes pending review from completed approval with notes", () => {
  const pendingNoReviewer = getReviewerDisplayInfo({
    status: "pending",
    reviewedBy: null,
  });
  assert.equal(pendingNoReviewer.reviewerText, "Đang chờ Giám đốc duyệt");
  assert.equal(pendingNoReviewer.isReviewed, false);
  assert.equal(pendingNoReviewer.reviewNotes, null);

  const pendingUnderReview = getReviewerDisplayInfo({
    status: "pending",
    reviewedBy: 9,
    reviewerName: "Giám đốc Trung tâm",
  });
  assert.equal(pendingUnderReview.reviewerText, "Giám đốc Trung tâm");
  assert.equal(pendingUnderReview.isReviewed, false);

  const approvedWithNotes = getReviewerDisplayInfo({
    status: "approved",
    reviewerName: "Giám đốc Nguyễn Văn B",
    reviewedAt: "2026-11-08T10:30:00",
    reviewNotes: "Đã duyệt miễn giảm 15% theo quy chế.",
  });
  assert.equal(approvedWithNotes.reviewerText, "Giám đốc Nguyễn Văn B");
  assert.equal(approvedWithNotes.isReviewed, true);
  assert.equal(approvedWithNotes.reviewNotes, "Đã duyệt miễn giảm 15% theo quy chế.");
});
