import { centerSettingApi, type CenterSettingChange } from '../api/centerSettingApi';
import type { CenterSettingDto } from '../BLL/models/CenterSettingDto';

export interface CenterSettingsFetchResult {
  data: CenterSettingDto[];
  isLiveApi: boolean;
  error?: string | null;
}
export interface CenterSettingDetailFetchResult {
  data: CenterSettingDto | null;
  isLiveApi: boolean;
  error?: string | null;
}

export const centerSettingDAL = {
  async getAllSettings(): Promise<CenterSettingsFetchResult> {
    const data = await centerSettingApi.getAll();
    return { data, isLiveApi: true };
  },

  async getSettingById(id: number): Promise<CenterSettingDetailFetchResult> {
    const data = await centerSettingApi.getById(id);
    return { data, isLiveApi: true };
  },

  async saveSettings(settings: CenterSettingChange[]): Promise<CenterSettingDto[]> {
    return centerSettingApi.updateBulk(settings);
  },

  getSettingValue(settings: CenterSettingDto[], key: string, defaultValue = ''): string {
    const found = settings.find(s => s.settingKey.toLowerCase() === key.toLowerCase());
    return found?.settingValue ?? defaultValue;
  },
};

export default centerSettingDAL;
