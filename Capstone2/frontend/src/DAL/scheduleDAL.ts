import { scheduleApi } from '../api/scheduleApi';
import type { ClassScheduleDto } from '../BLL/models/ClassScheduleDto';

export interface SchedulesFetchResult {
  data: ClassScheduleDto[];
  isLiveApi: boolean;
  error?: string | null;
}

/** Class schedules query DAL. Errors propagate instead of using mock sessions. */
export const scheduleDAL = {
  async getAllClassSchedules(): Promise<SchedulesFetchResult> {
    const data = await scheduleApi.getAll();
    return { data, isLiveApi: true };
  },

  async getScheduleById(id: number): Promise<ClassScheduleDto | null> {
    return scheduleApi.getById(id);
  },

  getAll(): Promise<SchedulesFetchResult> {
    return this.getAllClassSchedules();
  },
};

export default scheduleDAL;
