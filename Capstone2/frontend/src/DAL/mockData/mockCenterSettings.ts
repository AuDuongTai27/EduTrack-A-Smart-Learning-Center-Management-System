import type { CenterSetting } from '../../BLL/models/CenterSetting';

/**
 * Dữ liệu mẫu cấu hình trung tâm bám sát DbSeeder.cs (bảng center_settings)
 */
export const MOCK_CENTER_SETTINGS: CenterSetting[] = [
  {
    settingId: 1,
    settingKey: 'center_name',
    settingValue: 'EduTrack Smart Learning Center',
    updatedBy: 1,
  },
  {
    settingId: 2,
    settingKey: 'center_address',
    settingValue: '123 Nguyen Van Cu, District 5, Ho Chi Minh City',
    updatedBy: 1,
  },
  {
    settingId: 3,
    settingKey: 'center_hotline',
    settingValue: '1900 6868',
    updatedBy: 1,
  },
  {
    settingId: 4,
    settingKey: 'academic_year',
    settingValue: '2026 - 2027',
    updatedBy: 1,
  },
  {
    settingId: 5,
    settingKey: 'tuition_due_day',
    settingValue: '10',
    updatedBy: 1,
  },
  {
    settingId: 6,
    settingKey: 'ai_evaluation_enabled',
    settingValue: 'true',
    updatedBy: 1,
  },
  {
    settingId: 7,
    settingKey: 'currency',
    settingValue: 'VND',
    updatedBy: 1,
  },
];
