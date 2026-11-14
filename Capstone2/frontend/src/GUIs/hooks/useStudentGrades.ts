import { useEffect, useState } from "react";
import { gradeApi } from "../../api/gradeApi";
import type { GradeDto } from "../../BLL/models/GradeDto";
import { sortedStudentGrades } from "../../BLL/services/studentGradeService";

export function useStudentGrades() {
  const [revision, setRevision] = useState(0);
  const [state, setState] = useState<{ grades: GradeDto[]; loading: boolean; loaded: boolean; error: string | null }>({ grades: [], loading: true, loaded: false, error: null });
  useEffect(() => {
    let current = true;
    void gradeApi.getAll().then(grades => {
      if (current) setState({ grades: sortedStudentGrades(grades), loading: false, loaded: true, error: null });
    }, error => {
      if (current) setState(previous => ({ ...previous, loading: false, error: error instanceof Error ? error.message : "Failed to load grade list." }));
    });
    const focus = () => setRevision(value => value + 1);
    window.addEventListener("focus", focus);
    return () => { current = false; window.removeEventListener("focus", focus); };
  }, [revision]);
  return { ...state, refresh: () => setRevision(value => value + 1) };
}
