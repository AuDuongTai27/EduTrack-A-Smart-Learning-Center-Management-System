const BASE_URL = import.meta.env?.VITE_API_URL || '/api';

export interface AuthUserDto {
  userId: number;
  userCode: string;
  fullName: string;
  email?: string | null;
  phone?: string | null;
  avatarUrl?: string | null;
  status: string;
  gradeId?: number | null;
  gradeName?: string | null;
  specialty?: string | null;
  roles: string[];
  primaryRole: string;
  redirectPath: string;
}

export interface LoginResponseDto {
  success: boolean;
  message: string;
  token: string;
  user?: AuthUserDto | null;
}

const TOKEN_STORAGE_KEY = 'edutrack_auth_token';
const USER_STORAGE_KEY = 'edutrack_auth_user';

const authListeners = new Set<() => void>();
let cachedRawUser: string | null = null;
let cachedAuthUser: AuthUserDto | null = null;
let fetchInterceptorInstalled = false;

function notifyAuthListeners() {
  authListeners.forEach((listener) => listener());
}

export function subscribeAuth(listener: () => void): () => void {
  authListeners.add(listener);
  return () => {
    authListeners.delete(listener);
  };
}

export function getAuthToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function getAuthUser(): AuthUserDto | null {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    if (!raw) {
      cachedRawUser = null;
      cachedAuthUser = null;
      return null;
    }
    if (raw === cachedRawUser) {
      return cachedAuthUser;
    }
    const parsed = JSON.parse(raw) as AuthUserDto;
    if (parsed && typeof parsed.userId === 'number' && parsed.userId > 0) {
      cachedRawUser = raw;
      cachedAuthUser = parsed;
      return cachedAuthUser;
    }
    cachedRawUser = null;
    cachedAuthUser = null;
    return null;
  } catch {
    return null;
  }
}

export function getAuthHeaders(): Record<string, string> {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function saveAuthSession(token: string, user: AuthUserDto): void {
  try {
    const serialized = JSON.stringify(user);
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
    localStorage.setItem(USER_STORAGE_KEY, serialized);
    cachedRawUser = serialized;
    cachedAuthUser = user;
    if (user.primaryRole) {
      localStorage.setItem(`edutrack-selected-user:${user.primaryRole}`, String(user.userId));
    }
    for (const r of user.roles || []) {
      const norm = r === 'ta' ? 'teaching_assistant' : r;
      localStorage.setItem(`edutrack-selected-user:${norm}`, String(user.userId));
    }
  } catch {
    cachedAuthUser = user;
  }
  notifyAuthListeners();
}

export function clearAuthSession(): void {
  try {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
  } catch {
    // Ignore storage errors
  }
  cachedRawUser = null;
  cachedAuthUser = null;
  notifyAuthListeners();
}

/**
 * Tự động đính kèm header Authorization: Bearer <token> cho toàn bộ request gọi tới /api/*
 * và tự động xóa phiên đăng nhập nếu máy chủ trả về 401 Unauthorized.
 */
export function installAuthFetchInterceptor(): void {
  if (fetchInterceptorInstalled || typeof window === 'undefined' || typeof window.fetch !== 'function') {
    return;
  }
  fetchInterceptorInstalled = true;
  const originalFetch = window.fetch.bind(window);

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const requestUrl =
      typeof input === 'string'
        ? input
        : input instanceof URL
          ? input.toString()
          : input.url;

    const isApiCall =
      requestUrl.startsWith('/api') ||
      requestUrl.startsWith(BASE_URL) ||
      requestUrl.includes('/api/');

    if (!isApiCall) {
      return originalFetch(input, init);
    }

    const token = getAuthToken();
    let nextInit = init;

    if (token) {
      const headers = new Headers(
        init?.headers ?? (input instanceof Request ? input.headers : undefined)
      );
      if (!headers.has('Authorization')) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      nextInit = {
        ...init,
        headers,
      };
    }

    const response = await originalFetch(input, nextInit);

    const isLoginEndpoint = requestUrl.includes('/api/auth/login');
    if (response.status === 401 && !isLoginEndpoint && token) {
      clearAuthSession();
    }

    return response;
  };
}

installAuthFetchInterceptor();

/**
 * Lấy userId của người dùng đang đăng nhập theo đúng vai trò (Role),
 * hoặc lấy từ bộ nhớ chọn user nếu đang test, fallback về ID mặc định.
 */
export function resolveActiveUserId(role: string, fallbackId: number): number {
  const normRole = role === 'ta' ? 'teaching_assistant' : role;
  const authUser = getAuthUser();
  if (
    authUser &&
    authUser.userId > 0 &&
    (authUser.primaryRole === normRole ||
      authUser.roles?.some((r) => (r === 'ta' ? 'teaching_assistant' : r) === normRole))
  ) {
    return authUser.userId;
  }

  try {
    const stored = Number(localStorage.getItem(`edutrack-selected-user:${normRole}`));
    if (Number.isSafeInteger(stored) && stored > 0) {
      return stored;
    }
  } catch {
    // Ignore
  }

  return fallbackId;
}

export const authApi = {
  async login(identifier: string, password: string): Promise<LoginResponseDto> {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        identifier: identifier.trim(),
        password,
      }),
    });

    let payload: LoginResponseDto | null = null;
    try {
      payload = (await response.json()) as LoginResponseDto;
    } catch {
      payload = null;
    }

    if (!response.ok || !payload?.success || !payload.user) {
      throw new Error(
        payload?.message || `Đăng nhập thất bại (HTTP ${response.status}). Vui lòng kiểm tra lại thông tin.`
      );
    }

    saveAuthSession(payload.token, payload.user);
    return payload;
  },

  async getMe(): Promise<AuthUserDto | null> {
    const token = getAuthToken();
    if (!token) return null;

    const response = await fetch(`${BASE_URL}/auth/me`, {
      method: 'GET',
      headers: {
        ...getAuthHeaders(),
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        clearAuthSession();
      }
      return null;
    }

    const user = (await response.json()) as AuthUserDto;
    if (user && user.userId > 0) {
      saveAuthSession(token, user);
      return user;
    }
    return null;
  },

  logout(): void {
    clearAuthSession();
  },
};
