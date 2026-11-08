import type { PaymentDto, TuitionDto } from "../models/TuitionDto";
import { isTuitionOverdue, tuitionMonthKey, tuitionPaymentStatus } from "./tuitionPolicyService.ts";

export const ALL_INVOICE_PERIODS = "Tất cả kỳ hóa đơn • Theo bộ lọc";

// Match decimal(12,2) storage: avoid binary floating point leaving phantom debt
// or displaying 0.30000000000000004 after summing valid legacy decimal amounts.
const units = (amount: number) => Math.round(amount * 100);
const sumMoney = (amounts: number[]) => amounts.reduce((sum, amount) => sum + units(amount), 0) / 100;

export interface BillingPeriod {
  month: number;
  year: number;
}

export interface InvoiceBalance extends TuitionDto {
  paidAmount: number;
  remainingAmount: number;
}

export function currentCollectionLabel(now = new Date()): string {
  const [year, month] = tuitionMonthKey(now).split("-");
  return `Tháng ${Number(month)}/${year}`;
}

/** The application writes UTC. Accept legacy API timestamps that omitted the UTC suffix. */
export function paymentInstant(paidAt: string): Date {
  if (!paidAt || !/^\d{4}-\d{2}-\d{2}T/.test(paidAt)) {
    throw new Error("Không xác định được ngày thu của một giao dịch thanh toán.");
  }
  const explicitZone = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(paidAt);
  const instant = new Date(explicitZone ? paidAt : `${paidAt}Z`);
  if (Number.isNaN(instant.getTime())) throw new Error("Ngày thu của một giao dịch thanh toán không hợp lệ.");
  return instant;
}

/** Cash received this month, including settlements of older invoices. */
export function collectedInMonth(payments: PaymentDto[], now = new Date()): number {
  const month = tuitionMonthKey(now);
  return payments.reduce((sum, payment) =>
    sum + (tuitionMonthKey(paymentInstant(payment.paidAt)) === month ? units(payment.amount) : 0), 0) / 100;
}

export function invoiceTotal(invoices: TuitionDto[]): number {
  return sumMoney(invoices.map(invoice => invoice.amountDue));
}

export function withInvoiceBalances(invoices: TuitionDto[], payments: PaymentDto[], now = new Date()): InvoiceBalance[] {
  const paidByInvoice = new Map<number, number>();
  for (const payment of payments) {
    paidByInvoice.set(payment.invoiceId, (paidByInvoice.get(payment.invoiceId) ?? 0) + units(payment.amount));
  }
  return invoices.map(invoice => {
    const paidUnits = paidByInvoice.get(invoice.invoiceId) ?? 0;
    const paidAmount = paidUnits / 100;
    return {
      ...invoice,
      paidAmount,
      remainingAmount: Math.max(0, units(invoice.amountDue) - paidUnits) / 100,
      status: tuitionPaymentStatus(invoice.amountDue, paidAmount, invoice.dueDate, invoice.status, now),
    };
  });
}

/** Payments are grouped by invoice; billing-period selection never filters by paidAt. */
export function calculateTuitionMetrics(
  invoices: TuitionDto[], payments: PaymentDto[], now = new Date(), period?: BillingPeriod,
) {
  const scoped = period ? invoices.filter(invoice => invoice.periodMonth === period.month && invoice.periodYear === period.year) : invoices;
  const rows = withInvoiceBalances(scoped, payments, now);
  const totalDue = invoiceTotal(rows);
  const collected = sumMoney(rows.map(invoice => invoice.paidAmount));
  const outstanding = sumMoney(rows.map(invoice => invoice.remainingAmount));
  const overdue = rows.filter(invoice => isTuitionOverdue(invoice, invoice.remainingAmount, now));
  let monthlyCollected: number | null = null;
  let monthlyCollectionError: string | null = null;
  try {
    const invoiceIds = new Set(rows.map(invoice => invoice.invoiceId));
    monthlyCollected = collectedInMonth(payments.filter(payment => invoiceIds.has(payment.invoiceId)), now);
  } catch (cause) {
    monthlyCollectionError = cause instanceof Error ? cause.message : "Không tính được tiền thực thu tháng này.";
  }
  return {
    totalDue,
    collected,
    monthlyCollected,
    monthlyCollectionError,
    outstanding,
    overdueAmount: sumMoney(overdue.map(invoice => invoice.remainingAmount)),
    overdueCount: overdue.length,
    unpaidCount: rows.filter(invoice => invoice.remainingAmount > 0).length,
    collectedPercent: totalDue > 0 ? Math.round(100 * collected / totalDue) : null,
    remainingPercent: totalDue > 0 ? Math.round(100 * outstanding / totalDue) : null,
  };
}

export function matchesTuitionStatus(invoice: TuitionDto, selected: string): boolean {
  const normalized = selected.trim().toLowerCase().replaceAll("_", " ");
  if (normalized === "all") return true;
  if (normalized === "partially paid") {
    return invoice.paidAmount != null && invoice.paidAmount > 0 && invoice.paidAmount < invoice.amountDue;
  }
  return invoice.status?.trim().toLowerCase().replaceAll("_", " ") === normalized;
}

export function invoicePeriodLabel(invoice: TuitionDto): string {
  return invoice.periodMonth != null && invoice.periodYear != null ? `${invoice.periodMonth}/${invoice.periodYear}` : "—";
}
