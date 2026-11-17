import type { TuitionInvoiceDto, PaymentDto } from '../BLL/models/TuitionDto';
import { getAuthHeaders } from './authApi';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const tuitionApi = {
  /**
   * GET /api/tuitioninvoices
   */
  async getAllInvoices(): Promise<TuitionInvoiceDto[]> {
    const res = await fetch(`${API_BASE_URL}/tuitioninvoices`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
    });

    if (!res.ok) {
      throw new Error(`HTTP Error ${res.status}: ${res.statusText}`);
    }

    return await res.json();
  },

  /**
   * GET /api/tuitioninvoices/{id}
   */
  async getInvoiceById(id: number): Promise<TuitionInvoiceDto> {
    const res = await fetch(`${API_BASE_URL}/tuitioninvoices/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
    });

    if (!res.ok) {
      throw new Error(`HTTP Error ${res.status}: ${res.statusText}`);
    }

    return await res.json();
  },

  /**
   * GET /api/payments
   */
  async getAllPayments(): Promise<PaymentDto[]> {
    const res = await fetch(`${API_BASE_URL}/payments`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
    });

    if (!res.ok) {
      throw new Error(`HTTP Error ${res.status}: ${res.statusText}`);
    }

    return await res.json();
  },

  /**
   * GET /api/payments/{id}
   */
  async getPaymentById(id: number): Promise<PaymentDto> {
    const res = await fetch(`${API_BASE_URL}/payments/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
    });

    if (!res.ok) {
      throw new Error(`HTTP Error ${res.status}: ${res.statusText}`);
    }

    return await res.json();
  },

  /**
   * Xuất báo cáo học phí ra file Excel (.xlsx) từ Backend
   * GET /api/reports/tuition/export
   */
  async exportTuitionExcel(params: {
    classId?: number | string;
    status?: string;
    searchTerm?: string;
    role?: string;
  }): Promise<Blob> {
    const query = new URLSearchParams();
    if (params.classId && params.classId !== 'All') {
      query.append('classId', String(params.classId));
    }
    if (params.status && params.status !== 'All') {
      query.append('status', params.status);
    }
    if (params.searchTerm && params.searchTerm.trim()) {
      query.append('searchTerm', params.searchTerm.trim());
    }
    if (params.role) {
      query.append('role', params.role);
    }

    const res = await fetch(`${API_BASE_URL}/reports/tuition/export?${query.toString()}`, {
      method: 'GET',
      headers: {
        ...getAuthHeaders(),
      },
    });

    if (!res.ok) {
      throw new Error(`Xuất báo cáo thất bại (HTTP ${res.status}): ${res.statusText}`);
    }

    return await res.blob();
  },
};

export default tuitionApi;
