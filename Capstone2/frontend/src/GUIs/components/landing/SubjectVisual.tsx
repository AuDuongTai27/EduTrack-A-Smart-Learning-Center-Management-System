import { useState } from 'react';
import { subjectInfo } from './landingContent';
import { Icon } from './LandingUI';
export function SubjectVisual({ code }: { code: string }) {
  const [failed, setFailed] = useState(false);
  const info = subjectInfo(code);
  const asset: Record<string, string> = { MATH: 'mathematics', PHYS: 'physics', ENG: 'english' };
  const image = asset[code?.trim().toUpperCase()];
  return <div className={`et-subject-visual et-${info.color}`}>
    {image && !failed ? <img src={`/assets/landing/${image}.webp`} loading="lazy" decoding="async" width="600" height="400" alt={`${info.name} subject illustration`} onError={() => setFailed(true)}/> : <><span className="et-orbit"/><Icon name={info.icon}/><span className="et-visual-dot"/></>}
  </div>;
}
