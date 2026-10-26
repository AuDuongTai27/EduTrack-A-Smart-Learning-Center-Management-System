import type { TuitionInvoiceDto, PaymentDto } from '../BLL/models/TuitionDto';

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
      },
    });

    if (!res.ok) {
      throw new Error(`HTTP Error ${res.status}: ${res.statusText}`);
    }

    return await res.json();
  },
};

export default tuitionApi;
