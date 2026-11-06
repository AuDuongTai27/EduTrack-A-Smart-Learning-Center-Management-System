import { useCallback, useEffect, useState } from "react";
import classDAL from "../../DAL/classDAL";
import subjectDAL from "../../DAL/subjectDAL";
import { classManagementApi } from "../../api/classManagementApi";
import { classError } from "../../BLL/services/classManagementService";
import type { ClassQuery, ClassDetailData } from "../../BLL/models/ClassManagement";
import type { ClassDto } from "../../BLL/models/ClassDto";
import type { SubjectDto } from "../../BLL/models/SubjectDto";

const initial = <T>(): ClassQuery<T> => ({data: null, loading: true, error: null});
async function read<T>(request: () => Promise<T>): Promise<ClassQuery<T>> {
  try { return {data: await request(), loading: false, error: null}; }
  catch (cause) { return {data: null, loading: false, error: classError(cause)}; }
}
export function useClassManagement() {
  const [classes, setClasses] = useState<ClassQuery<ClassDto[]>>(initial);
  const [subjects, setSubjects] = useState<ClassQuery<SubjectDto[]>>(initial);
  const [revision, setRevision] = useState(0);
  const refresh = useCallback(() => setRevision(value => value + 1), []);
  useEffect(() => {
    let active = true;
    setClasses(initial()); setSubjects(initial());
    void read(async () => (await classDAL.getAllClasses()).data).then(result => {if (active) setClasses(result);});
    void read(async () => {
      const result = await subjectDAL.getAllSubjects();
      if (!Array.isArray(result.data)) throw new Error("Danh sách môn học không hợp lệ.");
      return result.data;
    }).then(result => {if (active) setSubjects(result);});
    return () => {active = false;};
  }, [revision]);
  return {classes, subjects, refresh};
}

type DetailState = {[K in keyof ClassDetailData]: ClassQuery<ClassDetailData[K]>};
const detailInitial = (): DetailState => ({overview: initial(), students: initial(), teachers: initial(),
  assistants: initial(), schedules: initial(), sessions: initial()});
export function useClassDetails(classId: number) {
  const [state, setState] = useState<{id: number; sections: DetailState}>(() => ({id: classId, sections: detailInitial()}));
  const [revision, setRevision] = useState(0);
  const refresh = useCallback(() => setRevision(value => value + 1), []);
  useEffect(() => {
    let active = true;
    setState({id: classId, sections: detailInitial()});
    const publish = <K extends keyof ClassDetailData>(key: K, result: ClassQuery<ClassDetailData[K]>) => {
      if (active) setState(previous => ({id: classId, sections: {...previous.sections, [key]: result}}));
    };
    void read(async () => {
      if (!Number.isSafeInteger(classId) || classId <= 0) throw new Error("Mã lớp học không hợp lệ.");
      const item = await classDAL.getClassById(classId);
      if (!item) throw new Error("Không tìm thấy lớp học.");
      return item;
    }).then(overview => {
      if (!active) return;
      publish("overview", overview);
      if (!overview.data) return;
      for (const kind of ["students", "teachers", "assistants", "schedules", "sessions"] as const)
        void read(() => classManagementApi.getRelation(kind, classId)).then(result => publish(kind, result));
    });
    return () => {active = false;};
  }, [classId, revision]);
  return {sections: Object.is(state.id, classId) ? state.sections : detailInitial(), refresh};
}
