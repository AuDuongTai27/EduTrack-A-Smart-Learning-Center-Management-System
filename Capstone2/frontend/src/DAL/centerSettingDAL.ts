import { centerSettingApi } from '../api/centerSettingApi';
import { MOCK_CENTER_SETTINGS } from './mockData';
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

/**
 * Tầng Data Access Layer (DAL) điều phối dữ liệu Cấu hình trung tâm (Center Settings)
 */
export const centerSettingDAL = {
  /**
   * Lấy toàn bộ danh sách cấu hình trung tâm
   */
  async getAllSettings(): Promise<CenterSettingsFetchResult> {
    try {
      const data = await centerSettingApi.getAll();
      console.log('🟢 [centerSettingDAL] Kết nối Backend CenterSettings thành công, nhận', data.length, 'cấu hình.');
      return {
        data,
        isLiveApi: true,
      };
    } catch (err: any) {
      console.warn('🟡 [centerSettingDAL] Backend API không phản hồi, tự động dùng mockData:', err.message);

      const fallbackData: CenterSettingDto[] = MOCK_CENTER_SETTINGS.map((cs) => ({
        settingId: cs.settingId,
        settingKey: cs.settingKey,
        settingValue: cs.settingValue ?? null,
        updatedBy: cs.updatedBy ?? null,
        updaterName: 'Admin',
      }));

      return {
        data: fallbackData,
        isLiveApi: false,
        error: 'Backend API chưa bật (Đang dùng dữ liệu dự phòng mockData)',
      };
    }
  },

  /**
   * Lấy chi tiết cấu hình theo ID
   */
  async getSettingById(id: number): Promise<CenterSettingDetailFetchResult> {
    try {
      const data = await centerSettingApi.getById(id);
      return {
        data,
        isLiveApi: true,
      };
    } catch (err: any) {
      console.warn(`🟡 [centerSettingDAL] Không tải được cấu hình #${id} từ backend, dùng mockData:`, err.message);
      const item = MOCK_CENTER_SETTINGS.find((cs) => cs.settingId === id);
      if (!item) {
        return {
          data: null,
          isLiveApi: false,
          error: `Không tìm thấy cấu hình có ID = ${id}`,
        };
      }

      return {
        data: {
          settingId: item.settingId,
          settingKey: item.settingKey,
          settingValue: item.settingValue ?? null,
          updatedBy: item.updatedBy ?? null,
          updaterName: 'Admin',
        },
        isLiveApi: false,
      };
    }
  },

  /**
   * Helper lấy giá trị setting theo key
   */
  getSettingValue(settings: CenterSettingDto[], key: string, defaultValue: string = ''): string {
    const found = settings.find((s) => s.settingKey.toLowerCase() === key.toLowerCase());
    return found?.settingValue || defaultValue;
  },
};

export default centerSettingDAL;
