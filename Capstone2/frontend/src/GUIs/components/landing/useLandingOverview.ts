import { useCallback, useEffect, useState } from 'react';
import { landingDAL } from '../../../DAL/landingDAL';
import type { LandingOverviewDto } from '../../../BLL/models/LandingOverviewDto';
import type { DataStatus } from './LandingUI';
export function useLandingOverview() {
  const [data, setData] = useState<LandingOverviewDto>();
  const [status, setStatus] = useState<DataStatus>('loading');
  const [attempt, setAttempt] = useState(0);
  const retry = useCallback(() => {
    setStatus('loading'); setData(undefined); setAttempt(n => n + 1);
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    landingDAL.getLandingOverview(controller.signal).then(result => {
      if (!controller.signal.aborted) { setData(result.data); setStatus('ready'); }
    }).catch(() => { if (!controller.signal.aborted) setStatus('error'); });
    return () => controller.abort();
  }, [attempt]);
  return { data, status, retry };
}
export type LandingContext = ReturnType<typeof useLandingOverview>;
