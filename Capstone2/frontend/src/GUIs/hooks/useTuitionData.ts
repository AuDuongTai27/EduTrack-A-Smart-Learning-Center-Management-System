import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import tuitionDAL from "../../DAL/tuitionDAL";
import type { PaymentDto, TuitionDto } from "../../BLL/models/TuitionDto";
import { collectedInMonth, currentCollectionLabel, withInvoiceBalances } from "../../BLL/services/tuitionMetricsService";

interface QueryState<T> {
  data: T[] | null;
  loading: boolean;
  error: string | null;
}

const initialQuery = <T>(): QueryState<T> => ({ data: null, loading: true, error: null });

/** Invoice and payment failures are independent; missing payments never mean zero paid. */
export function useTuitionData() {
  const [invoices, setInvoices] = useState<QueryState<TuitionDto>>(initialQuery);
  const [payments, setPayments] = useState<QueryState<PaymentDto>>(initialQuery);
  const [now, setNow] = useState(() => new Date());
  const mounted = useRef(false);
  const generation = useRef(0);

  const refresh = useCallback(async () => {
    const request = ++generation.current;
    const active = () => mounted.current && request === generation.current;
    if (active()) {
      setInvoices(previous => ({ ...previous, loading: true, error: null }));
      setPayments(previous => ({ ...previous, loading: true, error: null }));
      setNow(new Date());
    }
    async function read<T>(fetch: () => Promise<{ data: T[] }>, set: (state: QueryState<T>) => void) {
      let next: QueryState<T>;
      try {
        const result = await fetch();
        if (!Array.isArray(result.data)) throw new Error("API học phí trả về dữ liệu không hợp lệ.");
        next = { data: result.data, error: null, loading: false };
      } catch (cause) {
        next = { data: null, error: cause instanceof Error ? cause.message : "Không tải được dữ liệu học phí.", loading: false };
      }
      if (active()) set(next);
      return next;
    }
    const [invoiceResult, paymentResult] = await Promise.all([
      read(() => tuitionDAL.getAllTuitions(), setInvoices),
      read(() => tuitionDAL.getAllPayments(), setPayments),
    ]);
    return { invoices: invoiceResult, payments: paymentResult };
  }, []);

  useEffect(() => {
    mounted.current = true;
    void refresh();
    const timer = window.setInterval(() => setNow(new Date()), 60_000);
    return () => { mounted.current = false; generation.current++; window.clearInterval(timer); };
  }, [refresh]);

  const invoiceReady = !invoices.loading && invoices.data != null && !invoices.error;
  const paymentReady = !payments.loading && payments.data != null && !payments.error;
  const balanceReady = invoiceReady && paymentReady;
  const rows = useMemo(() => {
    if (!invoices.data) return [];
    return paymentReady ? withInvoiceBalances(invoices.data, payments.data!, now) : invoices.data;
  }, [invoices.data, payments.data, paymentReady, now]);
  const monthly = useMemo(() => {
    if (!paymentReady) return { amount: null, error: null };
    try { return { amount: collectedInMonth(payments.data!, now), error: null }; }
    catch (cause) { return { amount: null, error: cause instanceof Error ? cause.message : "Không tính được tiền thực thu tháng này." }; }
  }, [payments.data, paymentReady, now]);

  const upsertInvoice = useCallback((invoice: TuitionDto) => {
    setInvoices(previous => ({
      ...previous,
      data: [{ ...invoice, tuitionId: invoice.invoiceId, amount: invoice.amountDue },
        ...(previous.data ?? []).filter(item => item.invoiceId !== invoice.invoiceId)],
    }));
  }, []);

  return {
    invoices, payments, rows, now, invoiceReady, paymentReady, balanceReady, refresh, upsertInvoice,
    loading: invoices.loading,
    error: [invoices.error && `Hóa đơn: ${invoices.error}`, payments.error && `Payments: ${payments.error}`].filter(Boolean).join(" ") || null,
    monthlyCollected: monthly.amount,
    monthlyError: monthly.error,
    collectionLabel: currentCollectionLabel(now),
  };
}
