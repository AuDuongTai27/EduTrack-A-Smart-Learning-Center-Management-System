import type { LandingOverviewDto } from '../BLL/models/LandingOverviewDto';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const landingApi = {
  /**
   * Lấy toàn bộ dữ liệu thật tổng hợp cho trang Landing Page
   * GET /api/landing/overview
   */
  async getOverview(): Promise<LandingOverviewDto> {
    const res = await fetch(`${API_BASE_URL}/landing/overview`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: Không thể tải dữ liệu Landing Page`);
    }

    const json = await res.json();
    return json?.data ?? json;
  },

  /**
   * Đăng ký nhận bản tin tuyển sinh từ Landing Page
   * POST /api/landing/newsletter
   */
  async subscribeNewsletter(email: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE_URL}/landing/newsletter`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json?.message || `Lỗi HTTP ${res.status}`);
    }

    return json;
  },
};

export default landingApi;

