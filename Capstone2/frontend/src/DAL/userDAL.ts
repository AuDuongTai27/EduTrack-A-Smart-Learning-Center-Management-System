import { userApi } from '../api/userApi';
import type { UserDto } from '../BLL/models/UserDto';
import { MOCK_USERS } from './mockData/mockUsers';

export interface UsersFetchResult {
  data: UserDto[];
  isLiveApi: boolean;
  error?: string | null;
}

/** Users query DAL. Falls back to mock data if API fails. */
export const userDAL = {
  async getAllUsers(): Promise<UsersFetchResult> {
    try {
      const data = await userApi.getAll();
      return { data, isLiveApi: true };
    } catch {
      return {
        data: MOCK_USERS as unknown as UserDto[],
        isLiveApi: false,
      };
    }
  },

  async getUserById(id: number): Promise<UserDto | null> {
    try {
      return await userApi.getById(id);
    } catch {
      const fallback = MOCK_USERS.find((u) => u.userId === id);
      return (fallback as unknown as UserDto) || null;
    }
  },
};

export default userDAL;
