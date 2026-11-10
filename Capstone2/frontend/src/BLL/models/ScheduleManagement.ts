import type {SchedulePerson} from './ScheduleSession';

export interface ScheduleClassOption {
  classId: number;
  className: string;
  status: string;
  startDate: string;
  endDate: string | null;
  subjectName?: string | null;
  room?: string | null;
  teachers?: SchedulePerson[];
  teachingAssistants?: SchedulePerson[];
  scheduleSummary?: string[];
  totalSessions?: number;
}

export interface DirectSessionUpdateInput {
  sessionDate: string;
  startTime: string;
  endTime: string;
  room?: string | null;
  reason?: string | null;
}

export interface DirectSessionCreateInput {
  classId: number;
  sessionDate: string;
  startTime: string;
  endTime: string;
  room?: string | null;
  reason?: string | null;
}
export interface ScheduleCapabilities {canManageTemplates: boolean; canCreateSessions: boolean; classes: ScheduleClassOption[]; earliestEffectiveFrom: string}
export interface ScheduleVersion {scheduleVersionId: number; effectiveFrom: string; effectiveTo: string | null; dayOfWeek: string; startTime: string; endTime: string; room: string | null}
export interface ScheduleTemplate {
  scheduleId: number; classId: number; dayOfWeek: string; startTime: string; endTime: string;
  room: string | null; hasSessions: boolean; version: string; versions: ScheduleVersion[];
}
export interface ScheduleTemplateInput {
  classId: number; scheduleId?: number; operation: 'create' | 'replace' | 'retire'; effectiveFrom: string;
  dayOfWeek: string; startTime: string; endTime: string; room: string | null; version?: string; previewToken?: string;
}
export interface ScheduleAffectedSession {sessionId: number; scheduleVersionId: number; plannedOccurrenceDate: string; occurrenceWeekStart: string; sessionDate: string; startTime: string; endTime: string; room: string | null; status: string; hasAttendance: boolean}
export interface ScheduleTemplatePreview {previewToken: string; operation: string; effectiveFrom: string; retainedSessions: ScheduleAffectedSession[]; message: string; template: ScheduleTemplate | null}
export interface ScheduleGenerationInput {
  classId: number; mode: 'single' | 'month'; scheduleId?: number; sessionDate?: string; year?: number; month?: number;
  previewToken?: string; selectedKeys?: string[];
}
export type ScheduleGenerationOutcome = 'eligible' | 'existing' | 'conflict' | 'outside_class' | 'created';
export interface ScheduleGenerationRow {
  key: string; scheduleId: number; classId: number; sessionDate: string; startTime: string; endTime: string;
  room: string | null; outcome: ScheduleGenerationOutcome; reason: string; sessionId: number | null;
  plannedOccurrenceDate: string; occurrenceWeekStart: string; scheduleVersionId: number; proposedPlannedDate: string | null; status: string;
}
export interface ScheduleGenerationPreview {previewToken: string; rows: ScheduleGenerationRow[]; created: number}
