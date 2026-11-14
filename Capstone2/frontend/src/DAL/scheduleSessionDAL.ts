import { scheduleSessionApi } from '../api/scheduleSessionApi.ts';

// An empty response stays empty. Network/auth/contract errors propagate to the view.
export const scheduleSessionDAL = {
  getWeek: (from: string, toExclusive: string, signal?: AbortSignal, userId?: number) =>
    scheduleSessionApi.getWeek(from, toExclusive, signal, userId),
  getClasses: (signal?: AbortSignal, userId?: number) =>
    scheduleSessionApi.getClasses(signal, userId),
};
