export interface AttendanceDto {
  attendanceId: number;
  sessionId: number;
  sessionDate?: string | null;
  classId?: number | null;
  className?: string | null;
  studentId: number;
  studentName: string;
  studentCode: string;
  status: string;
  note?: string | null;
  recordedBy: number;
  recorderName: string;
  recordedAt: string;
}

export interface ProgressNoteDto {
  noteId: number;
  studentId: number;
  studentName: string;
  studentCode: string;
  classId: number;
  className: string;
  writtenBy: number;
  authorName: string;
  content: string;
  noteType: string;
  createdAt: string;
}
