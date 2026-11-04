import { parentStudentApi, type ParentStudentDto } from '../api/parentStudentApi';

export interface ParentStudentsFetchResult {
  data: ParentStudentDto[];
  isLiveApi: boolean;
  error?: string | null;
}

/** Legacy Parent/Student link query DAL. Kept for compatibility without mocks. */
export const parentStudentDAL = {
  async getAllLinks(): Promise<ParentStudentsFetchResult> {
    const data = await parentStudentApi.getAll();
    return { data, isLiveApi: true };
  },
};

export default parentStudentDAL;
