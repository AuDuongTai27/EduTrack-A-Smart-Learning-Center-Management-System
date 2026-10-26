import { tuitionApi } from '../api/tuitionApi';
import type { TuitionInvoiceDto, PaymentDto } from '../BLL/models/TuitionDto';
import { MOCK_TUITION_INVOICES, MOCK_PAYMENTS } from './mockData/mockTuition';
import { MOCK_CLASSES } from './mockData/mockClasses';
import { MOCK_USERS } from './mockData/mockUsers';

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

/**
 * Tầng DAL điều phối dữ liệu Học phí & Thanh toán (Tuition & Payment)
 */
export const tuitionDAL = {
  /**
   * Lấy toàn bộ danh sách Hóa đơn học phí (có Fallback)
   */
  async getAllInvoices(): Promise<InvoicesFetchResult> {
    try {
      const data = await tuitionApi.getAllInvoices();
      console.log('🟢 [tuitionDAL] Kết nối Backend Invoices thành công, nhận', data.length, 'hóa đơn.');
      return {
        data,
        isLiveApi: true,
      };
    } catch (err: any) {
      console.warn('🟡 [tuitionDAL] Backend API Invoices không phản hồi, tự động dùng mockData:', err.message);

      const fallback: TuitionInvoiceDto[] = MOCK_TUITION_INVOICES.map((inv) => {
        const student = MOCK_USERS.find((u) => u.userId === inv.studentId);
        const cls = MOCK_CLASSES.find((c) => c.classId === inv.classId);
        return {
          invoiceId: inv.invoiceId,
          tuitionId: inv.invoiceId,
          invoiceCode: `INV-${inv.invoiceId}`,
          studentId: inv.studentId,
          studentName: student?.fullName || 'Học sinh',
          studentCode: student?.userCode || `STU${inv.studentId}`,
          classId: inv.classId,
          className: cls?.className || '[FE-Mock] Lớp học',
          amountDue: inv.amountDue,
          amount: inv.amountDue,
          paidAmount: inv.status === 'Paid' ? inv.amountDue : 0,
          period: 'August 2026',
          dueDate: inv.dueDate,
          status: inv.status,
        };
      });

      return {
        data: fallback,
        isLiveApi: false,
        error: 'Backend API chưa bật (Đang dùng dữ liệu dự phòng mockData)',
      };
    }
  },

  /**
   * Alias getAllTuitions() đồng bộ hóa dữ liệu Tuition
   */
  async getAllTuitions(): Promise<InvoicesFetchResult> {
    const res = await this.getAllInvoices();
    const mapped = res.data.map((inv) => ({
      ...inv,
      tuitionId: inv.invoiceId,
      invoiceCode: inv.invoiceCode || `INV-${inv.invoiceId}`,
      amount: inv.amount || inv.amountDue,
      paidAmount: inv.paidAmount !== undefined ? inv.paidAmount : (inv.status === 'Paid' ? inv.amountDue : 0),
      period: inv.period || 'August 2026',
    }));
    return {
      ...res,
      data: mapped,
    };
  },

  /**
   * Lấy chi tiết học phí / hóa đơn theo ID
   */
  async getTuitionById(id: number): Promise<TuitionInvoiceDto | null> {
    const res = await this.getAllTuitions();
    return res.data.find((t) => t.tuitionId === id || t.invoiceId === id) || null;
  },

  /**
   * Lấy toàn bộ danh sách Lịch sử thanh toán (có Fallback)
   */
  async getAllPayments(): Promise<PaymentsFetchResult> {
    try {
      const data = await tuitionApi.getAllPayments();
      console.log('🟢 [tuitionDAL] Kết nối Backend Payments thành công, nhận', data.length, 'giao dịch.');
      return {
        data,
        isLiveApi: true,
      };
    } catch (err: any) {
      console.warn('🟡 [tuitionDAL] Backend API Payments không phản hồi, tự động dùng mockData:', err.message);

      const fallback: PaymentDto[] = MOCK_PAYMENTS.map((p) => {
        const payer = MOCK_USERS.find((u) => u.userId === p.paidByUserId);
        const recorder = MOCK_USERS.find((u) => u.userId === p.recordedBy);
        return {
          paymentId: p.paymentId,
          invoiceId: p.invoiceId,
          amount: p.amount,
          paymentMethod: p.paymentMethod,
          transactionCode: p.transactionCode,
          paidAt: p.paidAt,
          paidByUserId: p.paidByUserId,
          payerName: payer?.fullName || 'Phụ huynh',
          recordedBy: p.recordedBy,
          recorderName: recorder?.fullName || 'Giáo vụ',
          note: p.note,
        };
      });

      return {
        data: fallback,
        isLiveApi: false,
        error: 'Backend API chưa bật (Đang dùng dữ liệu dự phòng mockData)',
      };
    }
  },

  getAll(): Promise<InvoicesFetchResult> {
    return this.getAllTuitions();
  },

  getById(id: number): Promise<TuitionInvoiceDto | null> {
    return this.getTuitionById(id);
  },
};

export default tuitionDAL;
