import type { CenterSettingDto } from '../BLL/models/CenterSettingDto';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export interface CenterSettingChange {
  settingKey: string;
  settingValue: string | null;
}

async function responseJson<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message || `HTTP ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export const centerSettingApi = {
  async getAll(): Promise<CenterSettingDto[]> {
    const res = await fetch(`${API_BASE_URL}/centersettings`, { method: 'GET' });
    return responseJson<CenterSettingDto[]>(res);
  },

  async getById(id: number): Promise<CenterSettingDto> {
    const res = await fetch(`${API_BASE_URL}/centersettings/${id}`, { method: 'GET' });
    return responseJson<CenterSettingDto>(res);
  },

  async updateBulk(settings: CenterSettingChange[]): Promise<CenterSettingDto[]> {
    const res = await fetch(`${API_BASE_URL}/centersettings/bulk`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ settings }),
    });
    return responseJson<CenterSettingDto[]>(res);
  },
};

export default centerSettingApi;
