import type { User } from './User';

/**
 * Ánh xạ 1-1 từ EduTrack.API.Models.Entities.CenterSetting (bảng center_settings)
 */
export interface CenterSetting {
  settingId: number;
  settingKey: string;
  settingValue?: string | null;
  updatedBy?: number | null;

  // Navigation Properties
  updater?: User | null;
}
