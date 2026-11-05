import { userApi } from '../api/userApi';
import type { UserDto } from '../BLL/models/UserDto';

export interface UsersFetchResult {
  data: UserDto[];
  isLiveApi: boolean;
  error?: string | null;
}

/** Users query DAL. API failures propagate; there is no mock fallback. */
export const userDAL = {
  async getAllUsers(): Promise<UsersFetchResult> {
    const data = await userApi.getAll();
    return { data, isLiveApi: true };
  },

  async getUserById(id: number): Promise<UserDto | null> {
    return userApi.getById(id);
  },
};

export default userDAL;
