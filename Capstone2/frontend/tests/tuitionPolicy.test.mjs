import assert from "node:assert/strict";
import test from "node:test";
import { defaultTuitionDueDate, isTuitionOverdue, tuitionPaymentStatus } from "../src/BLL/services/tuitionPolicyService.ts";

test("new invoices are due one calendar month after their creation date", () => {
  assert.equal(defaultTuitionDueDate(new Date("2026-11-06T08:30:00Z")), "2026-12-06");
  assert.equal(defaultTuitionDueDate(new Date("2026-12-31T08:30:00Z")), "2027-01-31");
});

test("month-end dates clamp to the final day of the next month", () => {
  assert.equal(defaultTuitionDueDate(new Date("2026-01-31T08:30:00Z")), "2026-02-28");
  assert.equal(defaultTuitionDueDate(new Date("2028-01-31T08:30:00Z")), "2028-02-29");
  assert.equal(defaultTuitionDueDate(new Date("2026-03-31T08:30:00Z")), "2026-04-30");
});

test("creation dates use the center's day even when UTC is still the previous day", () => {
  assert.equal(defaultTuitionDueDate(new Date("2026-11-05T17:00:00Z")), "2026-12-06");
});

test("an unpaid invoice stays unpaid throughout its due date", () => {
  const invoice = { dueDate: "2026-12-06T00:00:00", status: "unpaid" };
  assert.equal(isTuitionOverdue(invoice, 1_000_000, new Date("2026-12-06T00:00:00+07:00")), false);
  assert.equal(isTuitionOverdue(invoice, 1_000_000, new Date("2026-12-06T23:59:59+07:00")), false);
  assert.equal(tuitionPaymentStatus(1_000_000, 0, invoice.dueDate, "unpaid", new Date("2026-12-06T23:59:59+07:00")), "unpaid");
});

test("unpaid and partially paid balances become overdue at midnight after the due date", () => {
  const now = new Date("2026-12-07T00:00:00+07:00");
  assert.equal(tuitionPaymentStatus(1_000_000, 0, "2026-12-06", "unpaid", now), "overdue");
  assert.equal(tuitionPaymentStatus(1_000_000, 400_000, "2026-12-06", "unpaid", now), "overdue");
});

test("a future due date does not become overdue because of an old status flag", () => {
  assert.equal(isTuitionOverdue({ dueDate: "2026-12-06", status: "overdue" }, 1_000_000, new Date("2026-11-06T08:00:00Z")), false);
});

test("fully settled invoices remain paid even after their due date", () => {
  const now = new Date("2026-12-07T00:00:00+07:00");
  assert.equal(tuitionPaymentStatus(1_000_000, 1_000_000, "2026-12-06", "overdue", now), "paid");
  assert.equal(isTuitionOverdue({ dueDate: "2026-12-06", status: "paid" }, 0, now), false);
  assert.equal(isTuitionOverdue({ dueDate: "2026-12-06", status: "unpaid" }, 0, now), false);
});

test("partial payment before the deadline remains unpaid and adjustments retain their workflow", () => {
  const now = new Date("2026-12-06T10:00:00+07:00");
  assert.equal(tuitionPaymentStatus(1_000_000, 400_000, "2026-12-06", "unpaid", now), "unpaid");
  assert.equal(tuitionPaymentStatus(1_000_000, 0, "2026-11-06", "pending_adjustment", now), "pending_adjustment");
  assert.equal(isTuitionOverdue({ dueDate: "2026-11-06", status: "pending_adjustment" }, 1_000_000, now), false);
});
