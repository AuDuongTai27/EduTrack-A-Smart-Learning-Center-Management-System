import type { LandingOverviewDto, LandingClassesPageDto } from '../BLL/models/LandingOverviewDto';
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
export const LANDING_TIMEOUT_MS = 12000;

async function request(path: string, init: RequestInit = {}) {
  const signal = init.signal
    ? AbortSignal.any([init.signal, AbortSignal.timeout(LANDING_TIMEOUT_MS)])
    : AbortSignal.timeout(LANDING_TIMEOUT_MS);
  const response = await fetch(`${API_BASE_URL}/landing/${path}`, { ...init, signal });
  if (!response.ok) throw new Error(`Unable to load center information (HTTP ${response.status}).`);
  const json = await response.json();
  if (json?.success === false) throw new Error('The center could not complete this request.');
  return json;
}
export const landingApi = {
  async getClasses(subjectId: number | null, page = 1, signal?: AbortSignal): Promise<LandingClassesPageDto> {
    const query = new URLSearchParams({ page: String(page), pageSize: '3' });
    if (subjectId !== null) query.set('subjectId', String(subjectId));
    const json = await request(`classes?${query}`, { signal });
    const data = json?.data ?? json;
    if (!data || !Array.isArray(data.items) || !Number.isInteger(data.totalCount) || data.totalCount < 0 ||
      data.page !== page || data.pageSize !== 3 || typeof data.hasMore !== 'boolean') {
      throw new Error('The center returned incomplete class information. Please try again.');
    }
    return data;
  },
  async getOverview(signal?: AbortSignal): Promise<LandingOverviewDto> {
    const json = await request('overview', { signal });
    const data = json?.data ?? json;
    if (!data || !Array.isArray(data.subjects) || !Array.isArray(data.courses) || !Array.isArray(data.trainers)) {
      throw new Error('The center returned incomplete information. Please try again.');
    }
    return data;
  },
  async subscribeNewsletter(email: string): Promise<{ success: boolean; message: string }> {
    await request('newsletter', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
    return { success: true, message: 'Your newsletter subscription has been recorded.' };
  },
};
export default landingApi;
