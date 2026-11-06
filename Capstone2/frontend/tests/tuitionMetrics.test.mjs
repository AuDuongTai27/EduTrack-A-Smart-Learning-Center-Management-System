import assert from "node:assert/strict";
import test from "node:test";
import {
  calculateTuitionMetrics, collectedInMonth, currentCollectionLabel,
  invoiceTotal, matchesTuitionStatus, withInvoiceBalances,
} from "../src/BLL/services/tuitionMetricsService.ts";

const now = new Date("2026-11-06T08:00:00Z");
const invoice = (overrides = {}) => ({
  invoiceId: 10, amountDue: 3_000_000, periodMonth: 11, periodYear: 2026,
  dueDate: "2026-12-06", status: "unpaid", ...overrides,
});
const payment = (amount, overrides = {}) => ({
  paymentId: 1, invoiceId: 10, amount, paidAt: "2026-11-03T08:00:00Z", ...overrides,
});

test("unpaid invoices have zero real receipts and their full outstanding balance", () => {
  const metrics = calculateTuitionMetrics([invoice()], [], now);
  assert.equal(metrics.totalDue, 3_000_000);
  assert.equal(metrics.collected, 0);
  assert.equal(metrics.outstanding, 3_000_000);
  assert.equal(metrics.collectedPercent, 0);
});

test("a partial transaction is counted even when the invoice is unpaid", () => {
  const metrics = calculateTuitionMetrics([invoice()], [payment(1_000_000)], now);
  assert.equal(metrics.collected, 1_000_000);
  assert.equal(metrics.outstanding, 2_000_000);
  assert.equal(metrics.unpaidCount, 1);
  assert.equal(metrics.collectedPercent, 33);
  const [row] = withInvoiceBalances([invoice()], [payment(1_000_000)], now);
  assert.equal(matchesTuitionStatus(row, "Partially Paid"), true);
});

test("multiple payments settle an invoice once, regardless of its old status", () => {
  const payments = [payment(1_000_000), payment(2_000_000, { paymentId: 2 })];
  const metrics = calculateTuitionMetrics([invoice({ dueDate: "2026-10-01", status: "overdue" })], payments, now);
  assert.equal(metrics.collected, 3_000_000);
  assert.equal(metrics.outstanding, 0);
  assert.equal(metrics.overdueAmount, 0);
  assert.equal(metrics.overdueCount, 0);
  assert.equal(metrics.unpaidCount, 0);
  assert.equal(withInvoiceBalances([invoice()], payments, now)[0].status, "paid");
});

test("November receipts include a settlement of an October invoice", () => {
  const invoices = [invoice({ periodMonth: 10, amountDue: 2_000_000 })];
  const payments = [payment(2_000_000)];
  assert.equal(collectedInMonth(payments, now), 2_000_000);
  assert.equal(collectedInMonth(payments, new Date("2026-10-15T00:00:00Z")), 0);
  assert.equal(calculateTuitionMetrics(invoices, payments, now).outstanding, 0);
  assert.equal(calculateTuitionMetrics(invoices, payments, now, {month: 10, year: 2026}).collected, 2_000_000);
  assert.equal(calculateTuitionMetrics(invoices, payments, now, {month: 11, year: 2026}).collected, 0);
});

test("overdue is a subset of outstanding and only its unpaid balance is counted", () => {
  const invoices = [invoice({ amountDue: 3_000_000, dueDate: "2026-11-05" }), invoice({ invoiceId: 20 })];
  const metrics = calculateTuitionMetrics(invoices, [payment(2_000_000)], now);
  assert.equal(metrics.outstanding, 4_000_000);
  assert.equal(metrics.overdueAmount, 1_000_000);
  assert.equal(metrics.overdueCount, 1);
  assert.equal(metrics.unpaidCount, 2);
});

test("an inaccurate paid flag cannot hide debt and pending adjustments retain the existing exception", () => {
  const invoices = [invoice({status: "paid", dueDate: "2026-11-05"}), invoice({invoiceId: 20, status: "pending_adjustment", dueDate: "2026-11-05"})];
  const metrics = calculateTuitionMetrics(invoices, [], now);
  assert.equal(metrics.collected, 0);
  assert.equal(metrics.outstanding, 6_000_000);
  assert.equal(metrics.overdueAmount, 3_000_000);
  assert.equal(metrics.overdueCount, 1);
});

test("Vietnam month boundaries are independent of UTC and browser timezone", () => {
  const payments = [
    payment(100, {paidAt: "2026-10-31T16:59:59Z"}),
    payment(200, {paidAt: "2026-10-31T17:00:00Z"}),
    payment(400, {paidAt: "2026-11-30T16:59:59Z"}),
    payment(800, {paidAt: "2026-11-30T17:00:00Z"}),
    payment(1600, {paidAt: "2026-11-01T00:00:00+07:00"}),
    payment(3200, {paidAt: "2026-10-31T17:00:00"}), // Legacy API wrote UTC without Z.
  ];
  assert.equal(collectedInMonth(payments, now), 5400);
  assert.equal(calculateTuitionMetrics([invoice()], payments, now).monthlyCollected, 5400);
  assert.equal(currentCollectionLabel(new Date("2026-10-31T17:00:00Z")), "Tháng 11/2026");
  assert.equal(currentCollectionLabel(new Date("2026-11-30T17:00:00Z")), "Tháng 12/2026");
});

test("collection rates use receipts for the same invoice cohort, independent of payment date", () => {
  const invoices = [invoice(), invoice({invoiceId: 20, amountDue: 9_000_000, periodMonth: 10})];
  const payments = [payment(1_000_000, {paidAt: "2026-10-31T08:00:00Z"}), payment(9_000_000, {invoiceId: 20})];
  const metrics = calculateTuitionMetrics(invoices, payments, now, {month: 11, year: 2026});
  assert.equal(metrics.totalDue, 3_000_000);
  assert.equal(metrics.collected, 1_000_000);
  assert.equal(metrics.collectedPercent, 33);
  assert.equal(metrics.remainingPercent, 67);
  assert.equal(collectedInMonth(payments, now), 9_000_000);
  assert.equal(calculateTuitionMetrics([invoices[1]], payments, now).collected, 9_000_000);
});

test("overpayments cannot cancel other debt and additional charges are not added twice", () => {
  const invoices = [invoice({amountDue: 1_200_000}), invoice({invoiceId: 20, amountDue: 500_000})];
  const payments = [payment(1_300_000, {additionalChargeAmount: 200_000}), payment(200_000, {invoiceId: 20})];
  const metrics = calculateTuitionMetrics(invoices, payments, now);
  assert.equal(metrics.totalDue, 1_700_000);
  assert.equal(metrics.collected, 1_500_000);
  assert.equal(metrics.outstanding, 300_000);
});

test("empty successful results are real zero amounts but have no defined percentage", () => {
  const metrics = calculateTuitionMetrics([], [], now);
  assert.equal(metrics.totalDue, 0);
  assert.equal(metrics.collected, 0);
  assert.equal(metrics.outstanding, 0);
  assert.equal(metrics.collectedPercent, null);
  assert.equal(metrics.remainingPercent, null);
  assert.equal(collectedInMonth([], now), 0);
});

test("an invalid paidAt cannot be silently omitted from monthly cash", () => {
  assert.throws(() => collectedInMonth([payment(1_000_000, {paidAt: "invalid"})], now), /ngày thu/);
  const metrics = calculateTuitionMetrics([invoice()], [payment(1_000_000, {paidAt: "invalid"})], now);
  assert.equal(metrics.monthlyCollected, null);
  assert.match(metrics.monthlyCollectionError, /ngày thu/);
  assert.equal(metrics.collected, 1_000_000);
  assert.equal(metrics.outstanding, 2_000_000);
  assert.equal(invoiceTotal([invoice()]), 3_000_000);
});

test("monthly collection follows paidAt and the selected invoice cohort, including older debt", () => {
  const current = invoice();
  const previous = invoice({invoiceId: 20, periodMonth: 10, amountDue: 2_000_000});
  const payments = [payment(2_000_000, {invoiceId: 20}),
    payment(1_000_000, {paidAt: "2026-10-15T08:00:00Z"}), payment(1_000_000, {paymentId: 3})];
  const all = calculateTuitionMetrics([current, previous], payments, now);
  assert.equal(all.monthlyCollected, 3_000_000);
  assert.equal(all.collected, 4_000_000);
  assert.equal(all.outstanding, 1_000_000);
  assert.equal(calculateTuitionMetrics([current], payments, now).monthlyCollected, 1_000_000);
  assert.equal(calculateTuitionMetrics([current, previous], payments, now, {month: 10, year: 2026}).monthlyCollected, 2_000_000);
});

test("excluding prior-month cash does not bring back debt that was already settled", () => {
  const metrics = calculateTuitionMetrics([invoice()], [payment(3_000_000, {paidAt: "2026-10-15T08:00:00Z"})], now);
  assert.equal(metrics.monthlyCollected, 0);
  assert.equal(metrics.outstanding, 0);
  assert.equal(metrics.overdueAmount, 0);
  assert.equal(metrics.collected, 3_000_000);
});
