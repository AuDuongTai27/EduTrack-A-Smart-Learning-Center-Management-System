import { subjectApi } from '../api/subjectApi';
import type { SubjectDto } from '../BLL/models/SubjectDto';

export interface SubjectsFetchResult {
  data: SubjectDto[];
  isLiveApi: boolean;
  error?: string | null;
}

export interface SubjectDetailFetchResult {
  data: SubjectDto | null;
  isLiveApi: boolean;
  error?: string | null;
}

/** Subjects query DAL. No fake subjects on network or backend errors. */
export const subjectDAL = {
  async getAllSubjects(): Promise<SubjectsFetchResult> {
    const data = await subjectApi.getAll();
    return { data, isLiveApi: true };
  },

  async getSubjectById(id: number): Promise<SubjectDetailFetchResult> {
    const data = await subjectApi.getById(id);
    return { data, isLiveApi: true };
  },
};

export default subjectDAL;
