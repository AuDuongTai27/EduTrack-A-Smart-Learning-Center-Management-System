import type { AttendanceDto, ProgressNoteDto } from '../BLL/models/ProgressDto';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const progressApi = {
  /**
   * GET /api/attendances
   */
  async getAllAttendances(): Promise<AttendanceDto[]> {
    const res = await fetch(`${API_BASE_URL}/attendances`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error(`HTTP Error ${res.status}: ${res.statusText}`);
    }

    return await res.json();
  },

  /**
   * GET /api/attendances/{id}
   */
  async getAttendanceById(id: number): Promise<AttendanceDto> {
    const res = await fetch(`${API_BASE_URL}/attendances/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error(`HTTP Error ${res.status}: ${res.statusText}`);
    }

    return await res.json();
  },

  /**
   * GET /api/progressnotes
   */
  async getAllProgressNotes(): Promise<ProgressNoteDto[]> {
    const res = await fetch(`${API_BASE_URL}/progressnotes`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error(`HTTP Error ${res.status}: ${res.statusText}`);
    }

    return await res.json();
  },

  /**
   * GET /api/progressnotes/{id}
   */
  async getProgressNoteById(id: number): Promise<ProgressNoteDto> {
    const res = await fetch(`${API_BASE_URL}/progressnotes/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error(`HTTP Error ${res.status}: ${res.statusText}`);
    }

    return await res.json();
  },
};

export default progressApi;
