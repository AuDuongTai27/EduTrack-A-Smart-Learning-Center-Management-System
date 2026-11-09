export type ScheduleChangeKind = 'reschedule' | 'cancel' | 'makeup';
export interface ScheduleChangeCapabilities {currentUserId: number; canPreview: boolean; canSubmit: boolean; canReview: boolean; canApply: boolean; canViewAll: boolean; blocker: string | null}
export interface ScheduleChangeActual {sessionDate: string; startTime: string; endTime: string; room: string | null; status: string}
export interface ScheduleChangeSession {sessionId: number; classId: number; className: string; scheduleId: number; scheduleVersionId: number; plannedOccurrenceDate: string; occurrenceWeekStart: string; actual: ScheduleChangeActual; hasAttendance: boolean}
export interface ScheduleChangeRequest {requestId: number; requestCode: string; requestedBy: number; reviewedBy: number | null; status: 'pending' | 'approved' | 'rejected'; changeKind: ScheduleChangeKind;
  reason: string; reviewNotes: string | null; clientRequestKey: string; createdAt: string; reviewedAt: string | null; appliedAt: string | null; original: ScheduleChangeActual; proposed: ScheduleChangeActual | null; session: ScheduleChangeSession}
export interface ScheduleChangeInput {sessionId: number; changeKind: ScheduleChangeKind; proposedSessionDate: string | null; proposedStartTime: string | null; proposedEndTime: string | null; proposedRoom: string | null; reason: string; clientRequestKey: string; previewToken?: string}
export interface ScheduleDecisionInput {decision: 'approved' | 'rejected'; reviewNotes: string | null; previewToken?: string}
export interface ScheduleChangePreview {previewToken: string; allowed: boolean; reasons: string[]; session: ScheduleChangeSession; proposed: ScheduleChangeActual | null; request: ScheduleChangeRequest | null}
