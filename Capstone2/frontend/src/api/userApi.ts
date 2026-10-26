import type { UserDto } from '../BLL/models/UserDto';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const userApi = {
  /**
   * GET /api/users
   */
  async getAll(): Promise<UserDto[]> {
    const res = await fetch(`${API_BASE_URL}/users`, {
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
   * GET /api/users/{id}
   */
  async getById(id: number): Promise<UserDto> {
    const res = await fetch(`${API_BASE_URL}/users/${id}`, {
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
   * POST /api/users
   */
  async create(data: {
    userCode?: string;
    fullName: string;
    email?: string;
    phone?: string;
    role: string;
    specialty?: string;
    gender?: string;
  }): Promise<UserDto> {
    const res = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody.message || `HTTP Error ${res.status}: ${res.statusText}`);
    }

    return await res.json();
  },

  /**
   * PUT /api/users/{id}
   */
  async update(
    id: number,
    data: {
      fullName: string;
      email?: string;
      phone?: string;
      role?: string;
      specialty?: string;
      gender?: string;
      status?: string;
    }
  ): Promise<UserDto> {
    const res = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody.message || `HTTP Error ${res.status}: ${res.statusText}`);
    }

    return await res.json();
  },

  /**
   * PATCH /api/users/{id}/status
   */
  async updateStatus(id: number, status: string): Promise<{ success: boolean; status: string; message: string }> {
    const res = await fetch(`${API_BASE_URL}/users/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody.message || `HTTP Error ${res.status}: ${res.statusText}`);
    }

    return await res.json();
  },

  /**
   * DELETE /api/users/{id}
   */
  async delete(id: number): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody.message || `HTTP Error ${res.status}: ${res.statusText}`);
    }

    return await res.json();
  },
};

export default userApi;

