import { tuitionApi } from '../api/tuitionApi';
import type { TuitionInvoiceDto, PaymentDto } from '../BLL/models/TuitionDto';

export interface InvoicesFetchResult {
  data: TuitionInvoiceDto[];
  isLiveApi: boolean;
  error?: string | null;
}

export interface PaymentsFetchResult {
  data: PaymentDto[];
  isLiveApi: boolean;
  error?: string | null;
}

/** Tuition/Payment query DAL. Read models always originate from the backend. */
export const tuitionDAL = {
  async getAllInvoices(): Promise<InvoicesFetchResult> {
    const data = await tuitionApi.getAllInvoices();
    return { data, isLiveApi: true };
  },

  async getAllTuitions(): Promise<InvoicesFetchResult> {
    const result = await this.getAllInvoices();
    const data = result.data.map((invoice) => ({
      ...invoice,
      tuitionId: invoice.invoiceId,
      invoiceCode: invoice.invoiceCode || `INV-${invoice.invoiceId}`,
      amount: invoice.amount ?? invoice.amountDue,
      // Do not invent payment totals or an arbitrary billing period.
      paidAmount: invoice.paidAmount,
      period:
        invoice.period ||
        (invoice.periodMonth != null && invoice.periodYear != null
          ? `${invoice.periodMonth}/${invoice.periodYear}`
          : undefined),
    }));
    return { ...result, data };
  },

  async getTuitionById(id: number): Promise<TuitionInvoiceDto | null> {
    const result = await this.getAllTuitions();
    return result.data.find((invoice) => invoice.tuitionId === id || invoice.invoiceId === id) ?? null;
  },

  async getAllPayments(): Promise<PaymentsFetchResult> {
    const data = await tuitionApi.getAllPayments();
    return { data, isLiveApi: true };
  },

  getAll(): Promise<InvoicesFetchResult> {
    return this.getAllTuitions();
  },

  getById(id: number): Promise<TuitionInvoiceDto | null> {
    return this.getTuitionById(id);
  },
};

export default tuitionDAL;
