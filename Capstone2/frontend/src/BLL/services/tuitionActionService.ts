import type { TuitionDto } from "../models/TuitionDto";
import { validTuitionAmount } from "./tuitionPolicyService";

/** Action availability follows actual receipts/balance, never a saved Paid label. */
export function tuitionActions(invoice: TuitionDto, balanceReady: boolean, hasPayments: boolean) {
  const known = balanceReady && invoice.paidAmount != null && Number.isFinite(invoice.paidAmount) && invoice.paidAmount >= 0;
  const remaining = known ? Math.max(0, Math.round(invoice.amountDue * 100) - Math.round(invoice.paidAmount! * 100)) / 100 : null;
  const valid = validTuitionAmount(invoice.amountDue);
  const settled = known && valid && remaining === 0;
  const pending = invoice.status?.trim().toLowerCase() === "pending_adjustment";
  return {
    remaining, settled,
    canPay: known && valid && remaining! > 0,
    canEdit: known && !hasPayments && !settled && !pending,
    partiallyPaid: known && invoice.paidAmount! > 0 && remaining! > 0,
  };
}
