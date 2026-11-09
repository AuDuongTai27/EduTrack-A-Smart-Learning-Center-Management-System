import { scheduleSessionApi } from '../api/scheduleSessionApi.ts';

// An empty response stays empty. Network/auth/contract errors propagate to the view.
export const scheduleSessionDAL = {
  getWeek: (from: string, toExclusive: string, signal?: AbortSignal) => scheduleSessionApi.getWeek(from, toExclusive, signal),
};
