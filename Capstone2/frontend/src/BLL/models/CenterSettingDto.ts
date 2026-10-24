/**
 * Ánh xạ DTO từ EduTrack.API.Models.DTOs.CenterSettingDto
 */
export interface CenterSettingDto {
  settingId: number;
  settingKey: string;
  settingValue?: string | null;
  updatedBy?: number | null;
  updaterName?: string | null;
}
