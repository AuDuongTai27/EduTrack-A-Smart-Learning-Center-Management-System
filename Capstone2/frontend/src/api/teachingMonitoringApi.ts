import type { ClassDto } from "../BLL/models/ClassDto";
import type { ClassScheduleDto } from "../BLL/models/ClassScheduleDto";
import type { AttendanceDto } from "../BLL/models/ProgressDto";

export interface TeacherClassAssignmentDto {
  teacherClassId: number;
  teacherId: number;
  teacherName: string;
  teacherCode: string;
  classId: number;
  className: string;
  assignedAt: string;
  status: string;
}

export interface MonitoringSessionDto {
  sessionId: number;
  classId: number;
  className: string;
  scheduleId?: number | null;
  sessionDate: string;
  startTime: string;
  endTime: string;
  room?: string | null;
  status: string;
}

export interface TeachingMonitoringData {
  classes: ClassDto[];
  schedules: ClassScheduleDto[];
  assignments: TeacherClassAssignmentDto[];
  sessions: MonitoringSessionDto[];
  attendances: AttendanceDto[];
}

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

async function getAll<T>(endpoint: string): Promise<T[]> {
  const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
    method: "GET",
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Failed to load ${endpoint} (HTTP ${response.status}).`);
  }

  const data: unknown = await response.json();
  if (!Array.isArray(data)) {
    throw new Error(`API ${endpoint} returned non-array data.`);
  }
  return data as T[];
}

/** Strict live API: never substitute mock data when a request fails. */
export const teachingMonitoringApi = {
  async getDashboardData(): Promise<TeachingMonitoringData> {
    const [classes, schedules, assignments, sessions, attendances] = await Promise.all([
      getAll<ClassDto>("classes"),
      getAll<ClassScheduleDto>("classschedules"),
      getAll<TeacherClassAssignmentDto>("teacherclasses"),
      getAll<MonitoringSessionDto>("classsessions"),
      getAll<AttendanceDto>("attendances"),
    ]);

    return { classes, schedules, assignments, sessions, attendances };
  },
};
