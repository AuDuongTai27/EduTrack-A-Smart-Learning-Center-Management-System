import type { ClassSchedule } from '../../BLL/models/ClassSchedule';
import type { ClassSession } from '../../BLL/models/ClassSession';

/**
 * Dữ liệu mẫu thời khóa biểu cố định bám sát DbSeeder.cs (bảng class_schedules)
 */
export const MOCK_CLASS_SCHEDULES: ClassSchedule[] = [
  {
    scheduleId: 1,
    classId: 1,
    dayOfWeek: 'monday',
    startTime: '18:00:00',
    endTime: '20:00:00',
    room: 'Room 201',
  },
  {
    scheduleId: 2,
    classId: 1,
    dayOfWeek: 'wednesday',
    startTime: '18:00:00',
    endTime: '20:00:00',
    room: 'Room 201',
  },
  {
    scheduleId: 3,
    classId: 2,
    dayOfWeek: 'tuesday',
    startTime: '18:00:00',
    endTime: '20:00:00',
    room: 'Room 202',
  },
  {
    scheduleId: 4,
    classId: 2,
    dayOfWeek: 'thursday',
    startTime: '18:00:00',
    endTime: '20:00:00',
    room: 'Room 202',
  },
];

/**
 * Dữ liệu mẫu các buổi học cụ thể bám sát DbSeeder.cs (bảng class_sessions)
 */
export const MOCK_CLASS_SESSIONS: ClassSession[] = [
  {
    sessionId: 1,
    classId: 1,
    scheduleId: 1,
    sessionDate: '2026-09-08',
    startTime: '18:00:00',
    endTime: '20:00:00',
    room: 'Room 201',
    status: 'completed',
  },
  {
    sessionId: 2,
    classId: 1,
    scheduleId: 2,
    sessionDate: '2026-09-10',
    startTime: '18:00:00',
    endTime: '20:00:00',
    room: 'Room 201',
    status: 'completed',
  },
  {
    sessionId: 3,
    classId: 1,
    scheduleId: 1,
    sessionDate: '2026-09-15',
    startTime: '18:00:00',
    endTime: '20:00:00',
    room: 'Room 201',
    status: 'scheduled',
  },
  {
    sessionId: 4,
    classId: 2,
    scheduleId: 3,
    sessionDate: '2026-09-09',
    startTime: '18:00:00',
    endTime: '20:00:00',
    room: 'Room 202',
    status: 'completed',
  },
  {
    sessionId: 5,
    classId: 2,
    scheduleId: 4,
    sessionDate: '2026-09-11',
    startTime: '18:00:00',
    endTime: '20:00:00',
    room: 'Room 202',
    status: 'scheduled',
  },
];
