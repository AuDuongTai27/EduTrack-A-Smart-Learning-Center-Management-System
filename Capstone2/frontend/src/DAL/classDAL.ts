import { classApi } from "../api/classApi";
import type { ClassDto } from "../BLL/models/ClassDto";

export interface ClassesFetchResult {
  data: ClassDto[];
  isLiveApi: boolean;
  error?: string | null;
}

/** Classes query DAL. API errors are never disguised as mock records. */
export const classDAL = {
  async getAllClasses(): Promise<ClassesFetchResult> {
    const data = await classApi.getAll();
    return { data, isLiveApi: true };
  },

  async getClassById(id: number): Promise<ClassDto | null> {
    return classApi.getById(id);
  },

  getAll(): Promise<ClassesFetchResult> {
    return this.getAllClasses();
  },

  getById(id: number): Promise<ClassDto | null> {
    return this.getClassById(id);
  },
};

export default classDAL;
