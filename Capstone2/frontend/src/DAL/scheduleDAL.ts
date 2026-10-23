import { scheduleApi } from '../api/scheduleApi';
import type { ClassScheduleDto } from '../BLL/models/ClassScheduleDto';
import { MOCK_CLASS_SCHEDULES } from './mockData/mockSchedules';
import { MOCK_CLASSES } from './mockData/mockClasses';

export interface SchedulesFetchResult {
  data: ClassScheduleDto[];
  isLiveApi: boolean;
  error?: string | null;
}

/**
 * Tầng Data Access Layer (DAL) điều phối dữ liệu lịch học (ClassSchedule)
 * - Thử gọi Backend qua `scheduleApi`
 * - Fallback sang `mockData` nếu Backend chưa bật
 */
export const scheduleDAL = {
  /**
   * Lấy toàn bộ danh sách lịch học (có Fallback)
   */
  async getAllClassSchedules(): Promise<SchedulesFetchResult> {
    try {
      const data = await scheduleApi.getAll();
      console.log('🟢 [scheduleDAL] Kết nối Backend API thành công, nhận', data.length, 'lịch học.');
      return {
        data,
        isLiveApi: true,
      };
    } catch (err: any) {
      console.warn('🟡 [scheduleDAL] Backend API không phản hồi, tự động dùng mockData:', err.message);

      const fallbackData: ClassScheduleDto[] = MOCK_CLASS_SCHEDULES.map((s) => {
        const cls = MOCK_CLASSES.find((c) => c.classId === s.classId);
        return {
          scheduleId: s.scheduleId,
          classId: s.classId,
          className: cls?.className || '[FE-Mock] Lớp học',
          dayOfWeek: s.dayOfWeek,
          startTime: s.startTime,
          endTime: s.endTime,
          room: s.room || cls?.room || 'P.A101',
        };
      });

      return {
        data: fallbackData,
        isLiveApi: false,
        error: 'Backend API chưa bật (Đang dùng dữ liệu dự phòng mockData)',
      };
    }
  },

  /**
   * Lấy chi tiết lịch học theo ID
   */
  async getScheduleById(id: number): Promise<ClassScheduleDto | null> {
    try {
      return await scheduleApi.getById(id);
    } catch (err) {
      console.warn(`🟡 [scheduleDAL] Không thể gọi API cho lịch #${id}, tìm trong mockData:`, err);
      const found = MOCK_CLASS_SCHEDULES.find((s) => s.scheduleId === id);
      if (!found) return null;
      const cls = MOCK_CLASSES.find((c) => c.classId === found.classId);
      return {
        scheduleId: found.scheduleId,
        classId: found.classId,
        className: cls?.className || '[FE-Mock] Lớp học',
        dayOfWeek: found.dayOfWeek,
        startTime: found.startTime,
        endTime: found.endTime,
        room: found.room || cls?.room || 'P.A101',
      };
    }
  },
};

export default scheduleDAL;
