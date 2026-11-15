import { useState } from 'react';
import { getLocalClasses } from './landingStaticData';
export function useLandingClasses(subjectId: number | null) {
  const [pagination, setPagination] = useState({ subjectId, page: 1 });
  if (pagination.subjectId !== subjectId) setPagination({ subjectId, page: 1 });
  const page = pagination.subjectId === subjectId ? pagination.page : 1;
  return { ...getLocalClasses(subjectId, page),
    loadMore: () => setPagination(previous => ({ subjectId, page: previous.subjectId === subjectId ? previous.page + 1 : 1 })),
  };
}
