import { useCallback, useEffect, useState } from 'react';
import { landingDAL } from '../../../DAL/landingDAL';
import type { LandingClassesPageDto, LandingCourseItemDto } from '../../../BLL/models/LandingOverviewDto';

type PageState = { subjectId: number | null; page: number; data?: LandingClassesPageDto; items: LandingCourseItemDto[]; error: boolean };
export function useLandingClasses(subjectId: number | null) {
  const [request, setRequest] = useState({ subjectId, page: 1, attempt: 0 });
  const [result, setResult] = useState<PageState>();
  // Reset the request during render when the controlled subject changes. React
  // discards this render before effects, preventing requests for the previous filter.
  if (request.subjectId !== subjectId) setRequest({ subjectId, page: 1, attempt: 0 });
  const [pendingKey, setPendingKey] = useState('');
  const key = `${request.subjectId}:${request.page}:${request.attempt}`;
  useEffect(() => {
    const controller = new AbortController();
    landingDAL.getClasses(request.subjectId, request.page, controller.signal).then(data => {
      if (controller.signal.aborted) return;
      setResult(previous => ({ subjectId: request.subjectId, page: request.page, data, error: false,
        items: request.page > 1 && previous?.subjectId === request.subjectId
          ? [...previous.items, ...data.items.filter(c => !previous.items.some(p => p.classId === c.classId))] : data.items }));
      setPendingKey(key);
    }).catch(() => {
      if (controller.signal.aborted) return;
      setResult(previous => ({ subjectId: request.subjectId, page: request.page, data: previous?.subjectId === request.subjectId ? previous.data : undefined,
        items: previous?.subjectId === request.subjectId ? previous.items : [], error: true }));
      setPendingKey(key);
    });
    return () => controller.abort();
  }, [request, key]);
  const retry = useCallback(() => setRequest(r => ({ ...r, attempt: r.attempt + 1 })), []);
  const loadMore = () => setRequest(r => ({ ...r, page: r.page + 1 }));
  const loading = pendingKey !== key || request.subjectId !== subjectId;
  const current = result?.subjectId === subjectId ? result : undefined;
  return { items: current?.items ?? [], hasMore: current?.data?.hasMore ?? false, totalCount: current?.data?.totalCount ?? 0,
    loading, error: !loading && Boolean(current?.error), retry, loadMore };
}
