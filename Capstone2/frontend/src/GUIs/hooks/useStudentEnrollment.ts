import { useEffect, useRef, useState } from "react";
import { classApi } from "../../api/classApi";
import type { ClassDto } from "../../BLL/models/ClassDto";
import { eligibleEnrollmentClasses, toggleEnrollmentClass } from "../../BLL/services/studentEnrollmentService";

type EnrollmentState = {
  requestKey: string;
  gradeId: number | null;
  classes: ClassDto[];
  selected: number[];
  loading: boolean;
  error: string | null;
};
const empty = (gradeId: number | null, requestKey: string): EnrollmentState => ({ requestKey, gradeId, classes: [], selected: [], loading: gradeId != null, error: null });
const attemptKey = "edutrack:add-student:attempt";

export function useStudentEnrollment(gradeId: number | null, enabled: boolean) {
  const [reload, setReload] = useState(0);
  const requestKey = `${enabled}:${reload}:${gradeId}`;
  const [state, setState] = useState<EnrollmentState>(() => empty(gradeId, requestKey));
  // Reset this component's state before rendering a new form/grade/reload.
  if (state.requestKey !== requestKey) setState(empty(gradeId, requestKey));
  const attemptCode = useRef<string | null>(null);
  useEffect(() => {
    let current = true;
    if (!enabled || gradeId == null) return;
    const selectedGradeId = gradeId;
    async function load() {
      try {
        const classes = await classApi.getAll();
        if (current) setState({requestKey, gradeId: selectedGradeId, classes: eligibleEnrollmentClasses(classes, selectedGradeId), selected: [], loading: false, error: null});
      } catch (error) {
        if (current) setState({...empty(gradeId, requestKey), loading: false, error: error instanceof Error ? error.message : "Failed to load class list."});
      }
    }
    void load();
    return () => { current = false; };
  }, [gradeId, enabled, requestKey]);

  // Hide the old grade immediately, including before the effect runs.
  const visible = enabled && state.requestKey === requestKey ? state : empty(gradeId, requestKey);
  return {
    ...visible,
    retry: () => setReload(value => value + 1),
    toggle: (id: number, checked: boolean) => setState(previous =>
      previous.requestKey === requestKey && previous.classes.some(c => c.classId === id)
        ? {...previous, selected: toggleEnrollmentClass(previous.selected, id, checked)} : previous),
    selectAll: (checked: boolean) => setState(previous => previous.requestKey === requestKey
      ? {...previous, selected: checked ? previous.classes.map(c => c.classId) : []} : previous),
    creationCode: () => {
      if (!attemptCode.current) {
        try { attemptCode.current = sessionStorage.getItem(attemptKey); } catch { /* Memory fallback when storage is unavailable. */ }
        attemptCode.current ??= `STU${crypto.randomUUID().replaceAll("-", "").slice(0, 17).toUpperCase()}`;
        try { sessionStorage.setItem(attemptKey, attemptCode.current); } catch { /* The mounted form still retains its identity. */ }
      }
      return attemptCode.current;
    },
    saved: () => {
      attemptCode.current = null;
      try { sessionStorage.removeItem(attemptKey); } catch { /* Storage may be disabled. */ }
      setState(empty(gradeId, requestKey));
    },
  };
}
