import { progressApi } from '../api/progressApi';
import type { AttendanceDto, ProgressNoteDto } from '../BLL/models/ProgressDto';
import { MOCK_ATTENDANCES } from './mockData/mockAttendance';
import { MOCK_PROGRESS_NOTES } from './mockData/mockProgressNotes';
import { MOCK_USERS } from './mockData/mockUsers';
import { MOCK_CLASSES } from './mockData/mockClasses';

export interface AttendancesFetchResult {
  data: AttendanceDto[];
  isLiveApi: boolean;
  error?: string | null;
}

export interface ProgressNotesFetchResult {
  data: ProgressNoteDto[];
  isLiveApi: boolean;
  error?: string | null;
}

export const progressDAL = {
  /**
   * Lấy toàn bộ danh sách điểm danh (có Fallback)
   */
  async getAllAttendances(): Promise<AttendancesFetchResult> {
    try {
      const data = await progressApi.getAllAttendances();
      console.log('🟢 [progressDAL] Kết nối Backend Attendances thành công, nhận', data.length, 'bản ghi.');
      return {
        data,
        isLiveApi: true,
      };
    } catch (err: any) {
      console.warn('🟡 [progressDAL] Backend API Attendances không phản hồi, tự động dùng mockData:', err.message);

      const fallback: AttendanceDto[] = MOCK_ATTENDANCES.map((att) => {
        const student = MOCK_USERS.find((u) => u.userId === att.studentId);
        const recorder = MOCK_USERS.find((u) => u.userId === att.recordedBy);
        return {
          attendanceId: att.attendanceId,
          sessionId: att.sessionId,
          sessionDate: '2026-09-08',
          classId: 1,
          className: '[FE-Mock] Lớp Toán Nâng Cao',
          studentId: att.studentId,
          studentName: student?.fullName || 'Học sinh',
          studentCode: student?.userCode || `STU${att.studentId}`,
          status: att.status,
          note: att.note,
          recordedBy: att.recordedBy,
          recorderName: recorder?.fullName || 'Giáo viên',
          recordedAt: att.recordedAt,
        };
      });

      return {
        data: fallback,
        isLiveApi: false,
        error: 'Backend API chưa bật (Đang dùng dữ liệu dự phòng mockData)',
      };
    }
  },

  /**
   * Lấy toàn bộ danh sách nhận xét tiến độ (có Fallback)
   */
  async getAllProgressNotes(): Promise<ProgressNotesFetchResult> {
    try {
      const data = await progressApi.getAllProgressNotes();
      console.log('🟢 [progressDAL] Kết nối Backend ProgressNotes thành công, nhận', data.length, 'nhận xét.');
      return {
        data,
        isLiveApi: true,
      };
    } catch (err: any) {
      console.warn('🟡 [progressDAL] Backend API ProgressNotes không phản hồi, tự động dùng mockData:', err.message);

      const fallback: ProgressNoteDto[] = MOCK_PROGRESS_NOTES.map((n) => {
        const student = MOCK_USERS.find((u) => u.userId === n.studentId);
        const author = MOCK_USERS.find((u) => u.userId === n.writtenBy);
        const cls = MOCK_CLASSES.find((c) => c.classId === n.classId);
        return {
          noteId: n.noteId,
          studentId: n.studentId,
          studentName: student?.fullName || 'Học sinh',
          studentCode: student?.userCode || `STU${n.studentId}`,
          classId: n.classId,
          className: cls?.className || '[FE-Mock] Lớp Toán',
          writtenBy: n.writtenBy,
          authorName: author?.fullName || 'ThS. Hoàng Quốc Việt',
          content: n.content,
          noteType: n.noteType,
          createdAt: n.createdAt,
        };
      });

      return {
        data: fallback,
        isLiveApi: false,
        error: 'Backend API chưa bật (Đang dùng dữ liệu dự phòng mockData)',
      };
    }
  },

  /**
   * Lấy chi tiết điểm danh theo ID
   */
  async getAttendanceById(id: number): Promise<AttendanceDto | null> {
    try {
      return await progressApi.getAttendanceById(id);
    } catch (err: any) {
      console.warn(`🟡 [progressDAL] Backend API Attendance #${id} không phản hồi, dùng mockData:`, err.message);
      const all = await this.getAllAttendances();
      const found = all.data.find((a) => a.attendanceId === id);
      return found || null;
    }
  },

  getAll(): Promise<AttendancesFetchResult> {
    return this.getAllAttendances();
  },

  getById(id: number): Promise<AttendanceDto | null> {
    return this.getAttendanceById(id);
  },
};

export default progressDAL;
